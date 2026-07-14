import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const Admin = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, overdue: 0 });
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeData, setNoticeData] = useState({ title: '', description: '', isImportant: false });

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, [search, category, status]);

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (category) queryParams.append('category', category);
      if (status) queryParams.append('status', status);

      const compRes = await api.get(`/admin/complaints?${queryParams.toString()}`);
      
      // Sort so overdue complaints surface at the top
      const sortedComplaints = (compRes.data.complaints || []).sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return 0;
      });
      setComplaints(sortedComplaints);
      
      const statRes = await api.get('/admin/dashboard/stats');
      setStats(statRes.data.data?.cards || { total: 0, overdue: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notices', noticeData);
      setShowNoticeForm(false);
      alert('Notice posted!');
    } catch (err) {
      alert('Failed to post notice');
    }
  };

  return (
    <div className="app-container">
      <Navbar role="admin" />
      <div className="p-4 max-w-6xl mx-auto w-full mt-4">
        <div className="flex justify-between items-center mb-4">
          <h1>Admin Dashboard</h1>
          <button className="btn btn-primary" onClick={() => setShowNoticeForm(!showNoticeForm)}>
            {showNoticeForm ? 'Cancel' : 'Post Notice'}
          </button>
        </div>
        
        {showNoticeForm && (
          <form onSubmit={handlePostNotice} className="card mb-4 max-w-md mx-auto">
            <h3>Post New Notice</h3>
            <input type="text" placeholder="Title" className="mb-4 mt-2" required onChange={e => setNoticeData({...noticeData, title: e.target.value})} />
            <textarea placeholder="Description" className="mb-4" rows="4" required onChange={e => setNoticeData({...noticeData, description: e.target.value})}></textarea>
            <label className="mb-4 flex items-center gap-2">
              <input type="checkbox" onChange={e => setNoticeData({...noticeData, isImportant: e.target.checked})} />
              Mark as Important
            </label>
            <button type="submit" className="btn btn-primary w-full">Post Notice</button>
          </form>
        )}

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-2 mb-4 gap-4">
          <div className="card">
            <h3>Total Complaints</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total || 0}</p>
          </div>
          <div className="card">
            <h3>Overdue Complaints</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--error)' }}>{stats.overdue || 0}</p>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>Manage Complaints</h3>
            
            {/* Filters */}
            <div className="flex gap-2">
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '0.25rem 0.5rem' }} />
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '0.25rem 0.5rem' }}>
                <option value="">All Categories</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Security">Security</option>
                <option value="Cleanliness">Cleanliness</option>
              </select>
              <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '0.25rem 0.5rem' }}>
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          {complaints.map(c => (
            <Link key={c.id || c._id} to={`/complaints/${c.id || c._id}`} style={{ textDecoration: 'none' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                <h4>
                  {c.title} <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span> 
                  {c.isOverdue && <span className="badge badge-open" style={{ marginLeft: '0.5rem' }}>OVERDUE</span>}
                  <span className="badge badge-progress" style={{ marginLeft: '0.5rem' }}>Priority: {c.priority}</span>
                </h4>
                <p className="text-sm text-muted">Category: {c.category} | Raised by: {c.resident?.name || 'Unknown'}</p>
              </div>
            </Link>
          ))}
          {complaints.length === 0 && <p>No complaints found matching filters.</p>}
        </div>
      </div>
    </div>
  );
};

export default Admin;
