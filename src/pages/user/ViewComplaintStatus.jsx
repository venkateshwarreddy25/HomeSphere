import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle } from 'lucide-react';

const statusStyle = {
  Pending: 'badge-pending',
  OnProgress: 'badge-onprogress',
  Completed: 'badge-completed',
  Rejected: 'badge-rejected',
};

const ViewComplaintStatus = () => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const q = query(
          collection(db, 'complaints'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setComplaints(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchComplaints();
  }, []);

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ paddingTop: '70px' }}>
      <div className="page-header">
        <div className="container">
          <h1>Complaint Status</h1>
          <p>Track the status of your submitted complaints</p>
        </div>
      </div>
      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle size={56} />
            <h3>No complaints found</h3>
            <p>You haven't submitted any complaints yet</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Complaint</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id}>
                    <td data-label="Property">
                      <span style={{ fontWeight: 600, color: '#1a2e4a' }}>{c.propertyTitle || c.propertyId}</span>
                    </td>
                    <td data-label="Complaint">
                      <span style={{ maxWidth: '280px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.complaint}
                      </span>
                    </td>
                    <td data-label="Status">
                      <span className={`badge ${statusStyle[c.status] || 'badge-pending'}`}>{c.status}</span>
                    </td>
                    <td data-label="Date">{formatDate(c.createdAt)}</td>
                    <td data-label="Image">
                      {c.image ? (
                        <a href={c.image} target="_blank" rel="noopener noreferrer">
                          <img src={c.image} alt="proof" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: '6px' }} />
                        </a>
                      ) : '—'}
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

export default ViewComplaintStatus;
