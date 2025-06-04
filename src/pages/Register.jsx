import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Box, Card, Typography, TextField, Button, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Register = () => {
  const { register } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register({ username, email, password, role });
      navigate('/');
    } catch (error) {
      setErr(error.message || 'Registration failed');
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
            <PersonAddIcon sx={{ fontSize: 40, color: '#64748b' }} />
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
            Admin Registration
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
            onSubmit={handleRegister}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <TextField
              label="Username"
              type="text"
              variant="outlined"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
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
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
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
              placeholder="Enter password"
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
            <FormControl
              variant="outlined"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: '#f8fafc',
                  color: '#1e293b',
                  '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(0, 0, 0, 0.6)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
              }}
            >
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              variant="contained"
              fullWidth
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
              Register
            </Button>
          </Box>
          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 3, color: 'rgba(0, 0, 0, 0.7)' }}
          >
            Already have an account?{' '}
            <a
              href="/login"
              style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Login
            </a>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default Register;