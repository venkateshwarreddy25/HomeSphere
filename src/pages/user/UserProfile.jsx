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
      <div style={{ background: 'linear-gradient(135deg, #4b36c4 0%, #674df0 100%)', height: 180, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.07) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.05) 0%, transparent 60%)' }} />
      </div>

      <div className="container" style={{ padding: '0 1.5rem 4rem' }}>
        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', marginTop: '-50px', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 100, height: 100, borderRadius: '24px',
            background: 'linear-gradient(135deg, #674df0, #4b36c4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: '2rem', fontFamily: 'Outfit',
            border: '4px solid #fff', boxShadow: '0 8px 24px rgba(103,77,240,0.35)',
            flexShrink: 0
          }}>
            {initials}
          </div>
          {/* Name + Role */}
          <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 800, color: '#1a2e4a', margin: 0 }}>
                {userProfile?.name || 'User'}
              </h1>
              <span style={{
                background: '#f0edff', color: '#674df0', padding: '0.2rem 0.75rem',
                borderRadius: '99px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'capitalize',
                border: '1.5px solid #d4cbff'
              }}>
                {userProfile?.role || 'user'}
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              Member since {joinDate} · {currentUser?.email}
            </p>
          </div>
          {/* Edit button */}
          <button onClick={() => setActiveTab('Profile')} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff',
            border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0.6rem 1.1rem',
            color: '#674df0', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <Edit3 size={15} /> Edit Profile
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: <Heart size={20} color="#ef4444" />, val: stats.wishlist, label: 'Wishlisted', bg: '#fff1f2' },
            { icon: <MessageSquare size={20} color="#674df0" />, val: stats.enquiries, label: 'Enquiries Sent', bg: '#f0edff' },
            { icon: <Eye size={20} color="#0ea5e9" />, val: stats.viewed, label: 'Recently Viewed', bg: '#f0f9ff' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1a2e4a', fontFamily: 'Outfit', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', background: '#fff', borderRadius: '16px', padding: '0.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '1.5rem', width: 'fit-content' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: '0.65rem 1.5rem', borderRadius: '12px', border: 'none',
              background: activeTab === t ? 'linear-gradient(135deg, #674df0, #4b36c4)' : 'transparent',
              color: activeTab === t ? '#fff' : '#64748b', fontWeight: 700, fontSize: '0.875rem',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: activeTab === t ? '0 4px 12px rgba(103,77,240,0.25)' : 'none'
            }}>{t}</button>
          ))}
        </div>

        {/* Tab: Profile */}
        {activeTab === 'Profile' && (
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', maxWidth: 700 }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#1a2e4a', marginBottom: '1.75rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="#674df0" /> Personal Information
            </h2>
            <form onSubmit={handleProfileSave}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <Field label="Full Name" icon={<User size={15} />}>
                  <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={inputStyle} placeholder="Your name" />
                </Field>
                <Field label="Phone Number" icon={<Phone size={15} />}>
                  <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} style={inputStyle} placeholder="+91 XXXXX XXXXX" />
                </Field>
              </div>
              <Field label="Email Address (read-only)" icon={<Mail size={15} />}>
                <input value={currentUser?.email || ''} readOnly style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} />
              </Field>
              <button type="submit" disabled={savingProfile} style={primaryBtnStyle}>
                {savingProfile ? 'Saving…' : <><Save size={16} /> Save Changes</>}
              </button>
            </form>
          </div>
        )}

        {/* Tab: Security */}
        {activeTab === 'Security' && (
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', maxWidth: 500 }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#1a2e4a', marginBottom: '1.75rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="#674df0" /> Change Password
            </h2>
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Current Password', key: 'current', showKey: 'current', placeholder: 'Your current password' },
                { label: 'New Password', key: 'newPass', showKey: 'new', placeholder: 'Min. 6 characters' },
                { label: 'Confirm New Password', key: 'confirm', showKey: 'confirm', placeholder: 'Re-enter new password' },
              ].map(({ label, key, showKey, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type={showPass[showKey] ? 'text' : 'password'} value={passwords[key]}
                      onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#674df0'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                    <button type="button" onClick={() => setShowPass(p => ({ ...p, [showKey]: !p[showKey] }))} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      {showPass[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={savingPassword} style={primaryBtnStyle}>
                {savingPassword ? 'Changing…' : <><Lock size={16} /> Change Password</>}
              </button>
            </form>
          </div>
        )}

        {/* Tab: Activity */}
        {activeTab === 'Activity' && (
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', maxWidth: 700 }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#1a2e4a', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Account Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: <CheckCircle size={18} color="#10b981" />, label: 'Account Created', value: joinDate, bg: '#f0fdf4' },
                { icon: <Mail size={18} color="#674df0" />, label: 'Email Address', value: currentUser?.email, bg: '#f0edff' },
                { icon: <Building2 size={18} color="#f59e0b" />, label: 'Account Type', value: userProfile?.role?.charAt(0).toUpperCase() + userProfile?.role?.slice(1), bg: '#fefce8' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '14px', background: item.bg }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: '0.95rem', color: '#1a2e4a', fontWeight: 700, margin: '0.15rem 0 0' }}>{item.value}</p>
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
      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>{icon}</span>
      {React.cloneElement(children, { style: { ...inputStyle, ...children.props.style } })}
    </div>
  </div>
);

const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.95rem', color: '#1a2e4a', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };
const primaryBtnStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem',
  background: 'linear-gradient(135deg, #674df0, #4b36c4)', color: '#fff', border: 'none',
  borderRadius: '12px', padding: '0.9rem 2rem', fontWeight: 700, fontSize: '0.95rem',
  cursor: 'pointer', boxShadow: '0 6px 16px rgba(103,77,240,0.3)', transition: 'all 0.2s'
};

export default UserProfile;
