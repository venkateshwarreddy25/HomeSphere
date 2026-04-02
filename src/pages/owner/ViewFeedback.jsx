import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/StarRating';
import { MessageSquare } from 'lucide-react';

const ViewFeedback = () => {
  const { currentUser } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'feedback'), where('ownerId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setFeedback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const avgRating = feedback.length ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1) : 0;

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ paddingTop: '70px' }}>
      <div className="page-header">
        <div className="container">
          <h1>Feedback & Reviews</h1>
          <p>See what tenants and buyers say about your properties</p>
        </div>
      </div>
      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        {feedback.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #1a2e4a, #243858)', borderRadius: '16px', padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#fff' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#f5a623' }}>{avgRating}</div>
            <div>
              <StarRating rating={Math.round(avgRating)} readOnly size={22} />
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>Average rating from {feedback.length} review{feedback.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : feedback.length === 0 ? (
          <div className="empty-state"><MessageSquare size={56} /><h3>No feedback yet</h3><p>Feedback from users will appear here</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Property</th><th>User</th><th>Message</th><th>Rating</th><th>Date</th></tr>
              </thead>
              <tbody>
                {feedback.map(f => (
                  <tr key={f.id}>
                    <td data-label="Property"><span style={{ fontWeight: 600, color: '#1a2e4a' }}>{f.propertyTitle || f.propertyId}</span></td>
                    <td data-label="User">{f.userName}</td>
                    <td data-label="Message">
                      <span style={{ maxWidth: '240px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.message}>{f.message}</span>
                    </td>
                    <td data-label="Rating"><StarRating rating={f.rating} readOnly size={16} /></td>
                    <td data-label="Date">{formatDate(f.createdAt)}</td>
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

export default ViewFeedback;
