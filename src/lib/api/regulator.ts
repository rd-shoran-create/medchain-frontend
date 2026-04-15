import { apiClient } from './client';

export interface EntityInfo {
  name: string;
  role: string;
  address: string;
}

export interface ProductionTrace {
  manufacturerAddress: string;
  manufacturerName: string;
  dealerAddress: string;
  dealerName: string;
  drugId: number;
  quantity: number;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export interface DistributionTrace {
  dealerAddress: string;
  dealerName: string;
  storeAddress: string;
  storeName: string;
  drugId: number;
  quantity: number;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export interface PatientInfo {
  patientName: string;
  fatherName: string;
  address: string;
  mobileNo: string;
  aadharNo: string;
  issuedBy: string;
  shortCode: string;
}

export interface DispenseTrace {
  prescriptionId: string;
  storeAddress: string;
  storeName: string;
  drugId: number;
  quantity: number;
  patientHash: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
  patient: PatientInfo | null;
}

export const getAllEntities = (): Promise<EntityInfo[]> => {
  return apiClient.get('/entities/all');
};

export const getHospitals = (): Promise<{ address: string; name: string }[]> => {
  return apiClient.get('/hospitals');
};

export const getTraceProduction = (): Promise<ProductionTrace[]> => {
  return apiClient.get('/trace/production');
};

export const getTraceDistribution = (): Promise<DistributionTrace[]> => {
  return apiClient.get('/trace/distribution');
};

export const getTraceDispense = (): Promise<DispenseTrace[]> => {
  return apiClient.get('/trace/dispense');
};

export const registerEntity = (type: string, data: any): Promise<{ status: string; txHash: string }> => {
  return apiClient.post(`/entities/${type}`, data);
};

export const setManufacturerLimit = (data: { manufacturerAddress: string; drugId: number; maxAmount: number }): Promise<{ status: string; txHash: string }> => {
  return apiClient.post('/manufacturer/limit', data);
};
