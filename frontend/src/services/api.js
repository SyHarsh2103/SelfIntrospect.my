import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const unwrap = (res) => res.data?.data ?? res.data;

export const publicApi = {
  getTemplates: () => api.get("/questionnaire-templates").then(unwrap),
  getQuestions: (templateKey) =>
    api
      .get("/questions", {
        params: templateKey ? { templateKey } : {},
      })
      .then(unwrap),
  getChakras: () => api.get("/chakras").then(unwrap),
  getNadis: () => api.get("/nadis").then(unwrap),
  getContent: (key) => api.get(`/content/${key}`).then(unwrap),
  submit: (payload) => api.post("/submit", payload).then(unwrap),
  getResult: (sessionId) => api.get(`/result/${sessionId}`).then(unwrap),
  updateResultUserInfo: (sessionId, payload) =>
    api.patch(`/result/${sessionId}/user-info`, payload).then(unwrap),
};

export const adminApi = {
  login: (payload) => api.post("/admin/login", payload).then(unwrap),
  forgotPassword: (payload) =>
    api.post("/admin/forgot-password", payload).then(unwrap),
  verifyOtp: (payload) => api.post("/admin/verify-otp", payload).then(unwrap),
  resetPassword: (payload) =>
    api.post("/admin/reset-password", payload).then(unwrap),
  getProfile: () => api.get("/admin/me").then(unwrap),

  getAdminUsers: () => api.get("/admin/users").then(unwrap),
  createAdminUser: (payload) => api.post("/admin/users", payload).then(unwrap),
  updateAdminUser: (id, payload) => api.put(`/admin/users/${id}`, payload).then(unwrap),
  deleteAdminUser: (id) => api.delete(`/admin/users/${id}`).then(unwrap),

  getAnalytics: () => api.get("/admin/analytics").then(unwrap),
  getResults: () => api.get("/admin/results").then(unwrap),

  getQuestions: () => api.get("/admin/questions").then(unwrap),
  createQuestion: (payload) => api.post("/admin/questions", payload).then(unwrap),
  updateQuestion: (id, payload) => api.put(`/admin/questions/${id}`, payload).then(unwrap),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`).then(unwrap),

  getOptions: () => api.get("/admin/options").then(unwrap),
  createOption: (payload) => api.post("/admin/options", payload).then(unwrap),
  updateOption: (id, payload) => api.put(`/admin/options/${id}`, payload).then(unwrap),
  deleteOption: (id) => api.delete(`/admin/options/${id}`).then(unwrap),

  getChakras: () => api.get("/admin/chakras").then(unwrap),
  updateChakra: (id, payload) => api.put(`/admin/chakras/${id}`, payload).then(unwrap),

  getNadis: () => api.get("/admin/nadis").then(unwrap),
  updateNadi: (id, payload) => api.put(`/admin/nadis/${id}`, payload).then(unwrap),

  getRemedies: () => api.get("/admin/remedies").then(unwrap),
  createRemedy: (payload) => api.post("/admin/remedies", payload).then(unwrap),
  updateRemedy: (id, payload) => api.put(`/admin/remedies/${id}`, payload).then(unwrap),
  deleteRemedy: (id) => api.delete(`/admin/remedies/${id}`).then(unwrap),

  getMantras: () => api.get("/admin/mantras").then(unwrap),
  createMantra: (payload) => api.post("/admin/mantras", payload).then(unwrap),
  updateMantra: (id, payload) => api.put(`/admin/mantras/${id}`, payload).then(unwrap),
  deleteMantra: (id) => api.delete(`/admin/mantras/${id}`).then(unwrap),

  getContentBlocks: () => api.get("/admin/content").then(unwrap),
  updateContent: (key, payload) => api.put(`/admin/content/${key}`, payload).then(unwrap),

  getTemplates: () => api.get("/admin/templates").then(unwrap),
  createTemplate: (payload) => api.post("/admin/templates", payload).then(unwrap),
  updateTemplate: (id, payload) => api.put(`/admin/templates/${id}`, payload).then(unwrap),
  deleteTemplate: (id) => api.delete(`/admin/templates/${id}`).then(unwrap),
};

export default api;