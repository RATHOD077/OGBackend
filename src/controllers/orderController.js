const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

async function createOrder(req, res) {
  const clientId = req.clientId;
  const { amount } = req.body;

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Positive amount required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [wallets] = await conn.execute(
      'SELECT id, balance FROM wallets WHERE client_id = ? FOR UPDATE',
      [clientId]
    );

    if (wallets.length === 0) throw new Error('Wallet not found');
    if (wallets[0].balance < amount) throw new Error('Insufficient balance');

    await conn.execute(
      'UPDATE wallets SET balance = balance - ? WHERE id = ?',
      [amount, wallets[0].id]
    );

    const ledgerId = uuidv4();
    await conn.execute(
      'INSERT INTO ledger_entries (id, client_id, wallet_id, type, amount) VALUES (?,?,?,?,?)',
      [ledgerId, clientId, wallets[0].id, 'order', amount]
    );

    const orderId = uuidv4();
    await conn.execute(
      'INSERT INTO orders (id, client_id, amount, status) VALUES (?,?,?,?)',
      [orderId, clientId, amount, 'created']
    );

    // Fake fulfillment
    let fulfillmentId = null;
    try {
      const resp = await axios.post(process.env.FULFILLMENT_URL, {
        userId: clientId,
        title: orderId
      }, { timeout: 6000 });

      fulfillmentId = String(resp.data.id || 'mock-' + Date.now());
    } catch (e) {
      console.error('Fulfillment failed:', e.message);
      await conn.execute('UPDATE orders SET status = "failed" WHERE id = ?', [orderId]);
      await conn.commit();
      return res.status(202).json({ orderId, status: 'failed', note: 'Fulfillment service unavailable' });
    }

    await conn.execute(
      'UPDATE orders SET fulfillment_id = ?, status = "fulfilled" WHERE id = ?',
      [fulfillmentId, orderId]
    );

    await conn.commit();
    res.status(201).json({ orderId, fulfillmentId, status: 'fulfilled' });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
}

async function getOrder(req, res) {
  const { order_id } = req.params;
  const clientId = req.clientId;

  try {
    const [rows] = await pool.execute(
      'SELECT id, amount, status, fulfillment_id, created_at FROM orders WHERE id = ? AND client_id = ?',
      [order_id, clientId]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Order not found or not yours' });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
}

module.exports = { createOrder, getOrder };