import { create } from 'zustand';
import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';

const API_BASE = 'http://35.170.21.202:3000/api';


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
      const res = await axiosInstance.get(endpoint);
      set({
        products: res.data.map(product => {
          const isActive = product.status === true || product.status === 'true';
          const discount = parseFloat(product.discount || 0);
          const discountedPrice = discount
            ? Math.round(product.price - (product.price * discount) / 100)
            : null;

          return {
            ...product,
            status: isActive,
            discountedPrice: discountedPrice
          };
        })
      });
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
      const res = await axiosInstance.get(`/products/${id}`);
      const product = res.data;
      const discount = parseFloat(product.discount || 0);
      const discountedPrice = discount
        ? Math.round(product.price - (product.price * discount) / 100)
        : null;
      return {
        ...product,
        status: product.status === true || product.status === 'true',
        discountedPrice
      };
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
      const res = await axiosInstance.delete(`/products/${id}`);
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

  saveProduct: async ({
    productName,
    description,
    price,
    categoryId,
    image,
    isEditing,
    editProductId,
    status,
    discount, // ✅ Added discount
  }) => {
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
      formData.append('status', status.toString());
      if (discount) {
        formData.append('discount', discount); // ✅ Append discount if provided
      }
      if (image) {
        formData.append('image', image);
      }

      let res;
      if (isEditing) {
        res = await axiosInstance.put(`/products/${editProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const updatedProduct = res.data.data;
        const discount = parseFloat(updatedProduct.discount || 0);
        const discountedPrice = discount
          ? Math.round(updatedProduct.price - (updatedProduct.price * discount) / 100)
          : null;

        set((state) => ({
          products: state.products.map((p) =>
            p.productId === editProductId
              ? {
                  ...updatedProduct,
                  status: updatedProduct.status === true || updatedProduct.status === 'true',
                  discountedPrice
                }
              : p
          ),
          error: null,
        }));
      } else {
        res = await axiosInstance.post(`/products`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const newProduct = res.data.data;
        const discount = parseFloat(newProduct.discount || 0);
        const discountedPrice = discount
          ? Math.round(newProduct.price - (newProduct.price * discount) / 100)
          : null;

        set((state) => ({
          products: [
            ...state.products,
            {
              ...newProduct,
              status: newProduct.status === true || newProduct.status === 'true',
              discountedPrice
            }
          ],
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

  updateProductStatuses: (categoryId, newStatus) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.categoryId === parseInt(categoryId)
          ? { ...product, status: newStatus }
          : product
      ),
    }));
  },
}));

export default useProductStore;
