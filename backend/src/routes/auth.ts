import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/pool';
import asyncHandler from '../middleware/asyncHandler';
import type { Role } from '../types/express';

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
      role: Role;
      is_active: boolean;
      driver_id: string | null;
    }>(
      `SELECT u.id, u.email, u.password_hash, u.name, u.role, u.is_active, d.id AS driver_id
       FROM users u
       LEFT JOIN drivers d ON d.user_id = u.id
       WHERE u.email = $1`,
      [email],
    );

    const user = rows[0];
    const valid = user !== undefined && (await bcrypt.compare(password, user.password_hash));

    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ error: 'Account is disabled' });
      return;
    }

    const driverId = user.role === 'driver' && user.driver_id ? user.driver_id : undefined;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, ...(driverId ? { driverId } : {}) },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' },
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, driverId },
    });
  }),
);

export default router;
