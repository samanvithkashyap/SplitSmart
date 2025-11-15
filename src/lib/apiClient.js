const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  get baseUrl() {
    return API_BASE;
  },
  async request(path, { method = 'GET', body } = {}) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof payload === 'string' ? payload : payload?.message;
      throw new Error(message || 'Request failed');
    }
    return payload;
  },
};
