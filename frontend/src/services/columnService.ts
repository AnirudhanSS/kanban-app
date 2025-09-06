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

export const columnService = {
  async reorderColumns(columnIds: string[]): Promise<void> {
    await api.post('/columns/reorder', { columnIds });
  }
};
