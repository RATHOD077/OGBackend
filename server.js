const app = require('./app');
require('dotenv').config();
const pool = require('./src/config/db');   // ← your DB pool

const PORT = process.env.PORT || 4000;

// Simple function to test DB connection on startup
async function checkDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful!');
    console.log(`   - Host:     ${process.env.DB_HOST}`);
    console.log(`   - Database: ${process.env.DB_NAME}`);
    console.log(`   - User:     ${process.env.DB_USER}`);
    connection.release(); // important - return connection to pool
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', error.message);
    console.error('\nPossible fixes:');
    console.error('  • Check your Render env vars (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');
    console.error('  • Make sure database is reachable from Render (public IP or allow all)');
    console.error('  • Credentials correct? No password issues?');
    process.exit(1); // stop if DB is critical
  }
}

// Start server + check DB
async function startServer() {
  await checkDatabaseConnection();

  // Log every incoming request's origin (for CORS debug – check Render logs!)
  app.use((req, res, next) => {
    const origin = req.headers.origin || 'no-origin-provided';
    console.log(`[REQUEST] ${req.method} ${req.path} | Origin: ${origin}`);
    next();
  });

  app.listen(PORT, () => {
    console.log(`\n======================================`);
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`   Live URL: https://backend-2-15sk.onrender.com`);
    console.log(`   (Local would be http://localhost:${PORT})`);
    console.log(`======================================`);
    console.log('Admin header → x-admin-secret: admin-secret-123');
    console.log('               or Authorization: Bearer admin-secret-123');
    console.log('Client header → client-id: <your-uuid-here>');
    console.log('');
  });
}

// Run everything
startServer().catch(err => {
  console.error('Server startup failed:', err);
});