import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'https://logistic-project-backend.onrender.com/api';

const useProductStore = create((set, get) => ({
  products: [],
  loading: false,

  fetchProducts: async (categoryId) => {
    try {
      set({ loading: true });
      const endpoint = categoryId
        ? `${API_BASE}/products/category/${categoryId}`
        : `${API_BASE}/products`;
      const res = await axios.get(endpoint);
      set({ products: res.data });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    try {
      await axios.delete(`${API_BASE}/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.productId !== id),
      }));
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  },

  saveProduct: async ({ productName, description, price, categoryId, isEditing, editProductId }) => {
    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/products/${editProductId}`, {
          productName,
          description,
          price,
          categoryId: parseInt(categoryId),
        });
        set((state) => ({
          products: state.products.map((p) =>
            p.productId === editProductId
              ? { ...p, productName, description, price }
              : p
          ),
        }));
      } else {
        await axios.post(`${API_BASE}/products`, {
          productName,
          description,
          price,
          categoryId: parseInt(categoryId),
        });
        // Refresh product list after addition
        await get().fetchProducts(categoryId);
      }
    } catch (err) {
      console.error('Error saving product:', err);
    }
  },
}));

export default useProductStore;
