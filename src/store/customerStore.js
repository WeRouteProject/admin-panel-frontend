import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';

const API_URL = 'https://logistic-project-backend.onrender.com/api/customer';

const useCustomerStore = create((set, get) => ({
  customers: [],
  loading: false,
  error: null,
  
  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Customer API response:', res.data);
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res.data.customers && Array.isArray(res.data.customers)) {
        data = res.data.customers;
      }
      
      set({ customers: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      set({ 
        customers: [], 
        loading: false, 
        error: error.response?.data?.message || 'Failed to fetch customers'
      });
    }
  },

  addCustomer: async ({ customerName, email, address, contactNumber }) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      await axios.post(API_URL, {
        customerName,
        email,
        address,
        contactNumber,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      get().fetchCustomers();
    } catch (error) {
      console.error('Failed to add customer:', error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to add customer'
      });
      throw error;
    }
  },

  updateCustomer: async (id, { customerName, email, address, contactNumber }) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      await axios.put(`${API_URL}/${id}`, {
        customerName,
        email,
        address,
        contactNumber,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      get().fetchCustomers();
    } catch (error) {
      console.error('Failed to update customer:', error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to update customer'
      });
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      get().fetchCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to delete customer'
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useCustomerStore;