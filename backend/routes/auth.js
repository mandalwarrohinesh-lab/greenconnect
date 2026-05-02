const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { database, generateId } = require('../database/db');

const router = express.Router();

// In-memory store for verification codes (keyed by email)
const verificationCodes = {};

// Create email transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// Send verification code to email
router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: { message: 'Email is required' } });
    }

    // Check if user already exists
    const existingUser = database.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: { message: 'Email already registered' } });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store code
    verificationCodes[email] = { code, expiresAt };

    // Send email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"GreenConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'GreenConnect - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f9f9f9; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2ECC71; margin: 0;">🌱 GreenConnect</h1>
            <p style="color: #666; margin-top: 5px;">Smart Clean & Green Community Platform</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 10px;">Verify Your Email</h2>
            <p style="color: #666; margin-bottom: 25px;">Use the code below to verify your email address. It expires in 10 minutes.</p>
            <div style="background: #f0fdf4; border: 2px solid #2ECC71; border-radius: 10px; padding: 20px; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #2ECC71;">${code}</span>
            </div>
            <p style="color: #999; font-size: 13px;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `
    });

    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ error: { message: 'Failed to send verification email. Please check your email address.' } });
  }
});

// Verify the code
router.post('/verify-code', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: { message: 'Email and code are required' } });
  }

  const record = verificationCodes[email];

  if (!record) {
    return res.status(400).json({ error: { message: 'No verification code found. Please request a new one.' } });
  }

  if (Date.now() > record.expiresAt) {
    delete verificationCodes[email];
    return res.status(400).json({ error: { message: 'Verification code expired. Please request a new one.' } });
  }

  if (record.code !== code.toString()) {
    return res.status(400).json({ error: { message: 'Invalid verification code.' } });
  }

  // Mark as verified
  verificationCodes[email].verified = true;

  res.json({ message: 'Email verified successfully' });
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, bio } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: { message: 'Email, password, and name are required', status: 400 }
      });
    }

    // Check email was verified
    const record = verificationCodes[email];
    if (!record || !record.verified) {
      return res.status(400).json({
        error: { message: 'Email not verified. Please verify your email first.', status: 400 }
      });
    }

    // Check if user exists
    const existingUser = database.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        error: { message: 'User already exists', status: 400 }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      id: generateId(),
      email,
      password: hashedPassword,
      name,
      bio: bio || '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2ECC71&color=fff`,
      location: '',
      followers: 0,
      following: 0,
      postsCount: 0,
      ecoPoints: 0,
      theme: 'dark',
      createdAt: new Date().toISOString()
    };

    database.users.push(newUser);

    // Clean up verification code
    delete verificationCodes[email];

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        ecoPoints: newUser.ecoPoints
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: { message: 'Registration failed', status: 500 }
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: {
          message: 'Email and password are required',
          status: 400
        }
      });
    }

    // Find user
    const user = database.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          status: 401
        }
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          status: 401
        }
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        ecoPoints: user.ecoPoints,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        message: 'Login failed',
        status: 500
      }
    });
  }
});

module.exports = router;
