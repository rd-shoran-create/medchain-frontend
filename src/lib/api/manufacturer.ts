import { apiClient } from './client';

export interface ManufacturerSupplyEvent {
  manufacturer: string;
  dealer: string;
  drugId: number;
  quantity: number;
  timestamp: number;
  transactionHash: string;
}

export const getManufacturerHistory = (): Promise<ManufacturerSupplyEvent[]> => {
  return apiClient.get('/manufacturer/history');
};

export const mintSupplyToDealer = (data: { dealerAddress: string; drugId: number; quantity: number }): Promise<{ status: string, txHash: string }> => {
  return apiClient.post('/manufacturer/supply', data);
};

export const getDealers = (): Promise<{ address: string; name: string }[]> => {
  return apiClient.get('/dealers');
};

export const getDealerInventory = (dealer: string, drugId: number): Promise<{ quantity: number }> => {
  return apiClient.get(`/dealer/inventory/${dealer}/${drugId}`);
};

export const getManufacturerLimits = (manufacturer: string, drugId: number): Promise<{ limit: number; minted: number; remaining: number }> => {
  return apiClient.get(`/manufacturer/limits/${manufacturer}/${drugId}`);
};
