import express from 'express';
import jwt from 'jsonwebtoken';
import { database } from '../services/database';
import { solanaService } from '../services/solana';

const router = express.Router();

const getJwtSecret = (): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwtSecret;
};

// GET /auth/check → check if user exists and needs registration
router.get('/check', async (req, res) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    console.log('🔍 Checking user for wallet:', walletAddress);

    // Query user with display_name column
    let user;
    try {
      user = await database.query(
        'SELECT id, wallet_address, display_name FROM users WHERE wallet_address = $1',
        [walletAddress]
      );
    } catch (dbError: any) {
      console.error('❌ Database query error:', dbError);
      console.error('Error code:', dbError.code);
      console.error('Error detail:', dbError.detail);
      console.error('Error hint:', dbError.hint);
      
      // Check if it's a "relation does not exist" error
      if (dbError.code === '42P01') {
        return res.status(500).json({ 
          error: 'Database not initialized',
          message: 'Users table does not exist. Please ensure the database schema has been applied.',
          code: dbError.code
        });
      }
      
      // Check if it's a connection error
      if (dbError.code === 'ECONNREFUSED' || dbError.code === 'ENOTFOUND') {
        return res.status(500).json({ 
          error: 'Database connection failed',
          message: 'Cannot connect to database. Please check database service is running.',
          code: dbError.code
        });
      }
      
      // Generic database error
      return res.status(500).json({ 
        error: 'Database error',
        message: dbError.message || 'Unknown database error',
        code: dbError.code,
        detail: process.env.NODE_ENV === 'development' ? dbError.detail : undefined
      });
    }

    console.log('📊 User query result:', { rowCount: user.rows.length, rows: user.rows });

    if (user.rows.length === 0) {
      return res.json({ exists: false, needsRegistration: true });
    }

    const userData = user.rows[0];
    const needsRegistration = !userData.display_name;

    res.json({
      exists: true,
      needsRegistration,
      hasUsername: !!userData.display_name,
      username: userData.display_name || null
    });
  } catch (error: any) {
    console.error('❌ Check user error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      detail: error?.detail
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: error?.message || 'Unknown error',
      detail: process.env.NODE_ENV === 'development' ? error?.detail : undefined
    });
  }
});

// POST /auth/wallet → authenticate user with wallet signature
router.post('/wallet', async (req, res) => {
  try {
    const { signature, message, publicKey, username } = req.body;

    console.log('🔐 Wallet authentication requested for:', publicKey);

    // Validate required fields
    if (!signature || !message || !publicKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature
    const isValidSignature = await solanaService.verifySignature(signature, message, publicKey);
    
    if (!isValidSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find or create user
    let user = await database.query(
      'SELECT * FROM users WHERE wallet_address = $1',
      [publicKey]
    );

    if (user.rows.length === 0) {
      // New user registration - username is required
      if (!username || username.trim().length < 3) {
        return res.status(400).json({ error: 'Username is required for new users (3-20 characters)' });
      }

      // Check if username is already taken
      const existingUsername = await database.query(
        'SELECT id FROM users WHERE display_name = $1',
        [username.trim()]
      );

      if (existingUsername.rows.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Create new user with username
      const newUser = await database.query(
        `INSERT INTO users (wallet_address, display_name)
         VALUES ($1, $2)
         RETURNING *`,
        [publicKey, username.trim()]
      );
      user = newUser;
    } else {
      // Existing user - update username if provided and not set
      const userData = user.rows[0];
      if (username && !userData.display_name) {
        // Check if username is already taken
        const existingUsername = await database.query(
          'SELECT id FROM users WHERE display_name = $1 AND id != $2',
          [username.trim(), userData.id]
        );

        if (existingUsername.rows.length > 0) {
          return res.status(400).json({ error: 'Username already taken' });
        }

        // Update username
        await database.query(
          'UPDATE users SET display_name = $1 WHERE id = $2',
          [username.trim(), userData.id]
        );
        
        // Refresh user data
        user = await database.query(
          'SELECT * FROM users WHERE id = $1',
          [userData.id]
        );
      }
    }

    const userData = user.rows[0];

    // Generate JWT token
    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      { 
        id: userData.id,
        wallet_address: userData.wallet_address,
        reputation_score: userData.reputation || 0
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Update last login time
    await database.query(
      'UPDATE users SET updated_at = NOW() WHERE id = $1',
      [userData.id]
    );

    res.json({
      success: true,
      user: {
        id: userData.id,
        walletAddress: userData.wallet_address,
        username: userData.display_name,
        reputationScore: userData.reputation || 0
      },
      token
    });
  } catch (error: any) {
    console.error('Wallet authentication error:', error);
    if (error.message && error.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /auth/me → get current user info
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Server authentication is not configured' });
    }
    
    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Get fresh user data from database
      const userResult = await database.query(
        'SELECT * FROM users WHERE id = $1',
        [decoded.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];

      res.json({
        id: user.id,
        walletAddress: user.wallet_address,
        username: user.display_name,
        reputationScore: user.reputation || 0,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      });
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/logout → logout user (client-side token removal)
router.post('/logout', async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // You could implement token blacklisting here if needed
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
