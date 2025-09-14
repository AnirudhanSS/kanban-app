import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface AdminBoard {
  id: string;
  name: string;
  members: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
  }[];
}

export interface AdminMember {
  boardId: string;
  userId: string;
  role: string;
  name: string;
  email: string;
  username: string;
  online: boolean;
}

export interface AuditLog {
  id: string;
  board_id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface ActiveUser {
  id: string;
  name: string;
  email: string;
  username: string;
  online: boolean;
}

class AdminService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getBoards(): Promise<AdminBoard[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/boards`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin boards:', error);
      throw error;
    }
  }

  async getMembers(): Promise<AdminMember[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/members`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin members:', error);
      throw error;
    }
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/audit-logs`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  async getActiveUsers(): Promise<ActiveUser[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/active-users`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active users:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
