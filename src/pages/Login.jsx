// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const predefinedAdmin = {
  username: 'admin',
  password: 'admin123'
};

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === predefinedAdmin.username && password === predefinedAdmin.password) {
      onLogin();
      navigate('/home');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#1C2E4A' }}>
      <Card className="shadow-lg" style={{ width: '400px', borderRadius: '12px', padding: '30px', backgroundColor: '#236C4B' }}>
        <Card.Body>
          <Card.Title className="text-center" style={{ fontSize: '2em', fontWeight: 'bold', color: '#E4CFA1' }}>
            Admin Login
          </Card.Title>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#D97C29', fontWeight: 'bold' }}>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ backgroundColor: '#7E1F28', color: '#E4CFA1', border: '2px solid #D97C29', fontWeight: 'bold' }}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#D97C29', fontWeight: 'bold' }}>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ backgroundColor: '#7E1F28', color: '#E4CFA1', border: '2px solid #D97C29', fontWeight: 'bold' }}
                required
              />
            </Form.Group>
            <Button
              variant="warning"
              onClick={handleLogin}
              className="w-100 py-2"
              style={{ backgroundColor: '#D97C29', color: '#E4CFA1', fontWeight: 'bold', border: 'none' }}
            >
              Login
            </Button>
          </Form>
          {error && <p className="text-danger text-center mt-3" style={{ fontWeight: 'bold' }}>{error}</p>}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
