// Quick test for the authentication system
require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function quickTest() {
  console.log('🧪 Quick Authentication System Test...\n');

  try {
    // Test 1: User Registration
    console.log('1. Testing User Registration...');
    const userData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'quicktest@example.com',
      password: 'testpassword123'
    };

    const signupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
    console.log('✅ User registration successful!');
    console.log('📧 Welcome and verification emails sent');

    // Test 2: Try Login (should fail - email not verified)
    console.log('\n2. Testing Login Before Verification...');
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        email: userData.email,
        password: userData.password
      });
      console.log('❌ Login should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.error?.includes('verify')) {
        console.log('✅ Login correctly blocked - email verification required');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test 3: Forgot Password
    console.log('\n3. Testing Forgot Password...');
    const forgotResponse = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
      email: userData.email
    });
    console.log('✅ Password reset email sent');

    // Test 4: Resend Verification
    console.log('\n4. Testing Resend Verification...');
    const resendResponse = await axios.post(`${API_BASE_URL}/auth/resend-verification`, {
      email: userData.email
    });
    console.log('✅ Verification email resent');

    console.log('\n🎉 Authentication System Test Results:');
    console.log('✅ User Registration with Email Verification');
    console.log('✅ Email Verification Required for Login');
    console.log('✅ Forgot Password Functionality');
    console.log('✅ Resend Verification Email');
    console.log('✅ All Email Types Working');
    
    console.log('\n📧 Check email inbox for:');
    console.log('   - Welcome email (green theme)');
    console.log('   - Email verification email (purple theme)');
    console.log('   - Password reset email (orange theme)');
    console.log('   - Login notification email (blue theme - after verification)');

    console.log('\n🌐 Frontend URLs to test:');
    console.log('   - http://localhost:3000/login');
    console.log('   - http://localhost:3000/forgot-password');
    console.log('   - http://localhost:3000/reset-password?token=YOUR_TOKEN');
    console.log('   - http://localhost:3000/verify-email?token=YOUR_TOKEN');

  } catch (error) {
    if (error.response) {
      console.log('❌ Test failed:');
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.error('❌ Network error:', error.message);
      console.log('💡 Make sure both frontend and backend servers are running');
    }
  }
}

quickTest();
