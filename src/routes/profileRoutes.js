const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Health check at /api
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Profile Intelligence Service is running',
    endpoints: {
      'POST   /api/profiles': 'Create a profile',
      'GET    /api/profiles': 'List all profiles (with optional filters)',
      'GET    /api/profiles/:id': 'Get profile by ID',
      'DELETE /api/profiles/:id': 'Delete profile'
    }
  });
});

// POST /api/profiles - Create a new profile
router.post('/profiles', profileController.createProfile.bind(profileController));

// GET /api/profiles - Get all profiles with optional filtering
router.get('/profiles', profileController.getAllProfiles.bind(profileController));

// GET /api/profiles/:id - Get profile by ID
router.get('/profiles/:id', profileController.getProfileById.bind(profileController));

// DELETE /api/profiles/:id - Delete profile by ID
router.delete('/profiles/:id', profileController.deleteProfile.bind(profileController));

module.exports = router;
