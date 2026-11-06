import api from './api.js';

export const registrationService = {
  create: (data) => api.post('/registrations', data).then((r) => r.data),
  mine: (params) => api.get('/registrations/my', { params }).then((r) => r.data.items),
  all: (params) => api.get('/registrations', { params }).then((r) => r.data),
  get: (id) => api.get(`/registrations/${id}`).then((r) => r.data),
  setStatus: (id, status) => api.patch(`/registrations/${id}/status`, { status }).then((r) => r.data),
  cancel: (id) => api.patch(`/registrations/${id}/cancel`).then((r) => r.data),
};

export const dashboardService = {
  student: () => api.get('/dashboard/student').then((r) => r.data),
  organizer: () => api.get('/dashboard/organizer').then((r) => r.data),
};
