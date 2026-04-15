const axios = require('axios');

class ExternalApiService {
  constructor() {
    this.genderizeUrl = process.env.GENDERIZE_API_URL || 'https://api.genderize.io';
    this.agifyUrl = process.env.AGIFY_API_URL || 'https://api.agify.io';
    this.nationalizeUrl = process.env.NATIONALIZE_API_URL || 'https://api.nationalize.io';
  }

  async getGender(name) {
    try {
      const response = await axios.get(`${this.genderizeUrl}`, {
        params: { name }
      });
      return response.data;
    } catch (error) {
      throw new Error('Genderize API request failed');
    }
  }

  async getAge(name) {
    try {
      const response = await axios.get(`${this.agifyUrl}`, {
        params: { name }
      });
      return response.data;
    } catch (error) {
      throw new Error('Agify API request failed');
    }
  }

  async getNationality(name) {
    try {
      const response = await axios.get(`${this.nationalizeUrl}`, {
        params: { name }
      });
      return response.data;
    } catch (error) {
      throw new Error('Nationalize API request failed');
    }
  }

  async enrichProfile(name) {
    const [genderData, ageData, nationalityData] = await Promise.all([
      this.getGender(name),
      this.getAge(name),
      this.getNationality(name)
    ]);

    // Validate Genderize response
    if (!genderData.gender || genderData.count === 0) {
      throw new Error('Genderize returned an invalid response');
    }

    // Validate Agify response  
    if (ageData.age === null || ageData.age === undefined) {
      throw new Error('Agify returned an invalid response');
    }

    // Validate Nationalize response
    if (!nationalityData.country || nationalityData.country.length === 0) {
      throw new Error('Nationalize returned an invalid response');
    }

    // Extract and structure data
    const gender = genderData.gender;
    const gender_probability = genderData.probability;
    const sample_size = genderData.count;

    const age = ageData.age;
    const age_group = this.classifyAge(age);

    // Get country with highest probability
    const topCountry = nationalityData.country.reduce((max, country) => 
      country.probability > max.probability ? country : max
    , nationalityData.country[0]);

    const country_id = topCountry.country_id;
    const country_probability = topCountry.probability;

    return {
      name: name.toLowerCase(),
      gender,
      gender_probability,
      sample_size,
      age,
      age_group,
      country_id,
      country_probability
    };
  }

  classifyAge(age) {
    if (age >= 0 && age <= 12) return 'child';
    if (age >= 13 && age <= 19) return 'teenager';
    if (age >= 20 && age <= 59) return 'adult';
    return 'senior';
  }
}

module.exports = new ExternalApiService();
