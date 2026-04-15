const app = require('../src/index');
const profileService = require('../src/services/profileService');

let initialized = false;

module.exports = async (req, res) => {
  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Initialize database if not done yet
  if (!initialized) {
    try {
      console.log('Initializing database schema...');
      console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
      await profileService.init();
      initialized = true;
      console.log('Database initialized successfully');
    } catch (err) {
      console.error('Database init failed:', err);
      return res.status(500).json({ status: 'error', message: 'Database initialization failed: ' + err.message });
    }
  }

  try {
    return app(req, res);
  } catch (err) {
    console.error('Request failed:', err);
    return res.status(500).json({ status: 'error', message: 'Server error: ' + err.message });
  }
};
