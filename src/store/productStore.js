import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'https://logistic-project-backend.onrender.com/api';

const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async (categoryId) => {
    try {
      set({ loading: true, error: null });
      if (categoryId && isNaN(categoryId)) {
        throw new Error('Invalid category ID');
      }
      const endpoint = categoryId
        ? `${API_BASE}/products/category/${categoryId}`
        : `${API_BASE}/products`;
      const res = await axios.get(endpoint);
      set({ products: res.data });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ error: error.message || 'Failed to fetch products' });
    } finally {
      set({ loading: false });
    }
  },

  fetchProductById: async (id) => {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Invalid product ID');
      }
      set({ loading: true, error: null });
      const res = await axios.get(`${API_BASE}/products/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      set({ error: error.message || 'Failed to fetch product' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Invalid product ID');
      }
      const res = await axios.delete(`${API_BASE}/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.productId !== id),
        error: null,
      }));
      return res.data.message;
    } catch (err) {
      console.error('Error deleting product:', err);
      set({ error: err.message || 'Failed to delete product' });
      throw err;
    }
  },

  saveProduct: async ({ productName, description, price, categoryId, image, isEditing, editProductId }) => {
    try {
      if (!productName || !description || isNaN(price) || isNaN(categoryId)) {
        throw new Error('Invalid product data');
      }
      if (isEditing && (!editProductId || isNaN(editProductId))) {
        throw new Error('Invalid product ID for editing');
      }

      const formData = new FormData();
      formData.append('productName', productName);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('categoryId', parseInt(categoryId));
      if (image) {
        formData.append('image', image);
      }

      let res;
      if (isEditing) {
        res = await axios.put(`${API_BASE}/products/${editProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        set((state) => ({
          products: state.products.map((p) =>
            p.productId === editProductId ? res.data.data : p
          ),
          error: null,
        }));
      } else {
        res = await axios.post(`${API_BASE}/products`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        set((state) => ({
          products: [...state.products, res.data.data],
          error: null,
        }));
      }
      return res.data.message;
    } catch (err) {
      console.error('Error saving product:', err);
      set({ error: err.message || 'Failed to save product' });
      throw err;
    }
  },
}));

export default useProductStore;