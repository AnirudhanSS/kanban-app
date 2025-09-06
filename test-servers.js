// Test if both servers are running
const axios = require('axios');

async function testServers() {
  console.log('🧪 Testing Server Status...\n');

  try {
    // Test backend
    console.log('1. Testing Backend Server (port 5000)...');
    const backendResponse = await axios.get('http://localhost:5000/health', { timeout: 5000 });
    console.log('✅ Backend server is running');
  } catch (error) {
    console.log('❌ Backend server is not responding');
    console.log('Error:', error.message);
  }

  try {
    // Test frontend
    console.log('\n2. Testing Frontend Server (port 3000)...');
    const frontendResponse = await axios.get('http://localhost:3000', { timeout: 5000 });
    console.log('✅ Frontend server is running');
  } catch (error) {
    console.log('❌ Frontend server is not responding');
    console.log('Error:', error.message);
  }

  console.log('\n🌐 URLs to test:');
  console.log('   - Frontend: http://localhost:3000');
  console.log('   - Backend Health: http://localhost:5000/health');
  console.log('   - Login Page: http://localhost:3000/login');
  console.log('   - Forgot Password: http://localhost:3000/forgot-password');
}

testServers();
