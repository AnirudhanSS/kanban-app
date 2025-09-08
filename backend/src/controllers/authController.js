// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../db/models/User");

// If you want to keep a separate service, you can, but here’s a tight controller-only setup:
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // replace in prod
const JWT_EXPIRES_IN = "1h";

// POST /auth/signup
// body: { first_name, email, password, last_name? }
async function signup(req, res) {
  try {
    const { first_name, email, password, last_name } = req.body;

    if (!first_name || !email || !password) {
      return res.status(400).json({ error: "first_name, email, password are required" });
    }

    const existing = await User.scope("withDeleted").findOne({ where: { email } });
    if (existing && !existing.is_deleted) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // If an old soft-deleted user existed, you could optionally “revive” it.
    const user = await User.create({
      first_name,
      last_name: last_name || null,
      email,
      password_hash,
    });

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      token
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// POST /auth/login
// body: { email, password }
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const user = await User.scope("withDeleted").findOne({ where: { email } });
    if (!user || user.is_deleted) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.password_hash) {
      // Protect against old/bad rows
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}


// GET /auth/verify
// header: Authorization: Bearer <token>
async function verify(req, res) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      return res.json({ valid: true, payload });
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { signup, login, verify };
