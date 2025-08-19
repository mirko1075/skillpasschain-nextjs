import { authService } from './auth.service';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api/v1';

export class BaseApiService {
  protected async request(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const url = `${API_BASE}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    let response = await fetch(url, config);
    
    // If token is expired (401), try to refresh it
    if (response.status === 401 && token) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await authService.refreshToken(refreshToken);
          if (refreshResponse.data && refreshResponse.data.accessToken) {
            localStorage.setItem('accessToken', refreshResponse.data.accessToken);
            if (refreshResponse.data.refreshToken) {
              localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
            }
            if (refreshResponse.data.user) {
              localStorage.setItem('userData', JSON.stringify(refreshResponse.data.user));
            }
            
            // Retry the original request with new token
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${refreshResponse.data.accessToken}`,
            };
            response = await fetch(url, config);
          }
        } catch (error) {
          console.error('Token refresh failed in API service:', error);
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Session expired');
        }
      }
    }
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  protected async uploadFile(endpoint: string, file: File, fieldName: string = 'file') {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const formData = new FormData();
    formData.append(fieldName, file);
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  protected getFileUrl(endpoint: string) {
    return `${API_BASE}${endpoint}`;
  }
}