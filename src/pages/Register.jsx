import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { register } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // default role
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
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card className="p-4 shadow" style={{ width: '380px' }}>
        <h4 className="text-center mb-4">📝 Admin Registration</h4>
        {err && <Alert variant="danger">{err}</Alert>}
        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Role</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>
          <Button type="submit" variant="success" className="w-100">
            Register
          </Button>
        </Form>
        <div className="mt-3 text-center">
          <small>
            Already have an account? <a href="/login">Login</a>
          </small>
        </div>
      </Card>
    </div>
  );
};

export default Register;
