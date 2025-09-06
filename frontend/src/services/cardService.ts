import api from './api';

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Card {
  id: string;
  column_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  reporter_id?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  position: number;
  estimated_hours?: number;
  actual_hours?: number;
  is_archived: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCardData {
  column_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateCardData {
  title?: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  position?: number;
  column_id?: string;
}

export const cardService = {
  async getCards(boardId: string): Promise<Card[]> {
    const response = await api.get(`/cards/board/${boardId}`);
    return response.data;
  },

  async getCard(id: string): Promise<Card> {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },

  async createCard(data: CreateCardData): Promise<Card> {
    const response = await api.post('/cards', data);
    return response.data;
  },

  async updateCard(id: string, data: UpdateCardData): Promise<Card> {
    const response = await api.put(`/cards/${id}`, data);
    return response.data;
  },

  async deleteCard(id: string): Promise<void> {
    await api.delete(`/cards/${id}`);
  }
};
