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

export interface LogAnalysisResult {
  fileId: string;
  userId: string;
  fileName: string;
  processedAt: string;
  summary: any;
  status: string;
  errorMessage?: string;
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
  listFiles: () => api.get<FileUploadResponse[]>('/api/v1/files/list'),
  
  // Get a file by ID
  getFile: (fileId: string) => api.get<Blob>(`/api/v1/files/${fileId}`, {
    responseType: 'blob',
  }),
  
  // Delete a file by ID
  deleteFile: (fileId: string) => api.delete(`/api/v1/files/${fileId}`),
  
  // Process a file
  processFile: (fileId: string) => api.post<LogAnalysisResult>(`/api/v1/files/process/${fileId}`),
  
  // Get file analysis results
  getFileAnalysis: (fileId: string) => api.get<LogAnalysisResult>(`/api/v1/files/analysis/${fileId}`),
};

// Analytics API
export const analyticsAPI = {
  // Get bid performance metrics
  getBidPerformance: (fileId: string) => api.get(`/api/v1/analytics/bid-performance/${fileId}`),
  
  // Get campaign performance metrics
  getCampaignPerformance: (fileId: string) => api.get(`/api/v1/analytics/campaign-performance/${fileId}`),
  
  // Get geographic distribution
  getGeographicDistribution: (fileId: string) => api.get(`/api/v1/analytics/geographic/${fileId}`),
  
  // Get device breakdown
  getDeviceBreakdown: (fileId: string) => api.get(`/api/v1/analytics/device-breakdown/${fileId}`),
  
  // Get hourly breakdown
  getHourlyBreakdown: (fileId: string) => api.get(`/api/v1/analytics/hourly-breakdown/${fileId}`),
};

export default api; 