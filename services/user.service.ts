import { BaseApiService } from './base-api.service';
import { User } from '@/models/user.model';

export class UserService extends BaseApiService {
  // Get all users
  async getUsers(): Promise<User[]> {
    return this.request('/users');
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    return this.request(`/users/${id}`);
  }

  // Create regular user
  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    createdBy?: string;
  }): Promise<User> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Create admin user
  async createAdminUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    createdBy?: string;
  }): Promise<User> {
    return this.request('/users/create-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update user
  async updateUser(id: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    password?: string;
    updatedBy?: string;
  }): Promise<User> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Avatar management
  async uploadAvatar(userId: string, file: File): Promise<any> {
    return this.uploadFile(`/users/${userId}/avatar`, file, 'avatar');
  }

  async deleteAvatar(userId: string): Promise<void> {
    return this.request(`/users/${userId}/avatar`, {
      method: 'DELETE',
    });
  }

  getAvatarUrl(userId: string): string {
    return this.getFileUrl(`/users/${userId}/avatar`);
  }
}

export const userService = new UserService();