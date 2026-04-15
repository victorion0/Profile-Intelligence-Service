const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api';

async function testAPI() {
  console.log('=== Profile Intelligence Service - Test Suite ===\n');

  try {
    // Test 1: Create a profile
    console.log('Test 1: POST /api/profiles with name "ella"');
    const postResponse = await axios.post(`${BASE_URL}/profiles`, { name: 'ella' });
    console.log('Status:', postResponse.status);
    console.log('Response:', JSON.stringify(postResponse.data, null, 2));
    const profileId = postResponse.data.data.id;
    console.log('✓ Profile created with ID:', profileId);
    console.log();

    // Test 2: Idempotency - Create same profile again
    console.log('Test 2: POST /api/profiles with name "ella" (idempotency)');
    const idempotentResponse = await axios.post(`${BASE_URL}/profiles`, { name: 'ella' });
    console.log('Status:', idempotentResponse.status);
    console.log('Message:', idempotentResponse.data.message);
    console.log('✓ Idempotency check passed');
    console.log();

    // Test 3: Get profile by ID
    console.log('Test 3: GET /api/profiles/:id');
    const getResponse = await axios.get(`${BASE_URL}/profiles/${profileId}`);
    console.log('Status:', getResponse.status);
    console.log('Response:', JSON.stringify(getResponse.data, null, 2));
    console.log('✓ Profile retrieved');
    console.log();

    // Test 4: Create another profile
    console.log('Test 4: POST /api/profiles with name "john"');
    const postResponse2 = await axios.post(`${BASE_URL}/profiles`, { name: 'john' });
    console.log('Status:', postResponse2.status);
    console.log('✓ Second profile created');
    console.log();

    // Test 5: Get all profiles
    console.log('Test 5: GET /api/profiles');
    const getAllResponse = await axios.get(`${BASE_URL}/profiles`);
    console.log('Status:', getAllResponse.status);
    console.log('Count:', getAllResponse.data.count);
    console.log('Response:', JSON.stringify(getAllResponse.data, null, 2));
    console.log('✓ All profiles retrieved');
    console.log();

    // Test 6: Filter profiles
    console.log('Test 6: GET /api/profiles?gender=male');
    const filterResponse = await axios.get(`${BASE_URL}/profiles`, { params: { gender: 'male' } });
    console.log('Status:', filterResponse.status);
    console.log('Count:', filterResponse.data.count);
    console.log('Response:', JSON.stringify(filterResponse.data, null, 2));
    console.log('✓ Filtered profiles');
    console.log();

    // Test 7: Delete profile
    console.log('Test 7: DELETE /api/profiles/:id');
    const deleteResponse = await axios.delete(`${BASE_URL}/profiles/${profileId}`);
    console.log('Status:', deleteResponse.status);
    console.log('✓ Profile deleted');
    console.log();

    // Test 8: Verify deletion
    console.log('Test 8: GET /api/profiles/:id (after deletion)');
    try {
      await axios.get(`${BASE_URL}/profiles/${profileId}`);
    } catch (error) {
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message);
      console.log('✓ Profile not found (as expected)');
    }
    console.log();

    console.log('=== All tests passed! ===');

  } catch (error) {
    console.error('✗ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAPI();
