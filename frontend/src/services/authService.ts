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
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { token, user };
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
  }
};
