import { BaseApiService } from './base-api.service';
import { Topic } from '@/models/topic.model';

export class TopicService extends BaseApiService {
  // Get all topics
  async getTopics(): Promise<Topic[]> {
    return this.request('/topics');
  }

  // Get topic by ID
  async getTopicById(id: string): Promise<Topic> {
    return this.request(`/topics/${id}`);
  }

  // Create topic
  async createTopic(data: {
    name: string;
    description: string;
    levels: number;
    isActive: boolean;
    createdBy?: string;
  }): Promise<Topic> {
    return this.request('/topics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update topic
  async updateTopic(id: string, data: {
    name?: string;
    description?: string;
    levels?: number;
    isActive?: boolean;
    updatedBy?: string;
  }): Promise<Topic> {
    return this.request(`/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete topic
  async deleteTopic(id: string): Promise<void> {
    return this.request(`/topics/${id}`, {
      method: 'DELETE',
    });
  }

  // Update topic status (activate/deactivate)
  async updateTopicStatus(id: string, isActive: boolean): Promise<Topic> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    let userId = null;
    
    // Extract user ID from token for updatedBy field
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId || payload.id || payload.sub;
      } catch (error) {
        console.error('Error extracting user ID from token:', error);
      }
    }
    
    return this.request(`/topics/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        isActive,
        updatedBy: userId
      }),
    });
  }

  // Upload document for topic
  async uploadTopicDocument(topicId: string, file: File): Promise<any> {
    return this.uploadFile(`/topics/${topicId}/upload`, file, 'document');
  }
}

export const topicService = new TopicService();