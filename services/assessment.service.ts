import { BaseApiService } from './base-api.service';
import { Assessment } from '@/models/assessment.model';

export class AssessmentService extends BaseApiService {
  // Get all assessments
  async getAssessments(): Promise<Assessment[]> {
    return this.request('/assessments');
  }

  // Get assessment by ID
  async getAssessmentById(id: string): Promise<Assessment> {
    return this.request(`/assessments/${id}`);
  }

  // Get user assessments
  async getUserAssessments(userId: string): Promise<Assessment[]> {
    // Note: This endpoint doesn't exist in the API spec, using mock data for now
    // You may need to add this endpoint to the backend or use a different approach
    return [];
  }

  // Create assessment
  async createAssessment(data: {
    title: string;
    score: number;
    takenBy: string;
    createdBy: string;
  }): Promise<Assessment> {
    return this.request('/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update assessment
  async updateAssessment(id: string, data: {
    title?: string;
    score?: number;
    takenBy?: string;
    updatedBy?: string;
  }): Promise<Assessment> {
    return this.request(`/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Complete assessment (update with score)
  async completeAssessment(id: string, score: number): Promise<Assessment> {
    return this.request(`/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ score }),
    });
  }

  // Delete assessment
  async deleteAssessment(id: string): Promise<void> {
    return this.request(`/assessments/${id}`, {
      method: 'DELETE',
    });
  }
}

export const assessmentService = new AssessmentService();