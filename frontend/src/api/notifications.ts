import api from './index';
import { Notification } from '../types';

export const getNotifications = async (params?: any): Promise<Notification[]> => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

export const markNotificationRead = async (notificationId: number): Promise<any> => {
  const response = await api.post(`/notifications/${notificationId}/read`);
  return response.data;
};

export const archiveNotification = async (notificationId: number): Promise<any> => {
  const response = await api.post(`/notifications/${notificationId}/archive`);
  return response.data;
};
