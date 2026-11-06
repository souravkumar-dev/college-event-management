import api from './api.js';

export const authService = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data.user),
  updateMe: (data) => api.put('/auth/me', data).then((r) => r.data.user),
  logout: () => api.post('/auth/logout').catch(() => {}),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  google: (credential) => api.post('/auth/google', { credential }).then((r) => r.data),
  saved: () => api.get('/auth/saved').then((r) => r.data.items),
  save: (id) => api.post(`/auth/saved/${id}`).then((r) => r.data),
  unsave: (id) => api.delete(`/auth/saved/${id}`).then((r) => r.data),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }).then((r) => r.data),
};
