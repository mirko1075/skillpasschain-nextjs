import { BaseApiService } from './base-api.service';
import { Certification } from '@/models/certification.model';

export class CertificationService extends BaseApiService {
  // Get all certifications
  async getCertifications(): Promise<Certification[]> {
    return this.request('/certifications');
  }

  // Get certification by ID
  async getCertificationById(id: string): Promise<Certification> {
    return this.request(`/certifications/${id}`);
  }

  // Get user certifications
  async getUserCertifications(userId: string): Promise<Certification[]> {
    // Note: This endpoint doesn't exist in the API spec, using mock data for now
    // You may need to add this endpoint to the backend or use a different approach
    return [];
  }

  // Create certification
  async createCertification(data: {
    title: string;
    issuedBy: string;
    recipient: string;
    issueDate: string;
    description?: string;
    expiryDate?: string;
  }): Promise<Certification> {
    return this.request('/certifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update certification
  async updateCertification(id: string, data: {
    title?: string;
    description?: string;
    expiryDate?: string;
    updatedBy?: string;
  }): Promise<Certification> {
    return this.request(`/certifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete certification
  async deleteCertification(id: string): Promise<void> {
    return this.request(`/certifications/${id}`, {
      method: 'DELETE',
    });
  }
}

export const certificationService = new CertificationService();