import jwt from 'jsonwebtoken';
import { AuthUser } from '../types/index.js';

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'fallback_secret_key_vedic_2026';

export const generateToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): AuthUser | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (err) {
    return null;
  }
};
