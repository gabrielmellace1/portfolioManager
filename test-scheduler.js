const axios = require('axios');

console.log('Testing scheduler status...');

async function testScheduler() {
  try {
    // Test if backend is running
    console.log('🔍 Testing backend connection...');
    const healthResponse = await axios.get('http://localhost:3002/health');
    console.log('✅ Backend is running');
    
    // Test if we can get assets
    console.log('🔍 Testing assets endpoint...');
    const assetsResponse = await axios.get('http://localhost:3002/api/assets');
    console.log('✅ Assets endpoint working, found', assetsResponse.data.data?.length || 0, 'assets');
    
    // Test manual price update
    console.log('🔍 Testing manual price update...');
    try {
      const updateResponse = await axios.post('http://localhost:3002/api/assets/update-all-prices');
      console.log('✅ Manual price update successful');
    } catch (error) {
      console.log('❌ Manual price update failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.log('❌ Backend not responding:', error.message);
  }
}

testScheduler();
