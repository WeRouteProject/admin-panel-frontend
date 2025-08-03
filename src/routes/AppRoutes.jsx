// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import Categories from '../pages/Categories';
import Customer from '../pages/Customer';
import Products from '../pages/Products';
import Orders from '../pages/Orders';
import Invoices from '../pages/Invoices';
import Cart from '../pages/Cart';
import useAuthStore from '../store/authStore';

const AppRoutes = () => {
  const token = useAuthStore((state) => state.token);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="categories" element={<Categories />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:categoryId" element={<Products />} />
        <Route path="customer" element={<Customer />} />
        <Route path="cart" element={<Cart />} />
        <Route path="orders" element={<Orders />} />
        <Route path="invoice/:orderId" element={<Invoices />} />
      </Route>

      {/* Catch all - redirect to home if logged in, else to login */}
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
    </Routes>
  );
};

export default AppRoutes;
