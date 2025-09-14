import api from './api';

export interface Column {
  id: string;
  title: string;
  position: number;
  board_id: string;
  color?: string;
  card_limit?: number;
  is_archived: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  background_color?: string;
  is_public: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
  // Also support camelCase from API
  createdAt?: string;
  updatedAt?: string;
  // Include columns when loaded with board
  Columns?: Column[];
  // User's role in this board
  userRole?: string;
}

export interface CreateBoardData {
  title: string;
  description?: string;
  background_color?: string;
  is_public?: boolean;
  skip_default_columns?: boolean;
}

export const boardService = {
  async getBoards(): Promise<Board[]> {
    const response = await api.get('/boards');
    return response.data;
  },

  async getUserBoards(): Promise<Board[]> {
    const response = await api.get('/boards');
    return response.data;
  },

  async getBoard(id: string): Promise<Board> {
    const response = await api.get(`/boards/${id}`);
    return response.data;
  },

  async createBoard(data: CreateBoardData): Promise<Board> {
    const response = await api.post('/boards', data);
    return response.data;
  },

  async updateBoard(id: string, data: Partial<CreateBoardData>): Promise<Board> {
    const response = await api.put(`/boards/${id}`, data);
    return response.data;
  },

  async deleteBoard(id: string): Promise<void> {
    await api.delete(`/boards/${id}`);
  },

  async joinBoard(id: string): Promise<any> {
    const response = await api.post(`/boards/${id}/join`);
    return response.data;
  },

  async updateMemberRole(boardId: string, userId: string, role: string): Promise<any> {
    const response = await api.put(`/boards/${boardId}/members/${userId}`, { role });
    return response.data;
  },

  async removeMember(boardId: string, userId: string): Promise<void> {
    await api.delete(`/boards/${boardId}/members/${userId}`);
  },

  async getBoardMembers(boardId: string): Promise<any[]> {
    const response = await api.get(`/boards/${boardId}/members`);
    return response.data;
  },

  async getUserRole(boardId: string): Promise<{ role: string }> {
    const response = await api.get(`/boards/${boardId}/role`);
    return response.data;
  }
};
