import api from './axios';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getDoctors: () => api.get('/users/doctors'),
  getOne: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  deactivate: (id) => api.put(`/users/${id}/deactivate`),
  activate: (id) => api.put(`/users/${id}/activate`),
};

export const patientAPI = {
  getAll: (params) => api.get('/patients', { params }),
  getOne: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
  getHistory: (id) => api.get(`/patients/${id}/history`),
};

export const appointmentAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getOne: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
  getSchedule: (params) => api.get('/appointments/schedule', { params }),
};

export const prescriptionAPI = {
  getAll: (params) => api.get('/prescriptions', { params }),
  getOne: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
  downloadPDF: (id) => api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' }),
};

export const aiAPI = {
  checkSymptoms: (data) => api.post('/ai/symptoms', data),
  explainPrescription: (data) => api.post('/ai/explain', data),
  getRiskFlags: (patientId) => api.get(`/ai/risk/${patientId}`),
  getTokenBalance: () => api.get('/ai/tokens'),
  // Send userId as string and tokens as number
  addTokens: (userId, tokens) => api.post('/ai/tokens/add', {
    userId: String(userId),
    tokens: Number(tokens),
  }),
};

export const analyticsAPI = {
  admin: () => api.get('/analytics/admin'),
  doctor: () => api.get('/analytics/doctor'),
};