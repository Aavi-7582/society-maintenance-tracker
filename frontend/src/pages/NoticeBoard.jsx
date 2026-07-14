import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get('/notices');
        // Sort so important notices are pinned to the top
        const sortedNotices = (res.data.notices || res.data.data || []).sort((a, b) => {
          if (a.isImportant && !b.isImportant) return -1;
          if (!a.isImportant && b.isImportant) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt); // newest first if same importance
        });
        setNotices(sortedNotices);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="app-container">
      <Navbar role={localStorage.getItem('role') || 'resident'} />
      <div className="p-4 max-w-4xl mx-auto w-full mt-4">
        <h1 className="mb-4">Notice Board</h1>
        <div className="grid grid-cols-1 gap-4">
          {notices.map(n => (
            <div key={n.id || n._id} className="card" style={n.isImportant ? { borderLeft: '4px solid var(--warning)' } : {}}>
              <h3>{n.title} {n.isImportant && <span className="badge badge-progress" style={{ verticalAlign: 'middle', marginLeft: '0.5rem' }}>📌 Pinned</span>}</h3>
              <p className="text-muted mt-2">{n.description}</p>
              <p className="text-sm text-muted mt-4">Posted on: {new Date(n.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
          {notices.length === 0 && <p>No notices available.</p>}
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;
