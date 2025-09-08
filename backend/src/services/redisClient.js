// src/services/redisClient.js
const Redis = require('ioredis');
const cfg = require('../config');

let redis = null;

if (cfg.REDIS.URL) {
  redis = new Redis(cfg.REDIS.URL, { tls: { rejectUnauthorized: false } });
  redis.on('connect', () => console.log('Redis ✅ connected'));
  redis.on('error', e => console.error('Redis ❌ error', e));
} else {
  console.warn('Redis not configured - presence will be disabled');
}

// ------------------- LOCK HELPERS -------------------
async function acquireLock(key, owner, ttl = 5) {
  if (!redis) return true;
  const res = await redis.set(`lock:${key}`, owner, 'NX', 'EX', ttl);
  return res === 'OK';
}

async function releaseLock(key, owner) {
  if (!redis) return;
  const current = await redis.get(`lock:${key}`);
  if (current === owner) await redis.del(`lock:${key}`);
}

// ------------------- PRESENCE HELPERS -------------------

// Add presence with auto-expiring TTL on board set
async function addPresence(boardId, userId, socketId, ttl = 60) {
  if (!redis) return;

  try {
    // Add user to board online set and reset TTL
    await redis.sadd(`board:${boardId}:online`, userId);
    await redis.expire(`board:${boardId}:online`, ttl);

    // Map socket -> user & board with TTL for auto cleanup
    await redis.hset(`socket:${socketId}`, 'user', userId, 'board', boardId);
    await redis.expire(`socket:${socketId}`, ttl);
  } catch (err) {
    console.error('Redis addPresence failed', err);
  }
}

// Remove presence when socket disconnects
async function removePresence(socketId) {
  if (!redis) return;

  try {
    const info = await redis.hgetall(`socket:${socketId}`);
    if (info && info.board && info.user) {
      await redis.srem(`board:${info.board}:online`, info.user);
      await redis.del(`socket:${socketId}`);
    }
  } catch (err) {
    console.error('Redis removePresence failed', err);
  }
}

// Get online users
async function getOnline(boardId = null) {
  if (!redis) return [];

  try {
    if (boardId) {
      return await redis.smembers(`board:${boardId}:online`);
    }

    // If no boardId, get all unique online users across boards
    const keys = await redis.keys('board:*:online');
    const allUsers = new Set();

    for (const key of keys) {
      const users = await redis.smembers(key);
      users.forEach(u => allUsers.add(u));
    }

    return Array.from(allUsers);
  } catch (err) {
    console.error('Redis getOnline failed', err);
    return [];
  }
}

module.exports = {
  redis,
  acquireLock,
  releaseLock,
  addPresence,
  removePresence,
  getOnline,
};
