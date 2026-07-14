import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: '', description: '', photo: null });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints/my-complaints');
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('category', formData.category);
      uploadData.append('description', formData.description);
      if (formData.photo) {
        uploadData.append('photo', formData.photo);
      }

      await api.post('/complaints', uploadData);
      setShowNew(false);
      setFormData({ title: '', category: '', description: '', photo: null });
      fetchComplaints();
    } catch (err) {
      alert('Failed to create complaint');
    }
  };

  return (
    <div className="app-container">
      <Navbar role="resident" />
      <div className="p-4 max-w-4xl mx-auto w-full mt-4">
        <div className="flex justify-between items-center mb-4">
          <h1>My Complaints</h1>
          <button className="btn btn-primary" onClick={() => setShowNew(!showNew)}>
            {showNew ? 'Cancel' : 'New Complaint'}
          </button>
        </div>

        {showNew && (
          <form onSubmit={handleCreate} className="card mb-4 max-w-md mx-auto">
            <h3>Raise New Complaint</h3>
            <input type="text" placeholder="Title" className="mb-4 mt-2" required onChange={e => setFormData({...formData, title: e.target.value})} />
            <select className="mb-4" required onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="">Select Category</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Security">Security</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </select>
            <textarea placeholder="Description" className="mb-4" rows="4" required onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            <label className="text-sm text-muted mb-2 flex">Upload Photo (Optional)</label>
            <input type="file" accept="image/*" className="mb-4" onChange={e => setFormData({...formData, photo: e.target.files[0]})} />
            <button type="submit" className="btn btn-primary w-full">Submit</button>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4">
          {complaints.map(c => (
            <Link key={c.id} to={`/complaints/${c.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '1rem' }}>
                <h4>{c.title} <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span></h4>
                <p className="text-sm text-muted">Category: {c.category}</p>
              </div>
            </Link>
          ))}
          {complaints.length === 0 && <p>No complaints found.</p>}
        </div>
      </div>
    </div>
  );
};

export default Complaints;
