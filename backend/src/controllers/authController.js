// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../db/models/User");
const emailService = require("../services/emailService");

// If you want to keep a separate service, you can, but here's a tight controller-only setup:
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // replace in prod
const JWT_EXPIRES_IN = "1h";

// Store password reset tokens temporarily (in production, use Redis)
const passwordResetTokens = new Map();

// Store email verification tokens temporarily (in production, use Redis)
const emailVerificationTokens = new Map();

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

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // If an old soft-deleted user existed, you could optionally "revive" it.
    const user = await User.create({
      first_name,
      last_name: last_name || null,
      email,
      password_hash,
      is_email_verified: false,
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires
    });

    // Store verification token temporarily
    emailVerificationTokens.set(verificationToken, {
      userId: user.id,
      email: user.email,
      expiresAt: verificationExpires
    });

    // Send email verification email
    emailService.sendEmailVerificationEmail(user.email, user.first_name, verificationToken)
      .catch(error => {
        console.error('Failed to send verification email:', error);
        // Don't fail the signup if email fails
      });

    return res.status(201).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      is_email_verified: user.is_email_verified,
      message: "Account created successfully. Please check your email to verify your account."
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

    // Check if email is verified
    if (!user.is_email_verified) {
      return res.status(401).json({ 
        error: "Please verify your email before logging in. Check your inbox for a verification link." 
      });
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Send login notification email (don't wait for it to complete)
    const loginInfo = {
      time: new Date().toLocaleString(),
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
      location: 'Unknown', // Could be enhanced with IP geolocation
      device: req.get('User-Agent') || 'Unknown'
    };

    emailService.sendLoginNotificationEmail(user.email, user.first_name, loginInfo)
      .catch(error => {
        console.error('Failed to send login notification email:', error);
        // Don't fail the login if email fails
      });

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

// POST /auth/forgot-password
// body: { email }
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: "If the email exists, a password reset link has been sent." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token temporarily
    passwordResetTokens.set(resetToken, {
      userId: user.id,
      email: user.email,
      expiresAt
    });

    // Send password reset email
    await emailService.sendPasswordResetEmail(user.email, user.first_name, resetToken);

    return res.json({ message: "If the email exists, a password reset link has been sent." });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /auth/reset-password
// body: { token, newPassword }
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    // Check if token exists and is valid
    const tokenData = passwordResetTokens.get(token);
    if (!tokenData) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Check if token has expired
    if (new Date() > tokenData.expiresAt) {
      passwordResetTokens.delete(token);
      return res.status(400).json({ error: "Reset token has expired" });
    }

    // Find user
    const user = await User.findByPk(tokenData.userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await user.update({ password_hash });

    // Remove used token
    passwordResetTokens.delete(token);

    return res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /auth/verify-email
// body: { token }
async function verifyEmail(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    // Check if token exists and is valid
    const tokenData = emailVerificationTokens.get(token);
    if (!tokenData) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    // Check if token has expired
    if (new Date() > tokenData.expiresAt) {
      emailVerificationTokens.delete(token);
      return res.status(400).json({ error: "Verification token has expired" });
    }

    // Find user
    const user = await User.findByPk(tokenData.userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Update user email verification status
    await user.update({ 
      is_email_verified: true,
      email_verification_token: null,
      email_verification_expires: null
    });

    // Remove used token
    emailVerificationTokens.delete(token);

    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /auth/resend-verification
// body: { email }
async function resendVerification(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: "If the email exists and is not verified, a verification email has been sent." });
    }

    if (user.is_email_verified) {
      return res.json({ message: "Email is already verified" });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await user.update({
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires
    });

    // Store new token temporarily
    emailVerificationTokens.set(verificationToken, {
      userId: user.id,
      email: user.email,
      expiresAt: verificationExpires
    });

    // Send verification email
    await emailService.sendEmailVerificationEmail(user.email, user.first_name, verificationToken);

    return res.json({ message: "If the email exists and is not verified, a verification email has been sent." });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { signup, login, verify, forgotPassword, resetPassword, verifyEmail, resendVerification };
