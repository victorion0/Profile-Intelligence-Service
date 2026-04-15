const externalApiService = require('../services/externalApiService');
const profileService = require('../services/profileService');
const { uuidv7 } = require('../utils/uuid');

class ProfileController {
  async createProfile(req, res) {
    try {
      const { name } = req.body;

      // Validate request body
      if (!name || (typeof name === 'string' && name.trim() === '')) {
        return res.status(400).json({
          status: 'error',
          message: 'Name is required and cannot be empty'
        });
      }

      if (typeof name !== 'string') {
        return res.status(422).json({
          status: 'error',
          message: 'Name must be a string'
        });
      }

      const normalizedName = name.trim().toLowerCase();

      // Check for existing profile (idempotency)
      const existingProfile = await profileService.findByName(normalizedName);
      if (existingProfile) {
        return res.status(200).json({
          status: 'success',
          message: 'Profile already exists',
          data: this.formatProfileResponse(existingProfile)
        });
      }

      // Enrich profile using external APIs
      let enrichedData;
      try {
        enrichedData = await externalApiService.enrichProfile(normalizedName);
      } catch (apiError) {
        return res.status(502).json({
          status: 'error',
          message: apiError.message
        });
      }

      // Create profile in database
      const profile = await profileService.create({
        id: uuidv7(),
        name: enrichedData.name,
        gender: enrichedData.gender,
        genderProbability: enrichedData.gender_probability,
        sampleSize: enrichedData.sample_size,
        age: enrichedData.age,
        ageGroup: enrichedData.age_group,
        countryId: enrichedData.country_id,
        countryProbability: enrichedData.country_probability
      });

      return res.status(201).json({
        status: 'success',
        data: this.formatProfileResponse(profile)
      });

    } catch (error) {
      console.error('Error in createProfile:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }

  async getProfileById(req, res) {
    try {
      const { id } = req.params;

      const profile = await profileService.findById(id);
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Profile not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: this.formatProfileResponse(profile)
      });

    } catch (error) {
      console.error('Error in getProfileById:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }

  async getAllProfiles(req, res) {
    try {
      const { gender, country_id, age_group } = req.query;

      const filters = {};
      if (gender) filters.gender = gender;
      if (country_id) filters.country_id = country_id;
      if (age_group) filters.age_group = age_group;

      const profiles = await profileService.findAll(filters);

      const formattedProfiles = profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        gender: profile.gender,
        age: profile.age,
        age_group: profile.ageGroup,
        country_id: profile.countryId
      }));

      return res.status(200).json({
        status: 'success',
        count: formattedProfiles.length,
        data: formattedProfiles
      });

    } catch (error) {
      console.error('Error in getAllProfiles:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }

  async deleteProfile(req, res) {
    try {
      const { id } = req.params;

      const existingProfile = await profileService.findById(id);
      if (!existingProfile) {
        return res.status(404).json({
          status: 'error',
          message: 'Profile not found'
        });
      }

      await profileService.deleteById(id);

      return res.status(204).send();

    } catch (error) {
      console.error('Error in deleteProfile:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }

  formatProfileResponse(profile) {
    const createdAt = profile.created_at || profile.createdAt;
    const createdAtISO = createdAt instanceof Date ? createdAt.toISOString() : createdAt;

    return {
      id: profile.id,
      name: profile.name,
      gender: profile.gender,
      gender_probability: profile.gender_probability ?? profile.genderProbability,
      sample_size: profile.sample_size ?? profile.sampleSize,
      age: profile.age,
      age_group: profile.age_group ?? profile.ageGroup,
      country_id: profile.country_id ?? profile.countryId,
      country_probability: profile.country_probability ?? profile.countryProbability,
      created_at: createdAtISO
    };
  }
}

module.exports = new ProfileController();
