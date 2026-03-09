import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3007;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'onchain-indexer'
  });
});

// Placeholder endpoint for Solana indexing
app.get('/api/indexer/status', (req, res) => {
  res.json({
    status: 'active',
    lastBlock: 0,
    processedTransactions: 0,
    uptime: process.uptime()
  });
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
  logger.info(`Onchain indexer service running on port ${port}`);
});

export default app;


