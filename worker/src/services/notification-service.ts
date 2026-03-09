import { DatabaseService } from './database';
import { logger } from '../utils/logger';
import nodemailer from 'nodemailer';
import { io } from 'socket.io-client';

export interface NotificationData {
  type: 'trend_created' | 'coin_added' | 'reward_earned' | 'daily_summary' | 'performance_alert';
  title: string;
  message: string;
  data?: any;
}

export class NotificationService {
  private emailTransporter: nodemailer.Transporter;
  private socketClient: any;

  constructor(private database: DatabaseService, private logger?: any) {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Initialize Socket.IO client for real-time notifications
    this.socketClient = io(process.env.FRONTEND_URL || 'http://localhost:3000');
  }

  async sendNotification(userId: string, type: string, data: any): Promise<any> {
    try {
      const user = await this.database.getUser(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const notification = this.createNotification(type, data);
      
      // Store notification in database
      await this.database.createNotification({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        status: 'sent'
      });

      // Send real-time notification via WebSocket
      await this.sendRealtimeNotification(userId, notification);

      // Send email notification if user has email
      if (user.email && this.shouldSendEmail(type)) {
        await this.sendEmailNotification(user.email, notification);
      }

      logger.info(`Notification sent to user ${userId}: ${notification.title}`);

      return {
        status: 'success',
        user_id: userId,
        notification_type: type,
        channels: ['realtime', user.email ? 'email' : null].filter(Boolean)
      };

    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  }

  private createNotification(type: string, data: any): NotificationData {
    switch (type) {
      case 'trend_created':
        return {
          type: 'trend_created',
          title: 'New Trend Created',
          message: `Your trend "${data.trend_title}" has been created and is now live!`,
          data: { trend_id: data.trend_id, trend_title: data.trend_title }
        };

      case 'coin_added':
        return {
          type: 'coin_added',
          title: 'Coin Added to Your Trend',
          message: `A new coin "${data.coin_symbol}" has been added to your trend "${data.trend_title}"`,
          data: { 
            coin_id: data.coin_id, 
            coin_symbol: data.coin_symbol, 
            trend_id: data.trend_id,
            trend_title: data.trend_title 
          }
        };

      case 'reward_earned':
        return {
          type: 'reward_earned',
          title: 'Reward Earned!',
          message: `You've earned ${data.amount} $TREND for your contribution to "${data.trend_title}"`,
          data: { 
            amount: data.amount, 
            trend_id: data.trend_id, 
            trend_title: data.trend_title,
            reward_type: data.reward_type 
          }
        };

      case 'daily_summary':
        return {
          type: 'daily_summary',
          title: 'Daily Summary',
          message: `Today you earned ${data.earnings} $TREND, created ${data.trends_created} trends, and spotted ${data.coins_spotted} coins`,
          data: {
            earnings: data.earnings,
            trends_created: data.trends_created,
            coins_spotted: data.coins_spotted
          }
        };

      case 'performance_alert':
        return {
          type: 'performance_alert',
          title: 'High Performance Alert',
          message: `Your coin "${data.coin_symbol}" is performing exceptionally well with ${data.performance}% growth!`,
          data: {
            coin_id: data.coin_id,
            coin_symbol: data.coin_symbol,
            performance: data.performance
          }
        };

      default:
        return {
          type: 'trend_created',
          title: 'Notification',
          message: 'You have a new notification',
          data: data
        };
    }
  }

  private async sendRealtimeNotification(userId: string, notification: NotificationData): Promise<void> {
    try {
      this.socketClient.emit('notification', {
        user_id: userId,
        notification
      });
    } catch (error) {
      logger.error('Error sending real-time notification:', error);
    }
  }

  private async sendEmailNotification(email: string, notification: NotificationData): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@trend2earn.com',
        to: email,
        subject: `TREND - ${notification.title}`,
        html: this.generateEmailTemplate(notification)
      };

      await this.emailTransporter.sendMail(mailOptions);
      logger.info(`Email notification sent to ${email}`);
    } catch (error) {
      logger.error('Error sending email notification:', error);
    }
  }

  private generateEmailTemplate(notification: NotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>TREND Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 TREND</h1>
            <h2>${notification.title}</h2>
          </div>
          <div class="content">
            <p>${notification.message}</p>
            ${this.getEmailActionButton(notification)}
            <p>Keep hunting for alpha and earning rewards!</p>
          </div>
          <div class="footer">
            <p>This is an automated message from TREND. Please do not reply to this email.</p>
            <p>© 2024 TREND. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getEmailActionButton(notification: NotificationData): string {
    switch (notification.type) {
      case 'trend_created':
        return `<a href="${process.env.FRONTEND_URL}/trends/${notification.data?.trend_id}" class="button">View Trend</a>`;
      case 'coin_added':
        return `<a href="${process.env.FRONTEND_URL}/coins/${notification.data?.coin_id}" class="button">View Coin</a>`;
      case 'reward_earned':
        return `<a href="${process.env.FRONTEND_URL}/rewards" class="button">View Rewards</a>`;
      case 'performance_alert':
        return `<a href="${process.env.FRONTEND_URL}/coins/${notification.data?.coin_id}" class="button">View Performance</a>`;
      default:
        return `<a href="${process.env.FRONTEND_URL}" class="button">Visit TREND</a>`;
    }
  }

  private shouldSendEmail(type: string): boolean {
    // Only send emails for important notifications
    const emailTypes = ['reward_earned', 'daily_summary', 'performance_alert'];
    return emailTypes.includes(type);
  }

  async sendBulkNotification(userIds: string[], type: string, data: any): Promise<any> {
    try {
      const results = [];
      
      for (const userId of userIds) {
        try {
          const result = await this.sendNotification(userId, type, data);
          results.push({ user_id: userId, status: 'success', result });
        } catch (error) {
          results.push({ user_id: userId, status: 'failed', error: (error as Error).message });
        }
      }

      const successCount = results.filter(r => r.status === 'success').length;
      const failureCount = results.filter(r => r.status === 'failed').length;

      logger.info(`Bulk notification sent: ${successCount} success, ${failureCount} failed`);

      return {
        status: 'completed',
        total: userIds.length,
        success: successCount,
        failed: failureCount,
        results
      };

    } catch (error) {
      logger.error('Error sending bulk notification:', error);
      throw error;
    }
  }

  async sendTrendUpdateNotification(data: any): Promise<void> {
    try {
      logger.info('Sending trend update notification...');
      // Implementation for trend update notifications
    } catch (error) {
      logger.error('Error sending trend update notification:', error);
      throw error;
    }
  }

  async sendRewardEarnedNotification(data: any): Promise<void> {
    try {
      logger.info('Sending reward earned notification...');
      // Implementation for reward earned notifications
    } catch (error) {
      logger.error('Error sending reward earned notification:', error);
      throw error;
    }
  }

  async sendCoinMilestoneNotification(data: any): Promise<void> {
    try {
      logger.info('Sending coin milestone notification...');
      // Implementation for coin milestone notifications
    } catch (error) {
      logger.error('Error sending coin milestone notification:', error);
      throw error;
    }
  }
}


