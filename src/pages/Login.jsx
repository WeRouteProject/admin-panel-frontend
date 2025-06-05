import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Box, Card, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { VALID_EMAIL_REGEX } from '../constants/regex';

const Login = () => {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr('');

    if (!VALID_EMAIL_REGEX.test(email.trim())) {
      toast.error('Please enter a valid email address.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate('/');
      }, 2000); // Delay navigation by 2 seconds to allow toast to display
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: '#f8fafc',
        position: 'fixed',
        top: 0,
        left: 0,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <Card
        sx={{
          padding: 5,
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderRadius: 3,
          border: '1px solid rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-3px)',
            '&::before': {
              opacity: 1,
              transform: 'scale(1) rotate(45deg)',
            },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 500,
            background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            opacity: 0,
            transform: 'scale(0.8) rotate(45deg)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            zIndex: 0,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <LockIcon sx={{ fontSize: 40, color: '#64748b' }} />
          </Box>
          <Typography
            variant="h5"
            align="center"
            sx={{
              fontWeight: 600,
              color: '#1e293b',
              mb: 4,
              letterSpacing: '0.5px',
            }}
          >
            Admin Login
          </Typography>
          {err && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                background: '#fef2f2',
                color: '#dc2626',
                borderRadius: 2,
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              {err}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: '#f8fafc',
                  color: '#1e293b',
                  '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  transition: 'background 0.3s ease',
                },
                '& .MuiInputLabel-root': { color: 'rgba(0, 0, 0, 0.6)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
              }}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: '#f8fafc',
                  color: '#1e293b',
                  '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  transition: 'background 0.3s ease',
                },
                '& .MuiInputLabel-root': { color: 'rgba(0, 0, 0, 0.6)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: '#3b82f6',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                color: '#ffffff',
                '&:hover': {
                  background: '#2563eb',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s ease',
                },
                '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.2)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </Box>
      </Card>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        style={{ top: '80px' }}
        toastStyle={{ zIndex: 10000 }}
      />
    </Box>
  );
};

export default Login;