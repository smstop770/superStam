import axios from 'axios';

// In dev: Vite proxies /api → localhost:4000
// In prod: VITE_API_URL=http://38.242.215.142:4003
const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';
const api = axios.create({ baseURL: BASE });

// Attach JWT token to admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// ---- Auth ----
export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password }).then((r) => r.data);

export const getMe = () => api.get('/auth/me').then((r) => r.data);

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.put('/auth/password', { currentPassword, newPassword }).then((r) => r.data);

// ---- Categories ----
export const getCategories = () => api.get('/categories').then((r) => r.data);
export const getCategoriesFlat = () => api.get('/categories/flat').then((r) => r.data);
export const getCategory = (id: string) => api.get(`/categories/${id}`).then((r) => r.data);
export const createCategory = (data: any) => api.post('/categories', data).then((r) => r.data);
export const updateCategory = (id: string, data: any) => api.put(`/categories/${id}`, data).then((r) => r.data);
export const deleteCategory = (id: string) => api.delete(`/categories/${id}`).then((r) => r.data);

// ---- Products ----
export const getProducts = (params?: Record<string, any>) =>
  api.get('/products', { params }).then((r) => r.data);
export const getProduct = (id: string) => api.get(`/products/${id}`).then((r) => r.data);
export const createProduct = (data: any) => api.post('/products', data).then((r) => r.data);
export const updateProduct = (id: string, data: any) => api.put(`/products/${id}`, data).then((r) => r.data);
export const deleteProduct = (id: string) => api.delete(`/products/${id}`).then((r) => r.data);

// ---- Orders ----
export const createOrder = (data: any) => api.post('/orders', data).then((r) => r.data);
export const getOrders = (params?: Record<string, any>) =>
  api.get('/orders', { params }).then((r) => r.data);
export const getOrder = (id: string) => api.get(`/orders/${id}`).then((r) => r.data);
export const updateOrderStatus = (id: string, status: string) =>
  api.put(`/orders/${id}/status`, { status }).then((r) => r.data);
export const deleteOrder = (id: string) => api.delete(`/orders/${id}`).then((r) => r.data);

// ---- Settings ----
export const getSettings = () => api.get('/settings').then((r) => r.data);
export const getAllSettings = () => api.get('/settings/all').then((r) => r.data);
export const updateSettings = (data: Record<string, string>) =>
  api.put('/settings', data).then((r) => r.data);

// ---- Contact ----
export const submitContact = (data: any) => api.post('/contact', data).then((r) => r.data);
export const getContacts = (params?: Record<string, any>) =>
  api.get('/contact', { params }).then((r) => r.data);
export const markContactRead = (id: string) => api.put(`/contact/${id}/read`).then((r) => r.data);
export const replyContact = (id: string, reply: string) =>
  api.put(`/contact/${id}/reply`, { reply }).then((r) => r.data);
export const deleteContact = (id: string) => api.delete(`/contact/${id}`).then((r) => r.data);

// ---- Upload ----
export const uploadImage = (file: File) => {
  const form = new FormData();
  form.append('image', file);
  return api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
};

export default api;
