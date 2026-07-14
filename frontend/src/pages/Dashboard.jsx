import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints/my-complaints');
        setComplaints(res.data.complaints || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComplaints();
  }, []);

  return (
    <div className="app-container">
      <Navbar role="resident" />
      <div className="p-4 grid grid-cols-2 max-w-6xl mx-auto w-full mt-4">
        <div className="card">
          <h3>Welcome Resident</h3>
          <p className="text-muted">You have {complaints.filter(c => c.status !== 'RESOLVED').length} active complaints.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/complaints')}>Raise Complaint</button>
        </div>
        <div className="card">
          <h3>Notice Board</h3>
          <p className="text-muted">Check out the latest notices.</p>
          <button className="btn btn-secondary mt-4" onClick={() => navigate('/notices')}>View Notice Board</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
