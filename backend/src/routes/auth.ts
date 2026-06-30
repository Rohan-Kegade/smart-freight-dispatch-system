import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/pool';
import asyncHandler from '../middleware/asyncHandler';

const router = Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    const { rows } = await pool.query<{
      id: string;
      email: string;
      password_hash: string;
      name: string;
      role: 'admin' | 'dispatcher';
    }>('SELECT id, email, password_hash, name, role FROM users WHERE email = $1', [email]);

    const user = rows[0];
    const valid = user !== undefined && (await bcrypt.compare(password, user.password_hash));

    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' },
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  }),
);

export default router;
