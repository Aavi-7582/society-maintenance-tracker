import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  
  // Admin Update State
  const role = localStorage.getItem('role') || 'resident';
  const [statusUpdate, setStatusUpdate] = useState('');
  const [noteUpdate, setNoteUpdate] = useState('');
  const [priorityUpdate, setPriorityUpdate] = useState('');

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.complaint || res.data.data);
      if (res.data.complaint || res.data.data) {
        setStatusUpdate((res.data.complaint || res.data.data).status);
        setPriorityUpdate((res.data.complaint || res.data.data).priority);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/complaints/${id}/status`, { status: statusUpdate, note: noteUpdate });
      setNoteUpdate('');
      fetchDetails();
      alert('Status updated successfully!');
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handlePriorityUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/complaints/${id}/priority`, { priority: priorityUpdate });
      fetchDetails();
      alert('Priority updated successfully!');
    } catch (err) {
      alert('Failed to update priority');
    }
  };

  if (!complaint) return <div className="app-container"><Navbar role={role} /><div className="p-4">Loading...</div></div>;

  return (
    <div className="app-container">
      <Navbar role={role} />
      <div className="p-4 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <h2>{complaint.title}</h2>
            <div className="flex gap-2 mb-4 mt-2">
              <span className={`badge badge-${complaint.status.toLowerCase()}`}>{complaint.status}</span>
              <span className="badge badge-progress">Priority: {complaint.priority}</span>
              {complaint.isOverdue && <span className="badge badge-open">OVERDUE</span>}
            </div>
            
            <p><strong>Category:</strong> {complaint.category}</p>
            <p><strong>Resident:</strong> {complaint.resident?.name} (Flat {complaint.resident?.flatNo})</p>
            <p className="mt-4"><strong>Description:</strong> <br/>{complaint.description}</p>
            
            {complaint.photo && (
              <div className="mt-4">
                <strong>Attached Photo:</strong><br/>
                <img src={complaint.photo} alt="Complaint" style={{ maxWidth: '100%', borderRadius: '0.5rem', marginTop: '0.5rem' }} />
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="card">
              <h4>Status History</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {complaint.statusHistory && complaint.statusHistory.map((h, i) => (
                  <li key={i} className="text-sm mb-2" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                    <span className="text-muted">{new Date(h.timestamp).toLocaleString()}:</span> <br/>
                    <strong>{h.status}</strong> - {h.note} <br/>
                    <span className="text-muted">By: {h.actor?.name || 'System'}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin Controls */}
            {role === 'admin' && complaint.status !== 'RESOLVED' && (
              <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <h3 className="mb-4">Admin Controls</h3>
                
                <form onSubmit={handlePriorityUpdate} className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <strong>Set Priority</strong>
                  <div className="flex gap-2 mt-2">
                    <select value={priorityUpdate} onChange={e => setPriorityUpdate(e.target.value)} required>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <button type="submit" className="btn btn-secondary text-sm" style={{ padding: '0.5rem' }}>Update</button>
                  </div>
                </form>

                <form onSubmit={handleStatusUpdate}>
                  <strong>Update Status</strong>
                  <select className="mt-2 mb-2" value={statusUpdate} onChange={e => setStatusUpdate(e.target.value)} required>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                  <textarea placeholder="Optional note for resident..." className="mb-2" rows="2" value={noteUpdate} onChange={e => setNoteUpdate(e.target.value)}></textarea>
                  <button type="submit" className="btn btn-primary w-full text-sm">Update Status</button>
                </form>
              </div>
            )}
            
            {complaint.status === 'RESOLVED' && (
              <div className="card" style={{ borderLeft: '4px solid var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                <h3>Issue Closed</h3>
                <p className="text-muted text-sm mt-2">This complaint has been marked as resolved and can no longer be updated.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
