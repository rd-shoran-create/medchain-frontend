import { apiClient } from './client';

export interface Prescription {
  prescriptionId: string;
  patientHash: string;
  drugId: number;
  totalQty: number;
  remainingQty: number;
  hospital: string;
  active: boolean;
  transactionHash: string;
}

export const getPrescriptions = (patientId?: string): Promise<Prescription[]> => {
  const url = patientId ? `/prescriptions?patientId=${patientId}` : '/prescriptions';
  return apiClient.get(url);
};

export const getPrescription = (id: string): Promise<Partial<Prescription>> => {
  return apiClient.get(`/prescription/${id}`);
};

export const issuePrescription = (data: FormData): Promise<{ status: string, txHash: string, slipHash: string, metadata?: any }> => {
  return apiClient.post('/prescription', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const verifySlip = (slipHash: string): Promise<{ valid: boolean, prescriptionId: string, drugId: number, remainingQty: number }> => {
  return apiClient.get(`/prescription/slip/${slipHash}`);
};

export const getPrescriptionMetadata = (slipHash: string): Promise<any> => {
  return apiClient.get(`/prescription/metadata/${slipHash}`);
};

export const getPatients = (doctorId?: string): Promise<any[]> => {
  const url = doctorId ? `/patients?doctorId=${doctorId}` : '/patients';
  return apiClient.get(url);
};

export const searchPatients = (query: string): Promise<any[]> => {
  return apiClient.get(`/patients/search?query=${query}`);
};

export const registerPatient = (data: any): Promise<{ status: string, patient: any }> => {
  return apiClient.post('/patients', data);
};