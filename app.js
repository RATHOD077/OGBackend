// app.js
const express = require('express');
const cors = require('cors');
const walletRoutes = require('./src/routes/walletRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();

// CORS - allow Vite frontend
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'client-id', 'x-admin-secret', 'Authorization'],
  credentials: false,
}));

app.use(express.json());

// Routes – NO /api prefix
app.use('/admin/wallet', walletRoutes);
app.use('/orders', orderRoutes);
app.use('/wallet', walletRoutes);       // → /wallet/balance

// 404 handler – keep it last
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

module.exports = app;