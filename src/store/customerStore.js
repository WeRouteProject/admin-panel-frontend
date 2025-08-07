import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance';

const useCustomerStore = create((set, get) => ({
  customers: [],
  loading: false,
  error: null,
  walletHistory: {},

  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get('/customer');
      console.log('Customer API response:', res.data);

      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res.data.customers && Array.isArray(res.data.customers)) {
        data = res.data.customers;
      }

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

  fetchWalletHistory: async (customerId) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(`/customer/${customerId}/wallet-history`);
      console.log(`Wallet history for customer ${customerId}:`, res.data);

      const history = res.data?.data || [];

      set(state => ({
        walletHistory: {
          ...state.walletHistory,
          [customerId]: history
        },
        loading: false
      }));
    } catch (error) {
      console.error('Failed to fetch wallet history:', error);
      set({
        loading: false,
        error: error.response?.data?.message || 'Failed to fetch wallet history'
      });
    }
  },

  addCustomer: async ({ customerName, email, address, contactNumber, discount, wallet, remainingCredit, applyCustomerDiscount }) => {
    set({ loading: true, error: null });
    try {
      const customerData = {
        customerName: customerName.trim(),
        email: email.trim(),
        address: address.trim(),
        contactNumber: contactNumber.trim(),
        discount: discount ? parseFloat(discount) : 0,
        wallet: wallet ? parseFloat(wallet) : 0,
        remainingCredit: remainingCredit ? parseFloat(remainingCredit) : (wallet ? parseFloat(wallet) : 0),
        applyCustomerDiscount: !!applyCustomerDiscount,
      };

      console.log('Adding customer with data:', customerData);

      await axiosInstance.post('/customer', customerData);
      await get().fetchCustomers();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to add customer:', error);
      set({
        loading: false,
        error: error.response?.data?.message || 'Failed to add customer'
      });
      throw error;
    }
  },

  updateCustomer: async (id, { customerName, email, address, contactNumber, discount, wallet, remainingCredit, applyCustomerDiscount }) => {
    set({ loading: true, error: null });
    try {
      const currentCustomer = get().getCustomerById(id);
      const oldWallet = currentCustomer?.wallet || 0;
      const oldRemainingCredit = currentCustomer?.remainingCredit || 0;

      const newWallet = wallet ? parseFloat(wallet) : 0;
      let newRemainingCredit = remainingCredit ? parseFloat(remainingCredit) : newWallet;

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
        applyCustomerDiscount: !!applyCustomerDiscount,
      };

      console.log('Updating customer with ID:', id, 'Data:', customerData);

      await axiosInstance.put(`/customer/${id}`, customerData);
      await get().fetchCustomers();
      set({ loading: false });
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
      console.log('Deleting customer with ID:', id);
      await axiosInstance.delete(`/customer/${id}`);
      await get().fetchCustomers();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to delete customer:', error);
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
      const currentCustomer = get().getCustomerById(customerId);
      const prevWallet = currentCustomer?.wallet || 0;
      const prevRemainingCredit = currentCustomer?.remainingCredit ?? 0;

      const newWallet = operation === 'add'
        ? prevWallet + parseFloat(amount)
        : prevWallet - parseFloat(amount);

      let updatedRemainingCredit = prevRemainingCredit;
      if (prevRemainingCredit === prevWallet) {
        updatedRemainingCredit = newWallet;
      }

      const payload = {
        amount: parseFloat(amount),
        operation,
        remainingCredit: updatedRemainingCredit
      };

      console.log("🟨 Sending PATCH request with:", payload);

      await axiosInstance.patch(`/customer/${customerId}/wallet`, payload);
      await get().fetchCustomers();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to update wallet balance:', error);
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
      console.log('Updating discount for customer', customerId, 'to:', discount);

      await axiosInstance.patch(`/customer/${customerId}/discount`, {
        discount: parseFloat(discount),
      });

      await get().fetchCustomers();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to update discount:', error);
      set({
        loading: false,
        error: error.response?.data?.message || 'Failed to update discount'
      });
      throw error;
    }
  },

getCustomerById: (customerId) => {
  const { customers } = get();
  return customers.find((c) => c.customerId === customerId);
},


  checkWalletBalance: (customerId, requiredAmount) => {
    const customer = get().getCustomerById(customerId);
    if (!customer) return false;
    return customer.wallet >= requiredAmount;
  },

  clearError: () => set({ error: null }),
}));

// ✅ Export both the store and the live state getter
export const getCustomerStoreState = useCustomerStore.getState;
export default useCustomerStore;
