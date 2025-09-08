// src/services/authService.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../db/associations"); // make sure this matches your structure

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // replace in prod
const JWT_EXPIRES_IN = "1h"; // token expiry

// Signup
async function signup(email, password) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new Error("Email already in use");
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password_hash });

  return user;
}

// Login
async function login(email, password) {
  const user = await User.scope("withDeleted").findOne({ where: { email } }); // fetch even soft deleted
  if (!user || user.is_deleted) {
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return { user, token };
}

// Verify token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { signup, login, verifyToken };
