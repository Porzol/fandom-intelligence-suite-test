import api from './index';
import { SimulationResponse, SimulationMessageResponse, SimulationResult } from '../types';

export const startSimulation = async (simulationData: any): Promise<SimulationResponse> => {
  const response = await api.post('/simulate/start', simulationData);
  return response.data;
};

export const sendSimulationMessage = async (simulationId: string, message: string): Promise<SimulationMessageResponse> => {
  const response = await api.post(`/simulate/message/${simulationId}`, { message });
  return response.data;
};

export const endSimulation = async (simulationId: string): Promise<SimulationResult> => {
  const response = await api.get(`/simulate/end/${simulationId}`);
  return response.data;
};
