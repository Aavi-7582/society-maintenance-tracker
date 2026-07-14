import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ role }) => {
  const navigate = useNavigate();
  return (
    <nav className="premium-navbar" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <h2 style={{ margin: 0, marginRight: 'auto' }}>Society Tracker</h2>
      {role === 'admin' ? (
        <>
          <Link to="/admin" className="btn btn-secondary">Admin Dashboard</Link>
          <Link to="/notices" className="btn btn-secondary">Notice Board</Link>
        </>
      ) : (
        <>
          <Link to="/dashboard" className="btn btn-secondary">Dashboard</Link>
          <Link to="/complaints" className="btn btn-secondary">Complaints</Link>
          <Link to="/notices" className="btn btn-secondary">Notice Board</Link>
        </>
      )}
      <button className="btn btn-primary" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
    </nav>
  );
};

export default Navbar;
