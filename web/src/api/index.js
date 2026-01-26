import axios from 'axios';
import * as mock from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle unauthorized errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

export const authApi = {
    loginWithGoogle: (idToken) => USE_MOCK ? Promise.resolve({ data: { accessToken: 'mock-jwt', user: { id: 'u1', name: 'Rohit', email: 'rohit@example.com' } } }) : api.post('/auth/google', { idToken }),
    getCurrentUser: () => USE_MOCK ? Promise.resolve({ data: { id: 'u1', name: 'Rohit', email: 'rohit@example.com' } }) : api.get('/auth/me'),
    devLogin: (email, name) => api.post('/auth/dev-login', { email, name }),
};

export const plansApi = {
    getAll: () => USE_MOCK ? Promise.resolve({ data: mock.mockPlans }) : api.get('/plans'),
    getCurrent: () => USE_MOCK ? Promise.resolve({ data: mock.mockPlans[0] }) : api.get('/plans/current'),
    getById: (id) => USE_MOCK ? Promise.resolve({ data: mock.mockPlans[0] }) : api.get(`/plans/${id}`),
    getCalendar: (id) => USE_MOCK ? Promise.resolve({ data: mock.mockCalendar }) : api.get(`/plans/${id}/calendar`),
    create: (data) => api.post('/plans', data),
    update: (id, data) => api.put(`/plans/${id}`, data),
    delete: (id) => api.delete(`/plans/${id}`),
};

export const tripsApi = {
    getAll: () => USE_MOCK ? Promise.resolve({ data: mock.mockTrips }) : api.get('/trips'),
    getById: (id) => api.get(`/trips/${id}`),
    getMembers: (id) => api.get(`/trips/${id}/members`),
    create: (data) => api.post('/trips', data),
    update: (id, data) => api.put(`/trips/${id}`, data),
    delete: (id) => api.delete(`/trips/${id}`),
    invite: (id, email) => api.post(`/trips/${id}/invite`, { email }),
    acceptInvite: (code) => api.post(`/trips/invitations/accept/${code}`),
};

export const expenseApi = {
    getTripExpenses: (tripId) => USE_MOCK ? Promise.resolve({ data: mock.mockExpenses }) : api.get(`/trips/${tripId}/expenses`),
    getSummary: (tripId) => USE_MOCK ? Promise.resolve({ data: mock.mockSummary }) : api.get(`/trips/${tripId}/expenses/summary`),
    add: (tripId, data) => api.post(`/trips/${tripId}/expenses`, data),
    settle: (splitId) => api.post(`/expenses/splits/${splitId}/settle`),
    batchSettle: (splitIds) => api.post('/expenses/splits/batch-settle', { splitIds }),
};

export const aiApi = {
    suggestDestinations: (data) => USE_MOCK ? Promise.resolve({ data: mock.mockAISuggestions }) : api.post('/ai/suggest-destinations', data),
    estimateCost: (data) => api.post('/ai/estimate-cost', data),
    getSeasonalRecommendation: (data) => api.post('/ai/seasonal-recommendation', data),
    quickSuggest: (month, groupType, travelType, budget) =>
        api.get(`/ai/suggest/${month}`, { params: { groupType, travelType, budget } }),
};

export const adminApi = {
    getUsers: () => api.get('/admin/users'),
    getActivity: () => api.get('/admin/activity'),
    getIssues: () => api.get('/admin/issues'),
};
