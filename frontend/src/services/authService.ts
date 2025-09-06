import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  avatar_url?: string;
  is_email_verified?: boolean;
}

export const authService = {
  async login(data: LoginData) {
    const response = await api.post('/auth/login', data);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { token, user };
  },

  async signup(data: SignupData) {
    const response = await api.post('/auth/signup', data);
    // Note: signup no longer returns token immediately due to email verification
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, password: string) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  async resendVerification(email?: string) {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  }
};
