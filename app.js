// app.js
const express = require('express');
const cors = require('cors');
const walletRoutes = require('./src/routes/walletRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();

// Allowed origins (production + local dev for convenience)
const allowedOrigins = [
  'https://wallet-system1.netlify.app',  // ← your frontend URL on Netlify
];

// CORS configuration with reflective origin
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without origin (e.g. curl, Postman, mobile)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, origin);   // echo back the exact origin (required for credentials in future)
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'client-id', 'x-admin-secret', 'Authorization'],
  credentials: false,  // change to true only if you send cookies / auth credentials
}));

// Ensure OPTIONS preflight is handled for all routes (important on Render/Netlify setups)
app.options('*', cors());

// Temporary debug middleware – logs incoming origin (remove after testing)
app.use((req, res, next) => {
  console.log(`[CORS DEBUG] ${req.method} ${req.path} from origin: ${req.headers.origin || 'none'}`);
  next();
});

app.use(express.json());

// Routes – NO /api prefix
app.use('/admin/wallet', walletRoutes);
app.use('/orders', orderRoutes);
app.use('/wallet', walletRoutes);  // → /wallet/balance, /wallet/history

// 404 handler – keep it last (updated message to confirm code is live)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found – code updated 2025' });
});

module.exports = app;