require('dotenv').config();

const app = require('./src/index');
const profileService = require('./src/services/profileService');

const PORT = process.env.PORT || 3000;

// Initialize database schema, then start server
profileService.init().then(() => {
  console.log('✅ Database schema ready');
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
}).catch(err => {
  console.error('❌ Failed to init database:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
});
