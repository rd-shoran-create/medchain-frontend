import { apiClient } from './client';

export interface SupplyEvent {
  dealer: string;
  store: string;
  drugId: number;
  quantity: number;
  transactionHash: string;
}

export const getSupplyHistory = (): Promise<SupplyEvent[]> => {
  return apiClient.get('/supply/history');
};

export const recordSupply = (data: { storeAddress: string; drugId: number; quantity: number }): Promise<{ status: string, txHash: string }> => {
  return apiClient.post('/supply', data);
};
