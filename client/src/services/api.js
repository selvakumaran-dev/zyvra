import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    timeout: 2000, // 2 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        // Add auth token to requests
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
