import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  toggleUser: (id) => api.put(`/auth/users/${id}/toggle`),
};

// ===== PRODUCTS =====
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  getCategories: () => api.get('/products/categories'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// ===== BILLS =====
export const billAPI = {
  create: (data) => api.post('/bills', data),
  getAll: (params) => api.get('/bills', { params }),
  getById: (id) => api.get(`/bills/${id}`),
  cancel: (id, reason) => api.post(`/bills/${id}/cancel`, { reason }),
};

// ===== CUSTOMERS =====
export const customerAPI = {
  search: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
};

// ===== DASHBOARD =====
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// ===== REPORTS =====
export const reportAPI = {
  getGSTR1: (month, format) => api.get('/reports/gstr1', { params: { month, format }, responseType: format === 'csv' ? 'blob' : 'json' }),
  getSales: (params) => api.get('/reports/sales', { params }),
};

export default api;
