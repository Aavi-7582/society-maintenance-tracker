import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', flatNo: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.user.role);
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="app-container items-center justify-center h-screen">
      <form onSubmit={handleRegister} className="card max-w-md w-full">
        <h2>Register Resident</h2>
        <input type="text" placeholder="Full Name" className="mb-4" onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input type="email" placeholder="Email" className="mb-4" onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Password" className="mb-4" onChange={e => setFormData({...formData, password: e.target.value})} required />
        <input type="text" placeholder="Flat No (e.g. A-101)" className="mb-4" onChange={e => setFormData({...formData, flatNo: e.target.value})} required />
        <button type="submit" className="btn btn-primary w-full">Register</button>
        <p className="mt-4 text-center text-sm">Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link></p>
      </form>
    </div>
  );
};

export default Register;
