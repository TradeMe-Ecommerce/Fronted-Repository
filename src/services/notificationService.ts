import { notifications } from './mockData';
import { Notification } from '../types';
import { getUserId } from '../utils/auth';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const userId = getUserId() || 1; // Default to user 1 for demo
    return notifications
      .filter(n => n.userId === userId)
      .map(notification => ({
        ...notification,
        date: new Date(notification.date).toISOString() // Ensure date is serialized
      }));
  },

  async markAsRead(id: number): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app, we would update the notification status in the database
  },

  async markAllAsRead(): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app, we would update all notifications status in the database
  }
};