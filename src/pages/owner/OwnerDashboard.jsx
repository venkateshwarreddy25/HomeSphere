import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, CheckCircle, Clock, Users, AlertTriangle, 
  Plus, List, MessageSquare, TrendingUp, BarChart3, Activity
} from 'lucide-react';

const OwnerDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, enquiries: 0, complaints: 0 });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propSnap, inqSnap, compSnap] = await Promise.all([
          getDocs(query(collection(db, 'properties'), where('ownerId', '==', currentUser.uid))),
          getDocs(query(collection(db, 'enquiries'), where('ownerId', '==', currentUser.uid))),
          getDocs(query(collection(db, 'complaints'), where('ownerId', '==', currentUser.uid))),
        ]);
        const allProps = propSnap.docs.map(d => d.data());
        setStats({
          total: propSnap.size,
          pending: allProps.filter(p => p.status === 'pending').length,
          approved: allProps.filter(p => p.status === 'approved').length,
          enquiries: inqSnap.size,
          complaints: compSnap.size,
        });
        const inqDocs = inqSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRecentEnquiries(inqDocs.sort((a,b) => (b.createdAt?.toMillis() || Date.now()) - (a.createdAt?.toMillis() || Date.now())).slice(0, 5));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (currentUser) fetchData();
  }, [currentUser]);

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const quickLinks = [
    { to: '/owner/add-property', icon: Plus, label: 'Add Property', color: '#10b981', bg: '#ecfdf5' },
    { to: '/owner/properties', icon: List, label: 'My Listings', color: '#674df0', bg: '#f0edff' },
    { to: '/owner/enquiries', icon: Users, label: 'Enquiries', color: '#3b82f6', bg: '#eff6ff' },
    { to: '/owner/complaints', icon: AlertTriangle, label: 'Complaints', color: '#ef4444', bg: '#fef2f2' },
  ];

  return (
    <div style={{ paddingTop: '70px', background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a2e4a 0%, #2b4c7e 100%)', padding: '3rem 0 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%)' }} />
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)' }}>
              {userProfile?.name?.[0]?.toUpperCase() || 'O'}
            </div>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Welcome, {userProfile?.name?.split(' ')[0] || 'Owner'}!
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={14} /> Here's what's happening with your properties
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-2.5rem' }}>
        
        {/* Top KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Listings', val: stats.total, icon: Building2, color: '#674df0', bg: '#fff' },
            { label: 'Active/Approved', val: stats.approved, icon: CheckCircle, color: '#10b981', bg: '#fff' },
            { label: 'Pending Review', val: stats.pending, icon: Clock, color: '#f59e0b', bg: '#fff' },
            { label: 'Total Enquiries', val: stats.enquiries, icon: TrendingUp, color: '#0ea5e9', bg: '#fff' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', border: '1px solid #f1f5f9' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>{s.label}</p>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1a2e4a', fontFamily: 'Outfit', lineHeight: 1 }}>
                  {loading ? <div style={{ height: 32, width: 48, background: '#e2e8f0', borderRadius: 4, animation: 'pulse 1.5s infinite' }} /> : s.val}
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <s.icon size={22} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Quick Actions */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#1a2e4a', fontSize: '1.2rem', margin: '0 0 1.25rem' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {quickLinks.map((link, i) => (
                <Link key={i} to={link.to} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  padding: '1.25rem 1rem', background: '#f8fafc', borderRadius: '14px', textDecoration: 'none',
                  border: '1px solid #e2e8f0', transition: 'all 0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = link.color; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = `0 4px 12px ${link.color}15`; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '12px', background: link.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: link.color }}>
                    <link.icon size={20} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Performance Overview (Visual pseudo-chart) */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#1a2e4a', fontSize: '1.2rem', margin: 0 }}>Listing Activity</h2>
               <BarChart3 size={18} color="#94a3b8" />
             </div>
             
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
               <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                    <span>Enquiries Received</span>
                    <span style={{ color: '#0ea5e9' }}>{stats.enquiries}</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((stats.enquiries / 50) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #0ea5e9)', borderRadius: 99 }} />
                  </div>
               </div>
               
               <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                    <span>Approved Properties</span>
                    <span style={{ color: '#10b981' }}>{stats.approved}</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: stats.total ? `${(stats.approved / stats.total) * 100}%` : '0%', height: '100%', background: 'linear-gradient(90deg, #34d399, #10b981)', borderRadius: 99 }} />
                  </div>
               </div>

               <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                    <span>Complaints</span>
                    <span style={{ color: '#ef4444' }}>{stats.complaints}</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((stats.complaints / 10) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #f87171, #ef4444)', borderRadius: 99 }} />
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* Recent Enquiries Table */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#1a2e4a', fontSize: '1.2rem', margin: 0 }}>Recent Enquiries</h2>
            {recentEnquiries.length > 0 && <Link to="/owner/enquiries" style={{ fontSize: '0.85rem', color: '#674df0', fontWeight: 700, textDecoration: 'none' }}>View All →</Link>}
          </div>

          {recentEnquiries.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Property</th>
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>User</th>
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Message</th>
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnquiries.map(e => (
                    <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem' }}><span style={{ fontWeight: 700, color: '#1a2e4a', fontSize: '0.9rem' }}>{e.propertyTitle}</span></td>
                      <td style={{ padding: '1rem', color: '#475569', fontSize: '0.9rem' }}>{e.userName}</td>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}><span style={{ maxWidth: '250px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.message}</span></td>
                      <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>{formatDate(e.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <MessageSquare size={48} opacity={0.3} style={{ marginBottom: '1rem' }} />
              <p>No enquiries received yet.</p>
            </div>
          )}
        </div>
        
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
};

export default OwnerDashboard;
