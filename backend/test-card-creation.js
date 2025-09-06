const axios = require('axios');

async function testCardCreation() {
  try {
    console.log('🧪 Testing card creation...');
    
    // First, let's login to get a token
    const loginResponse = await axios.post('http://localhost:5000/auth/login', {
      email: 'anu@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Get user's boards to find a board with columns
    const boardsResponse = await axios.get('http://localhost:5000/boards', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (boardsResponse.data.length === 0) {
      console.log('❌ No boards found. Please create a board first.');
      return;
    }
    
    const board = boardsResponse.data[0];
    console.log(`📋 Using board: ${board.title}`);
    
    // Get columns for the board
    const columnsResponse = await axios.get(`http://localhost:5000/boards/${board.id}/columns`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (columnsResponse.data.length === 0) {
      console.log('❌ No columns found in the board. Please create columns first.');
      return;
    }
    
    const column = columnsResponse.data[0];
    console.log(`📝 Using column: ${column.title}`);
    
    // Test creating multiple cards
    for (let i = 1; i <= 3; i++) {
      console.log(`\n🔄 Creating card ${i}...`);
      
      const cardResponse = await axios.post('http://localhost:5000/cards', {
        title: `Test Card ${i}`,
        description: `This is test card number ${i}`,
        column_id: column.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`✅ Card ${i} created successfully:`, cardResponse.data.title);
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 All card creation tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('❌ 500 Internal Server Error - check backend logs');
    }
  }
}

testCardCreation();
