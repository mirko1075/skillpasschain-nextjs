import { BaseApiService } from './base-api.service';
import { Institution } from '@/models/institution.model';

export class InstitutionService extends BaseApiService {
  // Get all institutions
  async getInstitutions(): Promise<Institution[]> {
    return this.request('/institutions');
  }

  // Get institution by ID
  async getInstitutionById(id: string): Promise<Institution> {
    return this.request(`/institutions/${id}`);
  }

  // Create institution
  async createInstitution(data: {
    name: string;
    email: string;
    address?: string;
    createdBy?: string;
  }): Promise<Institution> {
    return this.request('/institutions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update institution
  async updateInstitution(id: string, data: {
    name?: string;
    email?: string;
    address?: string;
    updatedBy?: string;
  }): Promise<Institution> {
    return this.request(`/institutions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete institution
  async deleteInstitution(id: string): Promise<void> {
    return this.request(`/institutions/${id}`, {
      method: 'DELETE',
    });
  }
}

export const institutionService = new InstitutionService();