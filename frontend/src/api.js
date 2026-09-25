const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('stagematch_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),

  getSkills: () => request('/skills', { auth: false }),

  getMyStudentProfile: () => request('/students/me'),
  updateMyStudentProfile: (payload) => request('/students/me', { method: 'PUT', body: payload }),
  uploadCv: (payload) => request('/students/me/cv', { method: 'POST', body: payload }),
  getRecommendations: () => request('/students/recommendations'),
  getMyApplications: () => request('/students/applications'),

  getInternships: (params = {}) => request(`/internships?${new URLSearchParams(params)}`, { auth: false }),
  getInternship: (id) => request(`/internships/${id}`, { auth: false }),
  applyToInternship: (id) => request(`/internships/${id}/apply`, { method: 'POST' }),

  getMyCompany: () => request('/companies/me'),
  updateMyCompany: (payload) => request('/companies/me', { method: 'PUT', body: payload }),
  createInternship: (payload) => request('/companies/internships', { method: 'POST', body: payload }),
  getMyInternships: () => request('/companies/internships'),
  getCandidates: (internshipId) => request(`/companies/internships/${internshipId}/candidates`),
  updateApplicationStatus: (applicationId, status) =>
    request(`/companies/applications/${applicationId}/status`, { method: 'PATCH', body: { status } }),

  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  getPendingCompanies: () => request('/admin/companies/pending'),
  validateCompany: (id, decision) => request(`/admin/companies/${id}/validate`, { method: 'PATCH', body: { decision } }),
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: () => request('/admin/users'),
  deactivateUser: (id) => request(`/admin/users/${id}/deactivate`, { method: 'PATCH' }),

  getAdminSkills: () => request('/admin/skills'),
  createAdminSkill: (payload) => request('/admin/skills', { method: 'POST', body: payload }),
  deleteAdminSkill: (id) => request(`/admin/skills/${id}`, { method: 'DELETE' }),

  getAdminFields: () => request('/admin/fields'),
  createAdminField: (payload) => request('/admin/fields', { method: 'POST', body: payload }),
  deleteAdminField: (id) => request(`/admin/fields/${id}`, { method: 'DELETE' }),
};
