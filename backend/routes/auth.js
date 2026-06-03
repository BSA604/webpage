import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// For simplicity, using environment variables for credentials
// In production, hash these in a database
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Simple credential check (in production, use bcrypt for hashed passwords)
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, expiresIn: '7d' });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

router.post('/logout', (req, res) => {
  // JWT is stateless, so logout is handled client-side
  // Just return success
  res.json({ message: 'Logged out successfully' });
});

export default router;
