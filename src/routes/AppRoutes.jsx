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
  //const token = useAuthStore((state) => state.token);
  const token = true;

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
        <Route path="products/:categoryId" element={<Products />} /> {/* wrapped in Layout */}
        <Route path="customer" element={<Customer />} />
        <Route path="cart" element={<Cart />} />
        <Route path="orders" element={<Orders />} />
        <Route path="invoice/:orderId" element={<Invoices />} />
      </Route>

      {/* Dynamic product route (still protected) */}
      <Route
        path="/products/:categoryId"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
      

    </Routes>
  );
};

export default AppRoutes;
