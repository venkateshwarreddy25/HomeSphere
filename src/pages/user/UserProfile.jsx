import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Phone, Lock, Save, Eye, EyeOff,
  Building2, Heart, MessageSquare, CheckCircle, Edit3, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = ['Profile', 'Security', 'Activity'];

const UserProfile = () => {
  const { userProfile, currentUser, changePassword, fetchUserProfile } = useAuth();
  const [profile, setProfile] = useState({ name: userProfile?.name || '', phone: userProfile?.phone || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [stats, setStats] = useState({ wishlist: 0, enquiries: 0, viewed: 0 });

  useEffect(() => {
    if (!currentUser) return;
    const fetchStats = async () => {
      try {
        const [wishSnap, enqSnap] = await Promise.all([
          getDocs(query(collection(db, 'wishlist'), where('userId', '==', currentUser.uid))),
          getDocs(query(collection(db, 'enquiries'), where('userId', '==', currentUser.uid))),
        ]);
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]').length;
        setStats({ wishlist: wishSnap.size, enquiries: enqSnap.size, viewed });
      } catch {}
    };
    fetchStats();
  }, [currentUser]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error('Name is required'); return; }
    setSavingProfile(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { name: profile.name.trim(), phone: profile.phone });
      await fetchUserProfile(currentUser.uid);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.current) { toast.error('Enter your current password'); return; }
    if (passwords.newPass.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setSavingPassword(true);
    try {
      await changePassword(passwords.current, passwords.newPass);
      toast.success('Password changed!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
        ? 'Current password is incorrect' : 'Failed to change password');
    } finally { setSavingPassword(false); }
  };

  const initials = userProfile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const joinDate = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div style={{ paddingTop: '70px', background: '#f8fafc', minHeight: '100vh' }}>

      {/* Hero Banner */}
      <div className="profile-hero">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.07) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.05) 0%, transparent 60%)' }} />
      </div>

      <div className="container profile-container">
        
        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-avatar">
            {initials}
          </div>
          <div className="profile-info" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem', justifyContent: 'inherit' }}>
              <h1>{userProfile?.name || 'User'}</h1>
              <span className="profile-role-badge">
                {userProfile?.role || 'user'}
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.3rem', fontWeight: 500 }}>
              Member since {joinDate} · {currentUser?.email}
            </p>
          </div>
          <button onClick={() => setActiveTab('Profile')} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff',
            border: '2px solid #e2e8f0', borderRadius: '14px', padding: '0.75rem 1.5rem',
            color: '#674df0', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', whiteSpace: 'nowrap', transition: 'all 0.2s'
          }} onMouseOver={e => e.currentTarget.style.background='#f8fafc'} onMouseOut={e => e.currentTarget.style.background='#fff'}>
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>

        {/* Stats Cards */}
        <div className="profile-stats-grid">
          {[
            { icon: <Heart size={24} color="#ef4444" />, val: stats.wishlist, label: 'Wishlisted', bg: '#fff1f2' },
            { icon: <MessageSquare size={24} color="#674df0" />, val: stats.enquiries, label: 'Enquiries Sent', bg: '#f0edff' },
            { icon: <Eye size={24} color="#0ea5e9" />, val: stats.viewed, label: 'Recently Viewed', bg: '#f0f9ff' },
          ].map((s, i) => (
            <div key={i} className="profile-stat-card">
              <div style={{ width: 56, height: 56, borderRadius: '16px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1a2e4a', fontFamily: 'Outfit', lineHeight: 1, marginBottom: '0.25rem' }}>{s.val}</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="profile-tabs-container">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: '0.8rem 1.75rem', borderRadius: '12px', border: 'none',
              background: activeTab === t ? 'linear-gradient(135deg, #674df0, #4b36c4)' : 'transparent',
              color: activeTab === t ? '#fff' : '#64748b', fontWeight: 800, fontSize: '0.95rem',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: activeTab === t ? '0 8px 24px rgba(103,77,240,0.3)' : 'none',
              whiteSpace: 'nowrap'
            }}>{t}</button>
          ))}
        </div>

        {/* Tab: Profile */}
        {activeTab === 'Profile' && (
          <div className="profile-content-box">
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#1a2e4a', marginBottom: '2rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User size={20} color="#674df0" /> Personal Information
            </h2>
            <form onSubmit={handleProfileSave}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px,1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <Field label="Full Name" icon={<User size={18} />}>
                  <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={inputStyle} placeholder="Your name" />
                </Field>
                <Field label="Phone Number" icon={<Phone size={18} />}>
                  <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} style={inputStyle} placeholder="+91 XXXXX XXXXX" />
                </Field>
              </div>
              <Field label="Email Address (read-only)" icon={<Mail size={18} />}>
                <input value={currentUser?.email || ''} readOnly style={{ ...inputStyle, background: '#f1f5f9', color: '#94a3b8', border: 'none' }} />
              </Field>
              <button type="submit" disabled={savingProfile} style={{...primaryBtnStyle, marginTop: '2rem'}}>
                {savingProfile ? 'Saving…' : <><Save size={18} /> Save Changes</>}
              </button>
            </form>
          </div>
        )}

        {/* Tab: Security */}
        {activeTab === 'Security' && (
          <div className="profile-content-box" style={{ maxWidth: 600 }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#1a2e4a', marginBottom: '2rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={20} color="#674df0" /> Change Password
            </h2>
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { label: 'Current Password', key: 'current', showKey: 'current', placeholder: 'Your current password' },
                { label: 'New Password', key: 'newPass', showKey: 'new', placeholder: 'Min. 6 characters' },
                { label: 'Confirm New Password', key: 'confirm', showKey: 'confirm', placeholder: 'Re-enter new password' },
              ].map(({ label, key, showKey, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type={showPass[showKey] ? 'text' : 'password'} value={passwords[key]}
                      onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#674df0'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                    <button type="button" onClick={() => setShowPass(p => ({ ...p, [showKey]: !p[showKey] }))} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      {showPass[showKey] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={savingPassword} style={{...primaryBtnStyle, marginTop: '1rem'}}>
                {savingPassword ? 'Changing…' : <><Lock size={18} /> Change Password</>}
              </button>
            </form>
          </div>
        )}

        {/* Tab: Activity */}
        {activeTab === 'Activity' && (
          <div className="profile-content-box">
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#1a2e4a', marginBottom: '2rem', fontSize: '1.25rem' }}>Account Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { icon: <CheckCircle size={22} color="#10b981" />, label: 'Account Created', value: joinDate, bg: '#f0fdf4' },
                { icon: <Mail size={22} color="#674df0" />, label: 'Email Address', value: currentUser?.email, bg: '#f0edff' },
                { icon: <Building2 size={22} color="#f59e0b" />, label: 'Account Type', value: userProfile?.role?.charAt(0).toUpperCase() + userProfile?.role?.slice(1), bg: '#fefce8' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem', borderRadius: '16px', background: item.bg, border: '1px solid rgba(0,0,0,0.03)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: '1.1rem', color: '#1a2e4a', fontWeight: 800, margin: '0.2rem 0 0' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, icon, children }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>{icon}</span>
      {React.cloneElement(children, { style: { ...inputStyle, ...children.props.style } })}
    </div>
  </div>
);

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '1rem 1.25rem 1rem 3rem', borderRadius: '14px', border: '2px solid #e2e8f0', background: '#fff', fontSize: '1.05rem', color: '#1a2e4a', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };
const primaryBtnStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  background: 'linear-gradient(135deg, #674df0, #4b36c4)', color: '#fff', border: 'none',
  borderRadius: '14px', padding: '1rem 2.5rem', fontWeight: 800, fontSize: '1.05rem',
  cursor: 'pointer', boxShadow: '0 8px 24px rgba(103,77,240,0.3)', transition: 'all 0.2s'
};

export default UserProfile;
