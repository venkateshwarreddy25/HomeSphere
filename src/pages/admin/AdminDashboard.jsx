import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Users, Building2, Clock, AlertTriangle, CheckCircle, 
  UserCheck, ShieldCheck, Activity, ChevronRight, BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, owners: 0, properties: 0, pending: 0, complaints: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnap, propsSnap, complaintsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'properties')),
          getDocs(collection(db, 'complaints')),
        ]);
        const allUsers = usersSnap.docs.map(d => d.data());
        const allProps = propsSnap.docs.map(d => d.data());
        setStats({
          users: allUsers.filter(u => u.role === 'user').length,
          owners: allUsers.filter(u => u.role === 'owner').length,
          properties: propsSnap.size,
          pending: allProps.filter(p => p.status === 'pending').length,
          approved: allProps.filter(p => p.status === 'approved').length,
          complaints: complaintsSnap.size,
        });
        
        const recent = propsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toMillis() || Date.now()) - (a.createdAt?.toMillis() || Date.now()))
          .slice(0, 5);
        setRecentActivity(recent);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return { bg: '#dcfce7', text: '#166534' };
      case 'rejected': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#fef3c7', text: '#92400e' };
    }
  };

  const statCards = [
    { label: 'Registered Users', val: stats.users, icon: Users, color: '#3b82f6', bg: '#eff6ff', to: '/admin/users' },
    { label: 'Verified Owners', val: stats.owners, icon: UserCheck, color: '#8b5cf6', bg: '#f5f3ff', to: '/admin/users' },
    { label: 'Total Properties', val: stats.properties, icon: Building2, color: '#10b981', bg: '#ecfdf5', to: '/admin/properties' },
    { label: 'Pending Approval', val: stats.pending, icon: Clock, color: '#f59e0b', bg: '#fffbeb', to: '/admin/approve' },
    { label: 'Approved Listings', val: stats.approved, icon: CheckCircle, color: '#14b8a6', bg: '#f0fdfa', to: '/admin/properties' },
    { label: 'Open Complaints', val: stats.complaints, icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2', to: '/admin/properties' },
  ];

  return (
    <div style={{ paddingTop: '70px', background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* Premium Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '3.5rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 68, height: 68, borderRadius: '20px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#818cf8' }}>
              <ShieldCheck size={36} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                Command Center
              </h1>
              <p style={{ color: '#94a3b8', margin: '0.4rem 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                <Activity size={16} /> Platform overview & administrative controls
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-2.5rem', position: 'relative', zIndex: 10 }}>
        
        {/* Pending Alert */}
        {!loading && stats.pending > 0 && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(245,158,11,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#92400e' }}>Action Required</h3>
                <p style={{ margin: '0.25rem 0 0', color: '#b45309', fontSize: '0.9rem' }}><strong>{stats.pending}</strong> property listings are awaiting your review and approval.</p>
              </div>
            </div>
            <Link to="/admin/approve" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f59e0b', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(245,158,11,0.3)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              Review Now <ChevronRight size={16} />
            </Link>
          </div>
        )}

        {/* Dynamic KPI Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {statCards.map((s, i) => (
            <Link key={i} to={s.to} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', transition: 'all 0.2s', cursor: 'pointer' }}
                   onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 24px ${s.color}15`; e.currentTarget.style.borderColor = s.color; }}
                   onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>{s.label}</p>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1a2e4a', fontFamily: 'Outfit', lineHeight: 1 }}>
                    {loading ? <div style={{ height: '2.5rem', width: '4rem', background: '#f1f5f9', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} /> : s.val}
                  </div>
                </div>
                <div style={{ width: 56, height: 56, borderRadius: '16px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={28} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Global Activity Feed (Recent Listings) */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#1a2e4a', fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} color="#674df0" /> Real-Time Activity
            </h2>
            <Link to="/admin/properties" style={{ fontSize: '0.9rem', color: '#674df0', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View All Properties <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
             <div style={{ padding: '3rem', textAlign: 'center' }}>
               <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#674df0', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
             </div>
          ) : recentActivity.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>Property Title</th>
                    <th style={{ padding: '1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner</th>
                    <th style={{ padding: '1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</th>
                    <th style={{ padding: '1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map(p => {
                    const statusColors = getStatusColor(p.status);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#e2e8f0' }}>
                              {p.photos?.[0] ? <img src={p.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 size={24} color="#94a3b8" style={{ margin: '12px' }} />}
                            </div>
                            <div>
                              <Link to={`/property/${p.id}`} style={{ fontWeight: 800, color: '#1a2e4a', fontSize: '0.95rem', textDecoration: 'none', display: 'block', marginBottom: '0.2rem' }}>{p.title}</Link>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p.type === 'rental' ? '#f59e0b' : '#3b82f6', textTransform: 'uppercase', background: p.type === 'rental' ? '#fef3c7' : '#eff6ff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                For {p.type === 'rental' ? 'Rent' : 'Sale'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>{p.ownerName}</td>
                        <td style={{ padding: '1.25rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>{p.city}</td>
                        <td style={{ padding: '1.25rem' }}>
                          <span style={{ background: statusColors.bg, color: statusColors.text, padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>{formatDate(p.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <Building2 size={48} opacity={0.3} style={{ marginBottom: '1rem' }} />
              <p style={{ margin: 0, fontSize: '0.95rem' }}>No recent property activity found.</p>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
