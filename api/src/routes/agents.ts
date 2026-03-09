import express from 'express';
import { database } from '../services/database';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();

// GET /agents → list user's agents
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // TODO: Implement agent listing from database
    // For now, return empty array
    const agents = await database.query(
      `SELECT 
        id,
        name,
        description,
        owner_wallet,
        status,
        deployment_tx,
        created_at,
        updated_at,
        total_predictions,
        successful_predictions,
        accuracy,
        last_prediction_at
      FROM agents
      WHERE owner_id = $1
      ORDER BY created_at DESC`,
      [userId]
    ).catch(() => ({ rows: [] })); // Return empty if table doesn't exist

    res.json(agents.rows || []);
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /agents/stats → get agent statistics
router.get('/stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // TODO: Implement agent stats from database
    // For now, return default stats
    const stats = await database.query(
      `SELECT 
        COUNT(*) as total_agents,
        COUNT(*) FILTER (WHERE status = 'active') as active_agents,
        COALESCE(SUM(total_predictions), 0) as total_predictions,
        COALESCE(AVG(accuracy), 0) as average_accuracy
      FROM agents
      WHERE owner_id = $1`,
      [userId]
    ).catch(() => ({
      rows: [{
        total_agents: 0,
        active_agents: 0,
        total_predictions: 0,
        average_accuracy: 0
      }]
    }));

    const statsData = stats.rows[0] || {
      total_agents: 0,
      active_agents: 0,
      total_predictions: 0,
      average_accuracy: 0
    };

    res.json({
      totalAgents: parseInt(statsData.total_agents) || 0,
      activeAgents: parseInt(statsData.active_agents) || 0,
      totalPredictions: parseInt(statsData.total_predictions) || 0,
      averageAccuracy: parseFloat(statsData.average_accuracy) || 0,
      totalDeployed: parseInt(statsData.total_agents) || 0
    });
  } catch (error) {
    console.error('Get agent stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /agents/:id → get agent details
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // TODO: Implement agent details from database
    const agent = await database.query(
      `SELECT * FROM agents WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    ).catch(() => ({ rows: [] }));

    if (agent.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent.rows[0]);
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /agents/deploy → deploy a new agent
router.post('/deploy', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, description, signature, transactionHash } = req.body;
    const userId = req.user?.id;
    const walletAddress = req.user?.wallet_address;
    
    if (!userId || !walletAddress) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!name || name.trim().length < 3) {
      return res.status(400).json({ error: 'Agent name is required (min 3 characters)' });
    }

    if (!transactionHash) {
      return res.status(400).json({ error: 'Transaction hash is required' });
    }

    // TODO: Verify transaction hash and signature
    // TODO: Create agent record in database
    // TODO: Initialize ElizaOS instance for this agent
    
    // For now, return a mock agent
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Try to insert into database (table might not exist yet)
    try {
      await database.query(
        `INSERT INTO agents (
          id, name, description, owner_id, owner_wallet, status, deployment_tx,
          total_predictions, successful_predictions, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *`,
        [agentId, name.trim(), description?.trim() || null, userId, walletAddress, 'deploying', transactionHash, 0, 0]
      );
    } catch (dbError: any) {
      // If table doesn't exist, log and continue with mock response
      console.warn('Agents table does not exist yet:', dbError.message);
    }

    res.status(201).json({
      id: agentId,
      name: name.trim(),
      description: description?.trim() || null,
      owner_wallet: walletAddress,
      status: 'deploying',
      deployment_tx: transactionHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_predictions: 0,
      successful_predictions: 0,
      accuracy: null,
      last_prediction_at: null
    });
  } catch (error) {
    console.error('Deploy agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /agents/:id/predictions → get agent predictions
router.get('/:id/predictions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // TODO: Implement predictions listing from database
    const predictions = await database.query(
      `SELECT * FROM agent_predictions 
       WHERE agent_id = $1 
       ORDER BY created_at DESC
       LIMIT 50`,
      [id]
    ).catch(() => ({ rows: [] }));

    res.json(predictions.rows || []);
  } catch (error) {
    console.error('Get agent predictions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /agents/:id → update agent
router.patch('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // TODO: Implement agent update
    const agent = await database.query(
      `UPDATE agents 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           updated_at = NOW()
       WHERE id = $3 AND owner_id = $4
       RETURNING *`,
      [name, description, id, userId]
    ).catch(() => ({ rows: [] }));

    if (agent.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent.rows[0]);
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /agents/:id → delete agent
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // TODO: Implement agent deletion
    // TODO: Stop ElizaOS instance
    const result = await database.query(
      `DELETE FROM agents WHERE id = $1 AND owner_id = $2`,
      [id, userId]
    ).catch(() => ({ rowCount: 0 }));

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;



