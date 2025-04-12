import api from './index';
import { Upload } from '../types';

export const checkGoogleDrive = async (): Promise<any> => {
  const response = await api.post('/ingest/drive-check');
  return response.data;
};

export const uploadFile = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/ingest/manual', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
