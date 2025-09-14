import api from './api';

export interface BoardMember {
  id: string;
  name: string;
  email: string;
  role: string;
  online: boolean;
}

export interface BoardAuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  board_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  User?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface BoardStats {
  boardName: string;
  totalMembers: number;
  onlineMembers: number;
  recentActivity: number;
}

export const boardAdminService = {
  async getBoardMembers(boardId: string): Promise<BoardMember[]> {
    const response = await api.get(`/admin/boards/${boardId}/members`);
    return response.data;
  },

  async getBoardAuditLogs(boardId: string): Promise<BoardAuditLog[]> {
    const response = await api.get(`/admin/boards/${boardId}/audit-logs`);
    return response.data;
  },

  async getBoardStats(boardId: string): Promise<BoardStats> {
    const response = await api.get(`/admin/boards/${boardId}/stats`);
    return response.data;
  }
};
