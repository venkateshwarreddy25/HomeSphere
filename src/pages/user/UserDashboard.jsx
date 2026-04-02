import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Heart, AlertTriangle, MessageSquare, User, ArrowRight, Home, Star } from 'lucide-react';

const UserDashboard = () => {
  const { userProfile, currentUser } = useAuth();
  const [stats, setStats] = useState({ wishlist: 0, complaints: 0, feedback: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [w, c, f] = await Promise.all([
          getDocs(query(collection(db, 'wishlist'), where('userId', '==', currentUser.uid))),
          getDocs(query(collection(db, 'complaints'), where('userId', '==', currentUser.uid))),
          getDocs(query(collection(db, 'feedback'), where('userId', '==', currentUser.uid))),
        ]);
        setStats({ wishlist: w.size, complaints: c.size, feedback: f.size });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, [currentUser.uid]);

  const quickLinks = [
    { to: '/search', icon: Home, label: 'Browse Properties', color: '#1a2e4a' },
    { to: '/wishlist', icon: Heart, label: 'My Wishlist', color: '#ef4444' },
    { to: '/user/complaint', icon: AlertTriangle, label: 'Post Complaint', color: '#f59e0b' },
    { to: '/user/complaint-status', icon: AlertTriangle, label: 'Complaint Status', color: '#3b82f6' },
    { to: '/user/feedback', icon: MessageSquare, label: 'Give Feedback', color: '#10b981' },
    { to: '/user/profile', icon: User, label: 'My Profile', color: '#8b5cf6' },
  ];

  return (
    <div style={{ paddingTop: '70px' }}>
      <div className="page-header">
        <div className="container">
          <h1>Welcome, {userProfile?.name?.split(' ')[0]} 👋</h1>
          <p>Your personal housing dashboard</p>
        </div>
      </div>
      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon red"><Heart size={22} /></div>
            <div className="stat-info">
              <h3>{loading ? '—' : stats.wishlist}</h3>
              <p>Saved Properties</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon gold"><AlertTriangle size={22} /></div>
            <div className="stat-info">
              <h3>{loading ? '—' : stats.complaints}</h3>
              <p>Complaints Posted</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><Star size={22} /></div>
            <div className="stat-info">
              <h3>{loading ? '—' : stats.feedback}</h3>
              <p>Reviews Given</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: '#1a2e4a', marginBottom: '1rem', fontSize: '1.2rem' }}>Quick Actions</h2>
        <div className="quick-actions">
          {quickLinks.map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to} className="quick-card">
              <div className="icon" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                <Icon size={22} color="#fff" />
              </div>
              <h4>{label}</h4>
            </Link>
          ))}
        </div>

        {/* Profile Summary */}
        <div style={{ marginTop: '2rem', background: '#fff', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, color: '#1a2e4a', marginBottom: '1.25rem' }}>Account Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Full Name', value: userProfile?.name },
              { label: 'Email', value: userProfile?.email },
              { label: 'Phone', value: userProfile?.phone || '—' },
              { label: 'Account Type', value: 'Tenant / Buyer' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</p>
                <p style={{ fontWeight: 600, color: '#1a2e4a', fontSize: '0.9rem' }}>{value}</p>
              </div>
            ))}
          </div>
          <Link to="/user/profile" className="btn btn-outline btn-sm" style={{ marginTop: '1.25rem' }}>
            Edit Profile <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
