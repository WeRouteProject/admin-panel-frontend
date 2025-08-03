import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance';
import useAuthStore from './authStore';

const API_BASE = '/cart'; // simplified due to axiosInstance baseURL

const useCartStore = create((set, get) => ({
  cart: [],
  isLoading: false,
  error: null,
  lastUserId: null,

  normalizeCartItem: (item) => ({
    id: item.productId || item.id,
    cartItemId: item.cartItemId,
    productId: item.productId || item.id,
    name: item.Product?.productName || item.productName || item.name || 'Unknown Product',
    productName: item.Product?.productName || item.productName || item.name || 'Unknown Product',
    price: Number(item.Product?.price) || Number(item.price) || 0,
    discountedPrice: Number(item.Product?.discountedPrice) || 0,
    discount: Number(item.Product?.discount) || 0,
    quantity: Number(item.quantity) || 1,
    image: item.image || null,
    description: item.description || ''
  }),

  checkUserChange: () => {
    const currentUser = useAuthStore.getState().user;
    const currentUserId = currentUser?.id || currentUser?.userId;
    const lastUserId = get().lastUserId;

    if (currentUserId !== lastUserId) {
      set({ cart: [], lastUserId: currentUserId });
      return true;
    }
    return false;
  },

  getCartItems: async () => {
    if (!useAuthStore.getState().token) {
      console.warn('No token found for getCartItems');
      set({ cart: [], isLoading: false });
      return;
    }

    get().checkUserChange();
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.get(API_BASE);

      const rawCart = response.data || [];
      const normalizedCart = rawCart.map(item => get().normalizeCartItem(item));
      const uniqueCart = normalizedCart.reduce((acc, item) => {
        const existingIndex = acc.findIndex(existing => existing.productId === item.productId);
        if (existingIndex >= 0) {
          if (item.quantity > acc[existingIndex].quantity) {
            acc[existingIndex] = item;
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);

      const currentUser = useAuthStore.getState().user;

      set({
        cart: uniqueCart,
        isLoading: false,
        lastUserId: currentUser?.id || currentUser?.userId,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.error;

      if (errorMessage === 'jwt expired') {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }

      console.error('Get cart items failed:', error.response?.data || error.message);
      set({
        cart: [],
        isLoading: false,
        error: errorMessage || error.message,
      });
    }
  },

  addToCart: async (product) => {
    if (!useAuthStore.getState().token) {
      console.error('No token found for addToCart');
      return;
    }

    get().checkUserChange();
    set({ error: null });

    try {
      await axiosInstance.post(`${API_BASE}/add`, {
        productId: product.productId,
        quantity: 1,
      });

      await get().getCartItems();
      console.log('Added to cart successfully:', product.productName);
    } catch (error) {
      console.error('Add to cart failed:', error.response?.data || error.message);
      set({ error: error.message || 'Failed to add item to cart' });
    }
  },

  updateQuantity: async (productId, change) => {
    if (!useAuthStore.getState().token) {
      console.error('No token found for updateQuantity');
      return;
    }

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
      await get().removeFromCart(productId);
      return;
    }

    const updatedCart = currentCart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQty }
        : item
    );
    set({ cart: updatedCart, error: null });

    try {
      const updatePayload = { productId, quantity: newQty };
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
          await axiosInstance[endpoint.method.toLowerCase()](endpoint.url, updatePayload);
          console.log(`Updated quantity using ${endpoint.method} ${endpoint.url}`);
          updateSuccess = true;
          break;
        } catch (e) {
          console.warn(`Failed ${endpoint.method} ${endpoint.url}`, e.response?.status);
        }
      }

      if (!updateSuccess) throw new Error('All update endpoints failed');
    } catch (error) {
      console.error('Update quantity failed:', error.message);
      set({ cart: currentCart, error: 'Failed to update quantity. Please try again.' });
      setTimeout(() => get().getCartItems(), 1000);
    }
  },

  removeFromCart: async (productId) => {
    if (!useAuthStore.getState().token) {
      console.error('No token found for removeFromCart');
      return;
    }

    if (get().checkUserChange()) {
      await get().getCartItems();
      return;
    }

    const currentCart = get().cart;
    const itemToRemove = currentCart.find(item => item.productId === productId);

    if (!itemToRemove) {
      console.error('Item not found:', productId);
      set({ error: 'Item not found in cart.' });
      return;
    }

    const updatedCart = currentCart.filter(item => item.productId !== productId);
    set({ cart: updatedCart, error: null });

    try {
      const endpoints = [
        `${API_BASE}/remove/${itemToRemove.cartItemId}`,
        `${API_BASE}/${itemToRemove.cartItemId}`,
        `${API_BASE}/remove/${productId}`,
        `${API_BASE}/${productId}`
      ];

      let success = false;

      for (const url of endpoints) {
        try {
          await axiosInstance.delete(url);
          console.log('Removed from cart:', url);
          success = true;
          break;
        } catch (e) {
          console.warn('Failed to remove item:', url, e.response?.status);
        }
      }

      if (!success) throw new Error('All removal endpoints failed');
    } catch (error) {
      console.error('Remove failed:', error.message);
      set({ cart: currentCart, error: 'Failed to remove item.' });
      setTimeout(() => get().getCartItems(), 1000);
    }
  },

  clearCart: async () => {
    if (!useAuthStore.getState().token) {
      console.error('No token found for clearCart');
      return;
    }

    try {
      const endpoints = [
        { method: 'POST', url: `${API_BASE}/clear` },
        { method: 'DELETE', url: `${API_BASE}/clear` },
        { method: 'DELETE', url: `${API_BASE}` },
        { method: 'POST', url: `${API_BASE}/empty` }
      ];

      let cleared = false;

      for (const { method, url } of endpoints) {
        try {
          if (method === 'POST') {
            await axiosInstance.post(url, {});
          } else {
            await axiosInstance.delete(url);
          }
          cleared = true;
          console.log('Cart cleared using', method, url);
          break;
        } catch (e) {
          console.warn('Clear cart failed:', method, url, e.response?.status);
        }
      }

      if (!cleared) {
        const cartItems = get().cart;
        for (const item of cartItems) {
          try {
            await axiosInstance.delete(`${API_BASE}/remove/${item.cartItemId}`);
          } catch (e) {
            console.warn(`Failed to remove item ${item.cartItemId}`);
          }
        }
      }

      set({ cart: [] });
    } catch (error) {
      console.error('Final clear cart error:', error.message);
      set({ cart: [], error: null });
    }
  },

  getItemQuantity: (productId) => {
    const item = get().cart.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  },

  isInCart: (productId) => {
    return get().cart.some(item => item.productId === productId);
  },

  setCart: (cart) => set({ cart: cart.map(item => get().normalizeCartItem(item)) }),

  clearError: () => set({ error: null }),

  refreshCart: async () => {
    await get().getCartItems();
  },
}));

export default useCartStore;
