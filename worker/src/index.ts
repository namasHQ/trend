import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
import cron from 'node-cron';
import { RewardCalculator } from './services/reward-calculator';
import { NotificationService } from './services/notification-service';
import { CoinTracker } from './services/coin-tracker';
import { DatabaseService } from './services/database';
import { logger } from './utils/logger';

// Load environment variables
require('dotenv').config();

// Logger is already imported as a constant

// Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// Initialize services
const database = new DatabaseService();
const rewardCalculator = new RewardCalculator(database);
const notificationService = new NotificationService(database);
const coinTracker = new CoinTracker(database);

// BullMQ Queues
const rewardCalculationQueue = new Queue('reward-calculation', { connection: redis });
const notificationQueue = new Queue('notifications', { connection: redis });
const coinTrackingQueue = new Queue('coin-tracking', { connection: redis });

// BullMQ Workers
const rewardCalculationWorker = new Worker(
  'reward-calculation',
  async (job) => {
    const { type, data } = job.data;
    logger.info(`Processing reward calculation job: ${type}`);
    
    try {
      switch (type) {
        case 'daily_rewards':
          await rewardCalculator.calculateDailyRewards();
          break;
        case 'weekly_rewards':
          await rewardCalculator.calculateWeeklyRewards();
          break;
        case 'coin_performance':
          await rewardCalculator.calculateCoinPerformanceRewards(data.coinId);
          break;
        case 'update_all_coins':
          await coinTracker.updateAllCoins();
          break;
        case 'update_coin_metrics':
          await coinTracker.updateCoinMetrics(data.coinId, data.mintAddress);
          break;
        default:
          throw new Error(`Unknown reward calculation type: ${type}`);
      }
      
      logger.info(`Reward calculation job completed: ${type}`);
    } catch (error) {
      logger.error(`Error processing reward calculation job ${type}:`, error);
      throw error;
    }
  },
  { connection: redis }
);

const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    const { type, data } = job.data;
    logger.info(`Processing notification job: ${type}`);
    
    try {
      switch (type) {
        case 'trend_update':
          await notificationService.sendTrendUpdateNotification(data);
          break;
        case 'reward_earned':
          await notificationService.sendRewardEarnedNotification(data);
          break;
        case 'coin_milestone':
          await notificationService.sendCoinMilestoneNotification(data);
          break;
        default:
          throw new Error(`Unknown notification type: ${type}`);
      }
      
      logger.info(`Notification job completed: ${type}`);
    } catch (error) {
      logger.error(`Error processing notification job ${type}:`, error);
      throw error;
    }
  },
  { connection: redis }
);

// Schedule daily reward calculation at 00:00 UTC
cron.schedule('0 0 * * *', async () => {
  logger.info('Scheduling daily reward calculation...');
  await rewardCalculationQueue.add('daily_rewards', { type: 'daily_rewards' });
});

// Schedule weekly reward calculation on Sundays at 00:00 UTC
cron.schedule('0 0 * * 0', async () => {
  logger.info('Scheduling weekly reward calculation...');
  await rewardCalculationQueue.add('weekly_rewards', { type: 'weekly_rewards' });
});

// Schedule coin metrics update every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  logger.info('Scheduling coin metrics update...');
  await coinTrackingQueue.add('update_all_coins', { type: 'update_all_coins' });
});

// Schedule coin performance check every hour
cron.schedule('0 * * * *', async () => {
  logger.info('Scheduling coin performance check...');
  const highPerformers = await coinTracker.detectHighPerformers();
  
  for (const coinId of highPerformers) {
    await rewardCalculationQueue.add('coin_performance', {
      type: 'coin_performance',
      data: { coinId }
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  await rewardCalculationWorker.close();
  await notificationWorker.close();
  await rewardCalculationQueue.close();
  await notificationQueue.close();
  await coinTrackingQueue.close();
  await redis.quit();
  await database.close();
  
  process.exit(0);
});

// Start workers
logger.info('🚀 BullMQ Worker service started');
logger.info('📊 Reward calculation worker: active');
logger.info('🔔 Notification worker: active');
logger.info('💰 Coin tracking worker: active');
logger.info('⏰ Scheduled jobs: daily rewards, weekly rewards, coin metrics (5min), coin performance (1h)');

// Keep the process alive
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});