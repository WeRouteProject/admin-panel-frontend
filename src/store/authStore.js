// src/store/authStore.js
import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'http://35.170.21.202:3000/api/auth';

// Helper to safely parse user from localStorage
function getUserFromLocalStorage() {
  const userJSON = localStorage.getItem('user');
  if (!userJSON || userJSON === 'undefined') return null;
  try {
    return JSON.parse(userJSON);
  } catch {
    return null;
  }
}

const useAuthStore = create((set) => ({
  token: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  user: getUserFromLocalStorage(),

  login: async ({ email, password }) => {
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      const { accessToken, refreshToken, id, email: userEmail, role } = res.data;

      const user = { id, email: userEmail, role };

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({ token: accessToken, refreshToken, user });
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

      const { accessToken, refreshToken, id, email: userEmail, role: userRole } = res.data;

      const user = { id, email: userEmail, role: userRole };

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({ token: accessToken, refreshToken, user });
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ token: null, refreshToken: null, user: null });
  },
}));

export default useAuthStore;
