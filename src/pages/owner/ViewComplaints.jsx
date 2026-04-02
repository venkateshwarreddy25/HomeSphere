import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const statusStyle = { Pending: 'badge-pending', OnProgress: 'badge-onprogress', Completed: 'badge-completed', Rejected: 'badge-rejected' };

const ViewComplaints = () => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'complaints'), where('ownerId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setComplaints(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const updateStatus = async (complaintId, newStatus) => {
    try {
      await updateDoc(doc(db, 'complaints', complaintId), { status: newStatus });
      setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: newStatus } : c));
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ paddingTop: '70px' }}>
      <div className="page-header">
        <div className="container">
          <h1>Complaints</h1>
          <p>Manage and resolve tenant complaints</p>
        </div>
      </div>
      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : complaints.length === 0 ? (
          <div className="empty-state"><AlertTriangle size={56} /><h3>No complaints yet</h3><p>Complaints from users will appear here</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Property</th><th>User</th><th>Complaint</th><th>Image</th><th>Status</th><th>Date</th><th>Update</th></tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id}>
                    <td data-label="Property"><span style={{ fontWeight: 600, color: '#1a2e4a' }}>{c.propertyTitle || c.propertyId}</span></td>
                    <td data-label="User">{c.userName}</td>
                    <td data-label="Complaint">
                      <span style={{ maxWidth: '200px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.complaint}>{c.complaint}</span>
                    </td>
                    <td data-label="Image">
                      {c.image ? <a href={c.image} target="_blank" rel="noopener noreferrer"><img src={c.image} alt="proof" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: '6px' }} /></a> : '—'}
                    </td>
                    <td data-label="Status"><span className={`badge ${statusStyle[c.status] || 'badge-pending'}`}>{c.status}</span></td>
                    <td data-label="Date">{formatDate(c.createdAt)}</td>
                    <td data-label="Update">
                      <select
                        value={c.status}
                        onChange={e => updateStatus(c.id, e.target.value)}
                        className="form-control"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', minWidth: '130px' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="OnProgress">On Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewComplaints;
