import { apiClient } from './client';

export interface Store {
  address: string;
  name: string;
}

export const getStores = (): Promise<Store[]> => {
  return apiClient.get('/stores');
};
