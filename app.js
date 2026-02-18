// app.js
const express = require('express');
const cors = require('cors');
const walletRoutes = require('./src/routes/walletRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();

// Allowed origins (only production – remove localhost if you don't need local testing anymore)
const allowedOrigins = [
  'https://wallet-system1.netlify.app',
  // 'http://localhost:5173',   // ← uncomment only if testing locally
];

// CORS configuration – reflective origin (best practice)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);   // echo back the requesting origin
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'client-id', 'x-admin-secret', 'Authorization'],
  credentials: false,
}));

// Debug log for incoming requests (keep temporarily to confirm in Render logs)
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.path} from origin: ${req.headers.origin || 'none'}`);
  next();
});

app.use(express.json());

// Routes
app.use('/admin/wallet', walletRoutes);
app.use('/orders', orderRoutes);
app.use('/wallet', walletRoutes);  // → /wallet/balance, /wallet/history

// 404 handler – last
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found – code updated' });
});

module.exports = app;