import { Router } from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { generateToken, clearAuthCookie } from '../utils/token.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    let { name, email, password } = req.body;

    name = typeof name === 'string' ? name.trim() : '';
    const emailNorm = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const pass = typeof password === 'string' ? password.trim() : '';

    if (!name || !emailNorm || !pass) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (pass.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: emailNorm });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const user = await User.create({ name, email: emailNorm, password: pass });

    const token = generateToken(user._id, res);
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const emailNorm = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const pass = typeof req.body?.password === 'string' ? req.body.password.trim() : '';

    if (!emailNorm || !pass) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ email: emailNorm });
    // Fallback for legacy users saved with different casing
    if (!user) {
      try {
        const esc = emailNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        user = await User.findOne({ email: { $regex: new RegExp(`^${esc}$`, 'i') } });
      } catch {}
    }
    if (!user) {
      console.warn('Login failed: user not found for', emailNorm);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(pass);
    if (!isMatch) {
      console.warn('Login failed: password mismatch for', emailNorm);
      return res.status(401).json({ message: 'Invalid Password' });
    }

    const token = generateToken(user._id, res);
    return res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out' });
});

export default router;
