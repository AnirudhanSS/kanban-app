import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface Comment {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  User?: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    username: string;
  };
}

export interface CreateCommentData {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

class CommentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getComments(cardId: string): Promise<Comment[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/comments/cards/${cardId}/comments`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async addComment(cardId: string, data: CreateCommentData): Promise<Comment> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/comments/cards/${cardId}/comments`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Comment update functionality has been disabled
  // async updateComment(commentId: string, data: UpdateCommentData): Promise<Comment> {
  //   throw new Error('Comment update feature is not available');
  // }

  async deleteComment(commentId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/comments/comments/${commentId}`, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
}

export const commentService = new CommentService();
