import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'https://logistic-project-backend.onrender.com/api/auth';

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: null,

  login: async ({ email, password }) => {
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      set({ token, user });
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  },

  register: async ({ username, email, password, role }) => {
    try {
      const res = await axios.post(`${API_BASE}/register`, {
        username,
        email,
        password,
        role,
      });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      set({ token, user });
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));

export default useAuthStore;
