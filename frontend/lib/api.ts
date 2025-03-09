import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    // Only add the token for browser environments
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // If we're in a browser context, redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post('/api/v1/auth/register', data),
  
  login: (data: { email: string; password: string }) => 
    api.post('/api/v1/auth/login', data),
    
  getCurrentUser: () => api.get('/api/v1/user/me'),
  
  updateCurrentUser: (data: { firstName?: string; lastName?: string }) => 
    api.put('/api/v1/user/me', data),
};

// User API
export const userAPI = {
  getCurrentUser: () => api.get('/api/v1/user/me'),
  updateProfile: (data: any) => api.put('/api/v1/user/me', data),
};

// File Upload API
export interface FileUploadResponse {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: string;
}

export const fileAPI = {
  // Upload a file with progress tracking
  uploadFile: (file: File, onUploadProgress?: (progressEvent: any) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post<FileUploadResponse>('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  
  // List all files for the current user
  listFiles: () => api.get<FileUploadResponse[]>('/api/v1/files'),
  
  // Get a file by ID
  getFile: (fileId: string) => api.get<Blob>(`/api/v1/files/${fileId}`, {
    responseType: 'blob',
  }),
  
  // Delete a file by ID
  deleteFile: (fileId: string) => api.delete(`/api/v1/files/${fileId}`),
  
  // Process a file
  processFile: (fileId: string) => api.post(`/api/v1/files/${fileId}/process`),
  
  // Analyze a file
  analyzeFile: (fileId: string) => api.post(`/api/v1/files/${fileId}/analyze`),
};

// In future: Analytics API
export const analyticsAPI = {
  // To be implemented in Phase 2
};

export default api; 