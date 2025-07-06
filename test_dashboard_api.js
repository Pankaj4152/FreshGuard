// Simple test script to verify dashboard API endpoints
const BASE_URL = 'http://localhost:5000';

async function testDashboardAPIs() {
  console.log('Testing Dashboard APIs...\n');
  
  try {
    // Test user_impact endpoint
    console.log('1. Testing /user_impact...');
    const impactResponse = await fetch(`${BASE_URL}/user_impact?user_id=user1`);
    const impactData = await impactResponse.json();
    console.log('Impact API Response:', JSON.stringify(impactData, null, 2));
    
    // Test loyalty endpoint
    console.log('\n2. Testing /get_loyalty...');
    const loyaltyResponse = await fetch(`${BASE_URL}/get_loyalty?user_id=user1`);
    const loyaltyData = await loyaltyResponse.json();
    console.log('Loyalty API Response:', JSON.stringify(loyaltyData, null, 2));
    
    // Test health endpoint
    console.log('\n3. Testing /health...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health API Response:', JSON.stringify(healthData, null, 2));
    
    console.log('\n✅ All API tests completed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('Make sure the backend is running on port 5000');
  }
}

// Run the test
testDashboardAPIs();
