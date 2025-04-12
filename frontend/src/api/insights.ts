import api from './index';
import { AIInsight, AIInsightGenerateParams } from '../types';

export const getInsights = async (params?: {
  target_type?: string;
  target_id?: number;
  is_archived?: boolean;
}): Promise<AIInsight[]> => {
  try {
    const response = await api.get('/insights', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching insights:', error);
    throw error;
  }
};

export const getInsight = async (id: number): Promise<AIInsight> => {
  try {
    const response = await api.get(`/insights/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching insight ${id}:`, error);
    throw error;
  }
};

export const generateInsights = async (params: AIInsightGenerateParams): Promise<any> => {
  try {
    const response = await api.post('/insights/generate', params);
    return response.data;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
};

export const archiveInsight = async (id: number): Promise<AIInsight> => {
  try {
    const response = await api.post(`/insights/archive/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error archiving insight ${id}:`, error);
    throw error;
  }
};

export const unarchiveInsight = async (id: number): Promise<AIInsight> => {
  try {
    const response = await api.post(`/insights/unarchive/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error unarchiving insight ${id}:`, error);
    throw error;
  }
};

export const createInsight = async (insight: any): Promise<AIInsight> => {
  try {
    const response = await api.post('/insights', insight);
    return response.data;
  } catch (error) {
    console.error('Error creating insight:', error);
    throw error;
  }
};

export const updateInsight = async (id: number, insight: any): Promise<AIInsight> => {
  try {
    const response = await api.put(`/insights/${id}`, insight);
    return response.data;
  } catch (error) {
    console.error(`Error updating insight ${id}:`, error);
    throw error;
  }
};

export const deleteInsight = async (id: number): Promise<void> => {
  try {
    await api.delete(`/insights/${id}`);
  } catch (error) {
    console.error(`Error deleting insight ${id}:`, error);
    throw error;
  }
};
