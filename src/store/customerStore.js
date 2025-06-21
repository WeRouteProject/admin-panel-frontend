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
      
      // Ensure discount, wallet, and remainingCredit have default values if not present
      const customersWithDefaults = data.map(customer => ({
        ...customer,
        discount: customer.discount ?? 0,
        wallet: customer.wallet ?? 0,
        remainingCredit: customer.remainingCredit ?? 0,
      }));
      
      set({ customers: customersWithDefaults, loading: false });
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      set({ 
        customers: [], 
        loading: false, 
        error: error.response?.data?.message || 'Failed to fetch customers'
      });
    }
  },

  addCustomer: async ({ customerName, email, address, contactNumber, discount, wallet, remainingCredit }) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      
      // Prepare the customer data with proper defaults and validation
      const customerData = {
        customerName: customerName.trim(),
        email: email.trim(),
        address: address.trim(),
        contactNumber: contactNumber.trim(),
        discount: discount ? parseFloat(discount) : 0,
        wallet: wallet ? parseFloat(wallet) : 0,
        // Sync remainingCredit with wallet if not provided
        remainingCredit: remainingCredit ? parseFloat(remainingCredit) : (wallet ? parseFloat(wallet) : 0),
      };

      console.log('Adding customer with data:', customerData);

      await axios.post(API_URL, customerData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Refresh the customer list after successful addition
      await get().fetchCustomers();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to add customer:', error);
      console.error('Error details:', error.response?.data);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to add customer'
      });
      throw error;
    }
  },

  updateCustomer: async (id, { customerName, email, address, contactNumber, discount, wallet, remainingCredit }) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      
      // Fetch current customer data
      const currentCustomer = get().getCustomerById(id);
      const oldWallet = currentCustomer?.wallet || 0;
      const oldRemainingCredit = currentCustomer?.remainingCredit || 0;
      
      // Prepare the customer data with proper defaults and validation
      const newWallet = wallet ? parseFloat(wallet) : 0;
      let newRemainingCredit = remainingCredit ? parseFloat(remainingCredit) : newWallet;
      
      // If remainingCredit matches old value and wallet has changed, sync with new wallet
      if (remainingCredit && parseFloat(remainingCredit) === oldRemainingCredit && newWallet !== oldWallet) {
        newRemainingCredit = newWallet;
      }

      const customerData = {
        customerName: customerName.trim(),
        email: email.trim(),
        address: address.trim(),
        contactNumber: contactNumber.trim(),
        discount: discount ? parseFloat(discount) : 0,
        wallet: newWallet,
        remainingCredit: newRemainingCredit,
      };

      console.log('Updating customer with ID:', id, 'Data:', customerData);

      await axios.put(`${API_URL}/${id}`, customerData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Refresh the customer list after successful update
      await get().fetchCustomers();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to update customer:', error);
      console.error('Error details:', error.response?.data);
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
      
      console.log('Deleting customer with ID:', id);

      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Refresh the customer list after successful deletion
      await get().fetchCustomers();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to delete customer:', error);
      console.error('Error details:', error.response?.data);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to delete customer'
      });
      throw error;
    }
  },

  updateWalletBalance: async (customerId, amount, operation = 'add') => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      
      console.log(`${operation === 'add' ? 'Adding to' : 'Deducting from'} wallet for customer ${customerId}:`, amount);

      // Fetch current customer data to get existing remainingCredit
      const currentCustomer = get().getCustomerById(customerId);
      const newWallet = operation === 'add' 
        ? (currentCustomer?.wallet || 0) + parseFloat(amount)
        : (currentCustomer?.wallet || 0) - parseFloat(amount);

      await axios.patch(`${API_URL}/${customerId}/wallet`, {
        amount: parseFloat(amount),
        operation, // 'add' or 'deduct'
        // Sync remainingCredit with new wallet value if it matches wallet (indicating no independent updates)
        remainingCredit: currentCustomer?.remainingCredit === currentCustomer?.wallet 
          ? newWallet 
          : currentCustomer?.remainingCredit || 0,
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Refresh the customer list after wallet update
      await get().fetchCustomers();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to update wallet balance:', error);
      console.error('Error details:', error.response?.data);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to update wallet balance'
      });
      throw error;
    }
  },

  updateDiscount: async (customerId, discount) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      
      console.log('Updating discount for customer', customerId, 'to:', discount);

      await axios.patch(`${API_URL}/${customerId}/discount`, {
        discount: parseFloat(discount),
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Refresh the customer list after discount update
      await get().fetchCustomers();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to update discount:', error);
      console.error('Error details:', error.response?.data);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to update discount'
      });
      throw error;
    }
  },

  getCustomerById: (id) => {
    const { customers } = get();
    return customers.find(customer => customer.customerId === id);
  },

  checkWalletBalance: (customerId, requiredAmount) => {
    const customer = get().getCustomerById(customerId);
    if (!customer) return false;
    return customer.wallet >= requiredAmount;
  },

  clearError: () => set({ error: null }),
}));

export default useCustomerStore;