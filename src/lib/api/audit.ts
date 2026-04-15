import { apiClient } from './client';

export interface AuditSummary {
  store: string;
  totalSupplied: number;
  totalSold: number;
  currentInventory: number;
  mismatch: number;
}

export const getAudit = (storeAddress: string): Promise<AuditSummary> => {
  return apiClient.get(`audit/${storeAddress}`);
};

export const getInventory = (store: string, drugId: number): Promise<{ quantity: number }> => {
  return apiClient.get(`inventory/${store}/${drugId}`);
};
