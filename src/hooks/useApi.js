import { useCallback } from 'react';
import { apiClient } from '../lib/apiClient.js';

export function useApi() {
  const request = useCallback(async (path, options = {}) => {
    try {
      return await apiClient.request(path, options);
    } catch (error) {
      throw error;
    }
  }, []);

  return { request };
}
