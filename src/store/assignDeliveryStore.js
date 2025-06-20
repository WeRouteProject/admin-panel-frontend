import { create } from 'zustand';
import axios from 'axios';

export const useAssignDeliveryStore = create((set, get) => ({
  loading: false,
  error: null,
  
  assignDelivery: async (payload) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      // Ensure payload matches the API structure
      const formattedPayload = {
        cartItems: payload.cartItems,
        deliveryBoyId: payload.deliveryBoyId,
        customerName: payload.customerName,
        deliveryDate: payload.deliveryDate,
        status: payload.status,
        deliveryAddress: payload.deliveryAddress,
        discountedPrice: payload.discountedPrice,
        customerNumber: payload.customerNumber,
        customerId: payload.customerId,
        customerEmail: payload.customerEmail
      };

      const response = await axios.post(
        'https://logistic-project-backend.onrender.com/api/delivery/assign',
        formattedPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Delivery Assigned:', response.data);
      set({ loading: false });
      
      return {
        success: true,
        message: response.data.message || 'Delivery assigned successfully',
        data: response.data
      };
    } catch (error) {
      console.error('Failed to assign delivery', error);
      const errorMessage = error.response?.data?.message || 'Failed to assign delivery';
      set({ 
        loading: false, 
        error: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));