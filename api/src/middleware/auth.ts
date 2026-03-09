import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { database } from '../services/database';
import { AuthRequest, AuthUser } from '../types';

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Server authentication is not configured' });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Get fresh user data from database
    const userResult = await database.query(
      'SELECT id, wallet_address, reputation_score, level FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = userResult.rows[0] as AuthUser;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return next();
      }

      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Get fresh user data from database
      const userResult = await database.query(
        'SELECT id, wallet_address, reputation_score, level FROM users WHERE id = $1',
        [decoded.id]
      );

      if (userResult.rows.length > 0) {
        req.user = userResult.rows[0] as AuthUser;
      }
    }
  } catch (error) {
    // Ignore auth errors for optional auth
  }

  next();
};




