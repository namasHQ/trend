import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { VectorService } from './services/vector-service';
import { DatabaseService } from './services/database-service';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize services
const databaseService = new DatabaseService();
const vectorService = new VectorService(databaseService);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'vector-service'
  });
});

// Generate embedding for text
app.post('/api/embeddings/generate', async (req, res) => {
  try {
    const { text, model = 'text-embedding-3-small' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const embedding = await vectorService.generateEmbedding(text, model);
    
    res.json({
      embedding,
      model,
      dimensions: embedding.length
    });
  } catch (error) {
    logger.error('Error generating embedding:', error);
    res.status(500).json({ error: 'Failed to generate embedding' });
  }
});

// Check for similar trends (deduplication)
app.post('/api/trends/check-similarity', async (req, res) => {
  try {
    const { 
      title, 
      description = '', 
      coinList = [], 
      topK = 5,
      highThreshold = 0.86,
      lowThreshold = 0.70 
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await vectorService.checkSimilarity({
      title,
      description,
      coinList,
      topK,
      highThreshold,
      lowThreshold
    });

    res.json(result);
  } catch (error) {
    logger.error('Error checking similarity:', error);
    res.status(500).json({ error: 'Failed to check similarity' });
  }
});

// Store trend embedding
app.post('/api/trends/store-embedding', async (req, res) => {
  try {
    const { 
      trendId, 
      title, 
      description = '', 
      coinList = [],
      creatorWallet,
      themeId,
      model = 'text-embedding-3-small'
    } = req.body;

    if (!trendId || !title || !creatorWallet) {
      return res.status(400).json({ error: 'trendId, title, and creatorWallet are required' });
    }

    const result = await vectorService.storeTrendEmbedding({
      trendId,
      title,
      description,
      coinList,
      creatorWallet,
      themeId,
      model
    });

    res.json(result);
  } catch (error) {
    logger.error('Error storing embedding:', error);
    res.status(500).json({ error: 'Failed to store embedding' });
  }
});

// Search similar trends
app.post('/api/trends/search', async (req, res) => {
  try {
    const { 
      query, 
      topK = 10,
      themeId,
      excludeIds = []
    } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await vectorService.searchSimilarTrends({
      query,
      topK,
      themeId,
      excludeIds
    });

    res.json({ results });
  } catch (error) {
    logger.error('Error searching trends:', error);
    res.status(500).json({ error: 'Failed to search trends' });
  }
});

// Get trend by ID
app.get('/api/trends/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const trend = await vectorService.getTrendById(id);
    
    if (!trend) {
      return res.status(404).json({ error: 'Trend not found' });
    }

    res.json(trend);
  } catch (error) {
    logger.error('Error getting trend:', error);
    res.status(500).json({ error: 'Failed to get trend' });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
  logger.info(`Vector service running on port ${port}`);
});

export default app;
