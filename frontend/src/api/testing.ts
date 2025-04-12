import api from './index';
import { TestResult } from '../types';

export const startTest = async (testData: any): Promise<any> => {
  const response = await api.post('/test/start', testData);
  return response.data;
};

export const getTestResults = async (testId: string): Promise<TestResult> => {
  const response = await api.get(`/test/results/${testId}`);
  return response.data;
};
