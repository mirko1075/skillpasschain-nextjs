import { authService } from './auth.service';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api/v1';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
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

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`);
  }

  async createUser(data: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createAdminUser(data: any) {
    return this.request('/users/create-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Avatar management
  async uploadAvatar(userId: string, file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const response = await fetch(`${API_BASE}/users/${userId}/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Avatar upload failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  async deleteAvatar(userId: string) {
    return this.request(`/users/${userId}/avatar`, {
      method: 'DELETE',
    });
  }

  async getAvatarUrl(userId: string) {
    return `${API_BASE}/users/${userId}/avatar`;
  }

  // Institutions
  async getInstitutions() {
    return this.request('/institutions');
  }

  async createInstitution(data: any) {
    return this.request('/institutions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInstitution(id: string, data: any) {
    return this.request(`/institutions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInstitution(id: string) {
    return this.request(`/institutions/${id}`, {
      method: 'DELETE',
    });
  }

  // Assessments
  async getAssessments() {
    return this.request('/assessments');
  }

  async getUserAssessments(userId: string) {
    // Note: This endpoint doesn't exist in the API spec, using mock data for now
    // You may need to add this endpoint to the backend or use a different approach
    return [];
  }

  async createAssessment(data: any) {
    return this.request('/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeAssessment(id: string, score: number) {
    return this.request(`/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ score }),
    });
  }

  // Certifications
  async getCertifications() {
    return this.request('/certifications');
  }

  async getUserCertifications(userId: string) {
    // Note: This endpoint doesn't exist in the API spec, using mock data for now
    // You may need to add this endpoint to the backend or use a different approach
    return [];
  }

  async createCertification(data: any) {
    return this.request('/certifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCertification(id: string, data: any) {
    return this.request(`/certifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Topics
  async getTopics() {
    return this.request('/topics');
  }

  async createTopic(data: any) {
    return this.request('/topics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTopic(id: string, data: any) {
    return this.request(`/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTopic(id: string) {
    return this.request(`/topics/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadTopicDocument(topicId: string, file: File) {
    const formData = new FormData();
    formData.append('document', file);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const response = await fetch(`${API_BASE}/topics/${topicId}/upload`, {
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

  async updateTopicStatus(id: string, isActive: boolean) {
    return this.request(`/topics/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }
}

export const apiService = new ApiService();