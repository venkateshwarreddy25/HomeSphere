import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Users, Trash2, Search, Filter, Shield, User as UserIcon, Building2, AlertOctagon, Mail, Phone, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (user) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      setUsers(prev => prev.filter(u => u.uid !== user.uid));
      toast.success('User record deleted successfully');
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setConfirmDelete(null);
    }
  };

  const filtered = users.filter(u => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch = !searchTerm.trim() || 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);
    return matchesRole && matchesSearch;
  });

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case 'admin': return { bg: '#fee2e2', color: '#ef4444', icon: Shield, label: 'Admin' };
      case 'owner': return { bg: '#fef3c7', color: '#f59e0b', icon: Building2, label: 'Owner' };
      default: return { bg: '#e0e7ff', color: '#6366f1', icon: UserIcon, label: 'User' };
    }
  };

  return (
    <div style={{ paddingTop: '70px', background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* Premium Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '3.5rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 68, height: 68, borderRadius: '20px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#8b5cf6' }}>
              <Users size={36} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                User Management
              </h1>
              <p style={{ color: '#94a3b8', margin: '0.4rem 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                <Filter size={16} /> Oversee all registered platform members
              </p>
            </div>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '0.75rem 1.5rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</span>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem', lineHeight: 1 }}>{users.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        
        {/* Controls Bar */}
        <div style={{ background: '#fff', padding: '1.25rem 1.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 400px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search name, email, or phone..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', color: '#1a2e4a', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <div style={{ position: 'relative', minWidth: '160px' }}>
              <select 
                value={filterRole} 
                onChange={e => setFilterRole(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', color: '#1a2e4a', background: '#f8fafc', appearance: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                <option value="all">All Roles</option>
                <option value="user">Tenants / Buyers</option>
                <option value="owner">Property Owners</option>
                <option value="admin">Administrators</option>
              </select>
              <Filter size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
            Showing {filtered.length} users
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Loading user directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '24px', padding: '5rem 2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '24px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Users size={40} />
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, color: '#1a2e4a', marginBottom: '0.5rem' }}>No users found</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
              {searchTerm || filterRole !== 'all' ? 'Try adjusting your search criteria or role filters.' : 'The user directory is currently empty.'}
            </p>
            {(searchTerm || filterRole !== 'all') && (
              <button onClick={() => { setSearchTerm(''); setFilterRole('all'); }} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Clear All Filters</button>
            )}
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '1.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User / Profile</th>
                    <th style={{ padding: '1.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</th>
                    <th style={{ padding: '1.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Role</th>
                    <th style={{ padding: '1.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Join Date</th>
                    <th style={{ padding: '1.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => {
                    const Role = getRoleStyle(u.role);
                    const RIcon = Role.icon;
                    return (
                      <tr key={u.uid} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        
                        <td style={{ padding: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                              {u.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p style={{ margin: '0 0 0.15rem', fontWeight: 800, color: '#1a2e4a', fontSize: '1.05rem' }}>{u.name || 'Unnamed User'}</p>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>ID: {u.uid.substring(0, 10)}...</p>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '1.25rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                              <Mail size={14} color="#94a3b8" /> {u.email}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                              <Phone size={14} color="#94a3b8" /> {u.phone || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Not provided</span>}
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '1.25rem' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: Role.bg, color: Role.color, padding: '0.4rem 0.85rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <RIcon size={14} /> {Role.label}
                          </div>
                        </td>

                        <td style={{ padding: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                            <Calendar size={14} /> {formatDate(u.createdAt)}
                          </div>
                        </td>

                        <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                          {u.role !== 'admin' ? (
                            <button onClick={() => setConfirmDelete(u)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#fee2e2', color: '#ef4444', padding: '0.65rem 1rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fecaca'} onMouseOut={e => e.currentTarget.style.background = '#fee2e2'}>
                              <Trash2 size={16} /> Delete Account
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', fontWeight: 600, paddingRight: '0.5rem' }}>Protected Core</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Premium Confirm Modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setConfirmDelete(null)}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '460px', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '16px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertOctagon size={28} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 800, color: '#1a2e4a', margin: '0 0 0.2rem' }}>
                  Delete User Account?
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>Target: {confirmDelete.name}</p>
              </div>
            </div>
            
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              Are you sure you want to delete the account record for <strong>{confirmDelete.name}</strong>? <br/><br/>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ Warning:</span> This permanently deletes the user's Firestore document. It does NOT automatically delete their Firebase Auth credential or associated properties.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '0.9rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ flex: 1, padding: '0.9rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(239,68,68,0.3)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <Trash2 size={18} /> Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};

export default ManageUsers;
