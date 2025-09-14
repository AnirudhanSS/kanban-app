import api from './api';

export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  color?: string;
  card_limit?: number;
  is_archived: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateColumnData {
  title: string;
  position: number;
  color?: string;
  card_limit?: number;
}

export const columnService = {
  async createColumn(boardId: string, data: CreateColumnData): Promise<Column> {
    const response = await api.post(`/columns`, { ...data, board_id: boardId });
    return response.data;
  },

  async updateColumn(columnId: string, data: Partial<CreateColumnData>): Promise<Column> {
    const response = await api.put(`/columns/${columnId}`, data);
    return response.data;
  },

  async deleteColumn(columnId: string): Promise<void> {
    await api.delete(`/columns/${columnId}`);
  },

  async reorderColumns(columnIds: string[]): Promise<void> {
    await api.post('/columns/reorder', { columnIds });
  }
};
