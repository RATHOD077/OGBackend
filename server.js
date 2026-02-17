const app = require('./app');
require('dotenv').config();
const pool = require('./src/config/db');   // ← import the pool

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
    console.error('  • Check XAMPP → MySQL is running');
    console.error('  • Verify .env values (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');
    console.error('  • Database "wallet_db" exists?');
    console.error('  • User "root" has no password or correct password set?');
    process.exit(1); // stop the server if DB is critical
  }
}

// Start server + check DB
async function startServer() {
  await checkDatabaseConnection();

  app.listen(PORT, () => {
    console.log(`\n======================================`);
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`   URL: http://localhost:${PORT}`);
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