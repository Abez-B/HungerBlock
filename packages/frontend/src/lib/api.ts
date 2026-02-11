import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('auth_token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Generic request helper
async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await api(url, options);
    return response.data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
    getNonce: () => api.get<{ nonce: string }>('/auth/nonce'),

    login: (signature: string, message: string, address: string) =>
        api.post<{ token: string; user: any }>('/auth/login', { signature, message, address }),

    register: (walletAddress: string, name?: string, email?: string) =>
        api.post<{ user: any }>('/auth/register', { walletAddress, name, email }),
};

// ─── Donations ───────────────────────────────────────────────────────────────

export const donationsAPI = {
    create: (formData: FormData) =>
        api.post('/donations', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    list: (params?: { status?: string; donorAddress?: string; limit?: number; offset?: number }) =>
        api.get('/donations', { params }),

    getById: (id: string) => api.get(`/donations/${id}`),

    cancel: (id: string) => api.patch(`/donations/${id}/cancel`),
};

// ─── Requests ────────────────────────────────────────────────────────────────

export const requestsAPI = {
    create: (data: {
        foodType: string;
        quantityNeeded: number;
        location: string;
        urgencyLevel: number;
    }) => api.post('/requests', data),

    list: (params?: { status?: string; ngoAddress?: string; limit?: number; offset?: number }) =>
        api.get('/requests', { params }),

    getById: (id: string) => api.get(`/requests/${id}`),

    cancel: (id: string) => api.patch(`/requests/${id}/cancel`),
};

// ─── Matches ─────────────────────────────────────────────────────────────────

export const matchesAPI = {
    create: (donationId: string, requestId: string) =>
        api.post('/matches', { donationId, requestId }),

    list: (params?: { verified?: boolean; limit?: number; offset?: number }) =>
        api.get('/matches', { params }),

    verify: (id: string) => api.post(`/matches/${id}/verify`),

    getSuggestions: () => api.get('/matches/suggest'),
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const usersAPI = {
    getMe: () => api.get('/users/me'),

    updateMe: (data: { name?: string; email?: string }) =>
        api.patch('/users/me', data),

    getStats: (address: string) => api.get(`/users/${address}/stats`),
};

// ─── AI ──────────────────────────────────────────────────────────────────────

export const aiAPI = {
    classify: (imageFile: File) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return api.post('/ai/classify', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    freshness: (imageFile: File) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return api.post('/ai/freshness', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
