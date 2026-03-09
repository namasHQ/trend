import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRouter from './routes/auth';
import trendsRouter from './routes/trends';
import containersRouter from './routes/containers';
import coinsRouter from './routes/coins';
import metricsRouter from './routes/metrics';
import rewardsRouter from './routes/rewards';
import leaderboardRouter from './routes/leaderboard';
import dashboardRouter from './routes/dashboard';
import portfolioRouter from './routes/portfolio';
import betsRouter from './routes/bets';
import agentsRouter from './routes/agents';

// Import middleware
import { optionalAuth } from './middleware/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply optional auth middleware globally
app.use(optionalAuth);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/trends', trendsRouter);
app.use('/api/containers', containersRouter);
app.use('/api/coins', coinsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/rewards', rewardsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/bets', betsRouter);
app.use('/api/agents', agentsRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Trend2Earn API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
});

// Export for testing
export default app;