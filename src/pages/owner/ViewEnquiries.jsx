import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Users } from 'lucide-react';

const ViewEnquiries = () => {
  const { currentUser } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'enquiries'), where('ownerId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setEnquiries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
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
          <h1>Enquiries</h1>
          <p>Messages from interested buyers and tenants</p>
        </div>
      </div>
      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : enquiries.length === 0 ? (
          <div className="empty-state"><Users size={56} /><h3>No enquiries yet</h3><p>Enquiries from users will appear here once your properties are approved</p></div>
        ) : (
          <>
            <p style={{ color: '#64748b', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <strong style={{ color: '#1a2e4a' }}>{enquiries.length}</strong> total enquiries
            </p>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Property</th><th>User Name</th><th>Email</th><th>Message</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {enquiries.map(e => (
                    <tr key={e.id}>
                      <td data-label="Property"><span style={{ fontWeight: 600, color: '#1a2e4a' }}>{e.propertyTitle || e.propertyId}</span></td>
                      <td data-label="User">{e.userName}</td>
                      <td data-label="Email"><a href={`mailto:${e.userEmail}`} style={{ color: '#f5a623' }}>{e.userEmail}</a></td>
                      <td data-label="Message">
                        <span style={{ maxWidth: '280px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.message}>{e.message}</span>
                      </td>
                      <td data-label="Date">{formatDate(e.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewEnquiries;
