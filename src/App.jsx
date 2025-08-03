// src/App.jsx
import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import useAuthStore from './store/authStore';

function App() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const lsToken = localStorage.getItem('token');
    const lsUser = localStorage.getItem('user');
    if (lsToken && !token) {
      useAuthStore.setState({ token: lsToken });
    }
    if (lsUser && !user) {
      try {
        useAuthStore.setState({ user: JSON.parse(lsUser) });
      } catch {}
    }
  }, [token, user]);

  return <AppRoutes />;
}

export default App;
