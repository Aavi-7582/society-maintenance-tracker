import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.user.role);
        if (res.data.user.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="app-container items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="card max-w-md w-full">
        <h2>Login</h2>
        <input type="email" placeholder="Email" className="mb-4" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="mb-4" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn btn-primary w-full mb-2">Login</button>
        <p className="mt-4 text-center text-sm">Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link></p>
      </form>
    </div>
  );
};

export default Login;
