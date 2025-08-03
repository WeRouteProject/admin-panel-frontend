// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);

  // token === null means still loading/hydrating Zustand store

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
