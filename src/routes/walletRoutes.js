const express = require('express');
const { adminAuth, clientAuth } = require('../middleware/auth');
const { 
  creditWallet, 
  debitWallet, 
  getBalance,
  getTransactionHistory 
} = require('../controllers/walletController');

const router = express.Router();

// Admin routes
router.post('/credit', adminAuth, creditWallet);
router.post('/debit',  adminAuth, debitWallet);

// Client routes – both MUST have clientAuth
router.get('/balance', clientAuth, getBalance);
router.get('/history', clientAuth, getTransactionHistory);   // ← THIS LINE IS CRITICAL

module.exports = router;