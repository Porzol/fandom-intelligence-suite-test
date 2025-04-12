import api from './index';
import { Fan, Chatter, Creator } from '../types';

export const getFans = async (params?: any): Promise<Fan[]> => {
  const response = await api.get('/dashboard/fans', { params });
  return response.data;
};

export const getChatters = async (params?: any): Promise<Chatter[]> => {
  const response = await api.get('/dashboard/chatters', { params });
  return response.data;
};

export const getCreators = async (params?: any): Promise<Creator[]> => {
  const response = await api.get('/dashboard/creators', { params });
  return response.data;
};
