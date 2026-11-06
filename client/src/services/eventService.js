import api from './api.js';

export const eventService = {
  list: (params) => api.get('/events', { params }).then((r) => r.data),
  get: (id) => api.get(`/events/${id}`).then((r) => r.data),
  myEvents: () => api.get('/events/organizer/my-events').then((r) => r.data.items),
  create: (data) => api.post('/events', data).then((r) => r.data),
  update: (id, data) => api.put(`/events/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/events/${id}`).then((r) => r.data),
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/upload/event-image', form).then((r) => r.data.url);
  },
};

export const CATEGORIES = ['Cultural', 'Sports', 'Technical', 'Workshop', 'Seminar', 'Others'];
