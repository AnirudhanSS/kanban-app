const Redis = require('ioredis');
const sequelize = require('./db');
const net = require('net');

// Test port availability
function testPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Test Redis connection
async function testRedis() {
  return new Promise((resolve) => {
    console.log('🔄 Testing Redis connection...');
    
    const redis = new Redis("rediss://default:ARUAAAImcDFhY2RiNjcyZWRlYmM0ZmNmYTk0Yjg5OWYwMjUzMWQ1MXAxNTM3Ng@saving-horse-5376.upstash.io:6379", {
      tls: { rejectUnauthorized: false },
      connectTimeout: 5000,
      lazyConnect: true
    });

    redis.on('connect', () => {
      console.log("✅ Redis connected successfully");
      redis.disconnect();
      resolve(true);
    });
    
    redis.on('error', (e) => {
      console.error("❌ Redis connection failed:", e.message);
      resolve(false);
    });

    redis.on('timeout', () => {
      console.error("❌ Redis connection timeout");
      resolve(false);
    });

    // Try to connect
    redis.connect().catch(() => {
      // Error will be handled by error event
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      console.error("❌ Redis connection timeout (10s)");
      redis.disconnect();
      resolve(false);
    }, 10000);
  });
}

// Test Database connection
async function testDatabase() {
  try {
    console.log('🔄 Testing Database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting connection tests...\n');
  
  const results = {
    port: false,
    database: false,
    redis: false
  };

  // Test port availability
  console.log('🔄 Testing port 5000 availability...');
  results.port = await testPort(5000);
  if (results.port) {
    console.log('✅ Port 5000 is available');
  } else {
    console.log('❌ Port 5000 is already in use');
  }
  console.log('');

  // Test database
  results.database = await testDatabase();
  console.log('');

  // Test Redis
  results.redis = await testRedis();
  console.log('');

  // Summary
  console.log('📊 Test Results Summary:');
  console.log('========================');
  console.log(`Port 5000: ${results.port ? '✅ Available' : '❌ In Use'}`);
  console.log(`Database:  ${results.database ? '✅ Connected' : '❌ Failed'}`);
  console.log(`Redis:     ${results.redis ? '✅ Connected' : '❌ Failed'}`);
  console.log('');

  const allPassed = results.port && results.database && results.redis;
  
  if (allPassed) {
    console.log('🎉 All tests passed! Server should start successfully.');
  } else {
    console.log('⚠️  Some tests failed. Please fix the issues before starting the server.');
    
    if (!results.port) {
      console.log('💡 To fix port issue: Kill the process using port 5000 or change the port in .env');
    }
    if (!results.database) {
      console.log('💡 To fix database issue: Check your database credentials in .env file');
    }
    if (!results.redis) {
      console.log('💡 To fix Redis issue: Check your Redis URL and credentials');
    }
  }

  // Close database connection
  await sequelize.close();
  
  return allPassed;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, testPort, testDatabase, testRedis };
