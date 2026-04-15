const app = require('../src/index');
const profileService = require('../src/services/profileService');

// Initialize schema on first load
let initialized = false;

module.exports = async (req, res) => {
  if (!initialized) {
    await profileService.init();
    initialized = true;
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  return app(req, res);
};
