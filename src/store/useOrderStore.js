import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import useAuthStore from './authStore';


const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      filterStatus: '',
      searchQuery: '',
      sortKey: '',
      sortAsc: true,
      loading: false,
      error: null,

       fetchOrders: async () => {
  const token = useAuthStore.getState().token;
  set({ loading: true, error: null });

  try {
    const response = await axios.get(
      'https://logistic-project-backend.onrender.com/api/delivery/all',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data || [];

    const transformed = data.map((item, index) => ({
      id: `#ORD${(item.assignmentId || index + 1).toString().padStart(3, '0')}`,
      customerName: item.customerName,
      address: item.deliveryAddress,
      deliveryDate: item.deliveryDate,
      totalAmount: item.price || 0,
      orderDate: item.orderDate || item.deliveryDate,
      products: item.cartItems?.map(ci => ({
        name: ci.productName,
        quantity: ci.quantity,
      })) || [],
      deliveryBoy: item.deliveryBoyName || '-', // You can resolve name via deliveryBoyId if needed
      status: item.status,
    }));

    set({ orders: transformed });
  } catch (err) {
    set({ error: err.message || 'Failed to fetch orders' });
  } finally {
    set({ loading: false });
  }
},


      setFilterStatus: (status) => set({ filterStatus: status }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      setSort: (key) => {
        const { sortKey, sortAsc } = get();
        set({
          sortKey: key,
          sortAsc: sortKey === key ? !sortAsc : true,
        });
      },

      getRecentOrders: () => {
        const state = get();
        const sorted = [...state.orders].sort(
          (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
        );
        return sorted.slice(0, 5);
      },

      getFilteredSortedOrders: (state) => {
        let orders = [...state.orders];

        if (state.filterStatus) {
          orders = orders.filter((o) => o.status === state.filterStatus);
        }

        if (state.searchQuery) {
          const q = state.searchQuery.toLowerCase();
          orders = orders.filter(
            (o) =>
              o.customerName.toLowerCase().includes(q) ||
              o.deliveryBoy?.toLowerCase().includes(q) ||
              o.id.toLowerCase().includes(q)
          );
        }

        if (state.sortKey) {
          orders.sort((a, b) => {
            const aValue = a[state.sortKey];
            const bValue = b[state.sortKey];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
              return state.sortAsc
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
            } else if (
              typeof aValue === 'number' &&
              typeof bValue === 'number'
            ) {
              return state.sortAsc ? aValue - bValue : bValue - aValue;
            } else {
              return 0;
            }
          });
        }

        return orders;
      },
    }),
    {
      name: 'order-store',
    }
  )
);

// Helper function to convert products string to object array
function parseProducts(productsStr, quantitiesStr) {
  const productParts = productsStr?.split(',') || [];
  const quantityParts = quantitiesStr?.split(',') || [];

  return productParts.map((product, index) => {
    const name = product.trim().replace(/\s\d+$/, '');
    const quantity = Number(quantityParts[index] || 1);
    return { name, quantity };
  });
}

export default useOrderStore;
