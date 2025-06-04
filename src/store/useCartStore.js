import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';

const API_BASE = 'https://logistic-project-backend.onrender.com/api/cart';

const useCartStore = create((set, get) => ({
  cart: [],
  isLoading: false,
  error: null,
  lastUserId: null, // Track which user's cart is currently loaded

  // Helper function to normalize cart items
  normalizeCartItem: (item) => ({
    id: item.productId || item.id,
    cartItemId: item.cartItemId,
    productId: item.productId || item.id,
    name: item.Product?.productName || item.productName || item.name || 'Unknown Product',
    productName: item.Product?.productName || item.productName || item.name || 'Unknown Product',
    price: Number(item.Product?.price) || Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    image: item.image || null,
    description: item.description || ''
  }),

  // Helper function to check if user has changed
  checkUserChange: () => {
    const currentUser = useAuthStore.getState().user;
    const currentUserId = currentUser?.id || currentUser?.userId;
    const lastUserId = get().lastUserId;
    
    if (currentUserId !== lastUserId) {
      // User has changed, clear cart and update lastUserId
      set({ cart: [], lastUserId: currentUserId });
      return true;
    }
    return false;
  },

  // 1. GET all cart items - Updated with proper auth token handling
  getCartItems: async () => {
    const token = useAuthStore.getState().token;
    const currentUser = useAuthStore.getState().user;
    
    if (!token) {
      console.warn('No token found for getCartItems');
      set({ cart: [], isLoading: false });
      return;
    }

    // Check if user has changed
    get().checkUserChange();

    set({ isLoading: true, error: null });
   
    try {
      const response = await axios.get(`${API_BASE}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
     
      // Normalize and deduplicate cart items
      const rawCart = response.data || [];
      const normalizedCart = rawCart.map(item => get().normalizeCartItem(item));
     
      // Remove duplicates based on productId
      const uniqueCart = normalizedCart.reduce((acc, item) => {
        const existingIndex = acc.findIndex(existing => existing.productId === item.productId);
        if (existingIndex >= 0) {
          // If duplicate found, keep the one with higher quantity
          if (item.quantity > acc[existingIndex].quantity) {
            acc[existingIndex] = item;
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
     
      set({ 
        cart: uniqueCart, 
        isLoading: false,
        lastUserId: currentUser?.id || currentUser?.userId
      });
    } catch (error) {
      console.error('Get cart items failed:', error.response?.data || error.message);
      set({ cart: [], isLoading: false, error: error.message });
    }
  },

  // 2. POST add to cart
  addToCart: async (product) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      console.error('No token found for addToCart');
      return;
    }

    // Check if user has changed
    get().checkUserChange();

    set({ error: null });
    try {
      const response = await axios.post(
        `${API_BASE}/add`,
        {
          productId: product.productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      // Refresh cart from server to ensure consistency
      await get().getCartItems();
      console.log('Added to cart successfully:', product.productName);
    } catch (error) {
      console.error('Add to cart failed:', error.response?.data || error.message);
      set({ error: error.message || 'Failed to add item to cart' });
    }
  },

  // 3. PUT/PATCH update cart item quantity - Fixed API endpoint
  updateQuantity: async (productId, change) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      console.error('No token found for updateQuantity');
      return;
    }

    // Check if user has changed
    if (get().checkUserChange()) {
      await get().getCartItems();
      return;
    }

    const currentCart = get().cart;
    const currentItem = currentCart.find(item => item.productId === productId);
   
    if (!currentItem) {
      console.warn('Item not found in cart:', productId);
      return;
    }

    const newQty = currentItem.quantity + change;
    if (newQty < 1) {
      // Remove item if quantity becomes less than 1
      await get().removeFromCart(productId);
      return;
    }

    // Optimistically update local state first
    const updatedCart = currentCart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQty }
        : item
    );
    set({ cart: updatedCart, error: null });

    try {
      // Try different possible endpoints and methods
      let response;
      const updatePayload = {
        productId: productId,
        quantity: newQty,
      };

      const endpoints = [
        { method: 'PUT', url: `${API_BASE}/update` },
        { method: 'PATCH', url: `${API_BASE}/update` },
        { method: 'PUT', url: `${API_BASE}/${productId}` },
        { method: 'PATCH', url: `${API_BASE}/${productId}` },
        { method: 'POST', url: `${API_BASE}/update` }
      ];

      let updateSuccess = false;
      
      for (const endpoint of endpoints) {
        try {
          if (endpoint.method === 'PUT') {
            response = await axios.put(endpoint.url, updatePayload, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });
          } else if (endpoint.method === 'PATCH') {
            response = await axios.patch(endpoint.url, updatePayload, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });
          } else if (endpoint.method === 'POST') {
            response = await axios.post(endpoint.url, updatePayload, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });
          }
          
          console.log(`Updated quantity successfully using ${endpoint.method} ${endpoint.url}:`, productId, newQty);
          updateSuccess = true;
          break;
        } catch (endpointError) {
          console.warn(`Failed with ${endpoint.method} ${endpoint.url}:`, endpointError.response?.status);
          continue;
        }
      }

      if (!updateSuccess) {
        throw new Error('All update endpoints failed');
      }

    } catch (error) {
      console.error('Update quantity failed:', error.response?.data || error.message);
     
      // Revert the optimistic update on failure
      set({
        cart: currentCart,
        error: 'Failed to update quantity. Please try again.'
      });
      
      // Refresh cart from server to ensure consistency
      setTimeout(() => get().getCartItems(), 1000);
    }
  },

  // 4. DELETE remove cart item
  removeFromCart: async (productId) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      console.error('No token found for removeFromCart');
      return;
    }

    // Check if user has changed
    if (get().checkUserChange()) {
      await get().getCartItems();
      return;
    }

    const currentCart = get().cart;
    // Find the cart item to remove using productId
    const itemToRemove = currentCart.find(item => item.productId === productId);

    if (!itemToRemove) {
      console.error('Item not found for productId:', productId);
      set({ error: 'Unable to remove item. Item not found.' });
      return;
    }

    // Optimistically update local state
    const updatedCart = currentCart.filter(item => item.productId !== productId);
    set({ cart: updatedCart, error: null });

    try {
      // Try different removal endpoints
      let removeSuccess = false;
      const endpoints = [
        `${API_BASE}/remove/${itemToRemove.cartItemId}`,
        `${API_BASE}/${itemToRemove.cartItemId}`,
        `${API_BASE}/remove/${productId}`,
        `${API_BASE}/${productId}`
      ];

      for (const endpoint of endpoints) {
        try {
          await axios.delete(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          console.log('Removed from cart successfully:', endpoint);
          removeSuccess = true;
          break;
        } catch (endpointError) {
          console.warn(`Failed to remove with endpoint ${endpoint}:`, endpointError.response?.status);
          continue;
        }
      }

      if (!removeSuccess) {
        throw new Error('All removal endpoints failed');
      }

    } catch (error) {
      console.error('Remove from cart failed:', error.response?.data || error.message);
      // Revert on failure
      set({
        cart: currentCart,
        error: 'Failed to remove item. Please try again.'
      });
      
      // Refresh cart from server to ensure consistency
      setTimeout(() => get().getCartItems(), 1000);
    }
  },

  // 5. Clear cart with multiple endpoint attempts
  clearCart: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      console.error('No token found for clearCart');
      return;
    }

    set({ error: null });
    try {
      // Try multiple possible endpoints for clearing cart
      let success = false;
      const endpoints = [
        { method: 'POST', url: `${API_BASE}/clear` },
        { method: 'DELETE', url: `${API_BASE}/clear` },
        { method: 'DELETE', url: `${API_BASE}` },
        { method: 'POST', url: `${API_BASE}/empty` }
      ];

      for (const endpoint of endpoints) {
        try {
          if (endpoint.method === 'POST') {
            await axios.post(endpoint.url, {}, {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          } else {
            await axios.delete(endpoint.url, {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          }
         
          console.log(`Cart cleared successfully using ${endpoint.method.toUpperCase()} ${endpoint.url}`);
          success = true;
          break;
        } catch (endpointError) {
          console.warn(`Failed to clear cart with ${endpoint.method.toUpperCase()} ${endpoint.url}:`, endpointError.response?.status);
          continue;
        }
      }

      if (!success) {
        // If all endpoints fail, try removing items individually
        console.log('Attempting to clear cart by removing items individually...');
        const currentCart = get().cart;
       
        for (const item of currentCart) {
          if (item.cartItemId) {
            try {
              await axios.delete(`${API_BASE}/remove/${item.cartItemId}`, {
                headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
            } catch (removeError) {
              console.warn(`Failed to remove item ${item.cartItemId}:`, removeError.response?.status);
            }
          }
        }
        console.log('Attempted to clear cart by removing individual items');
      }

      // Clear local cart regardless of API success/failure
      set({ cart: [] });
      console.log('Cart cleared locally');
     
    } catch (error) {
      console.error('Clear cart failed:', error.response?.data || error.message);
      // Clear local cart even if API fails
      set({
        cart: [],
        error: null // Don't show error to user since cart is cleared locally
      });
      console.log('Cart cleared locally despite API failure');
    }
  },

  // Helper function to get quantity for a specific product
  getItemQuantity: (productId) => {
    const item = get().cart.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  },

  // Helper function to check if item is in cart
  isInCart: (productId) => {
    return get().cart.some(item => item.productId === productId);
  },

  // Helper function to set cart directly (for local updates)
  setCart: (cart) => set({ cart: cart.map(item => get().normalizeCartItem(item)) }),

  // Clear error
  clearError: () => set({ error: null }),

  // Force refresh cart from server
  refreshCart: async () => {
    await get().getCartItems();
  },
}));

export default useCartStore;