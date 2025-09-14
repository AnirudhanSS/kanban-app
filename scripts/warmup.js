#!/usr/bin/env node

/**
 * Warmup script to keep the Render.com instance active
 * This script can be run via cron-job.org to ping the health endpoint
 */

const https = require('https');
const http = require('http');

const APP_URL = process.env.APP_URL || 'https://kanban-collab.onrender.com';
const HEALTH_ENDPOINT = '/health';

function pingHealthEndpoint() {
  const url = new URL(APP_URL + HEALTH_ENDPOINT);
  const client = url.protocol === 'https:' ? https : http;
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: 'GET',
    timeout: 10000,
    headers: {
      'User-Agent': 'Kanban-Collab-Warmup/1.0'
    }
  };

  const req = client.request(options, (res) => {
    console.log(`✅ Health check successful: ${res.statusCode}`);
    console.log(`📊 Response time: ${Date.now() - startTime}ms`);
    
    if (res.statusCode === 200) {
      console.log('🎉 Instance is healthy and active');
      process.exit(0);
    } else {
      console.log(`⚠️ Unexpected status code: ${res.statusCode}`);
      process.exit(1);
    }
  });

  req.on('error', (error) => {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  });

  req.on('timeout', () => {
    console.error('⏰ Health check timed out');
    req.destroy();
    process.exit(1);
  });

  const startTime = Date.now();
  req.end();
}

// Run the health check
console.log(`🏥 Pinging health endpoint: ${APP_URL}${HEALTH_ENDPOINT}`);
pingHealthEndpoint();
