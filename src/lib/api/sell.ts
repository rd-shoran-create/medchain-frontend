import { apiClient } from './client';

export interface SaleEvent {
  prescriptionId: string;
  store: string;
  quantity: number;
  patientHash: string;
  drugId: number;
  transactionHash: string;
}

export const getSales = (): Promise<SaleEvent[]> => {
  return apiClient.get('/sales');
};

export const sellWithPrescription = (data: { 
  slipHash: string; 
  patientName: string; 
  quantity: number; 
  itemIndex: number 
}): Promise<{ status: string, txHash: string }> => {
  return apiClient.post('/sell', data);
};
