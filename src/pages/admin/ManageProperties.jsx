import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, Trash2, Building2, Search, Filter, AlertOctagon, MapPin, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminManageProperties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchProperties(); }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'properties'), orderBy('createdAt', 'desc')));
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProperties(docs);
      setFilteredProperties(docs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredProperties(properties.filter(p => {
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchSearch = !searchTerm.trim() || 
        p.title?.toLowerCase().includes(lower) || 
        p.ownerName?.toLowerCase().includes(lower) || 
        p.city?.toLowerCase().includes(lower);
      return matchStatus && matchSearch;
    }));
  }, [searchTerm, filterStatus, properties]);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'properties', id), { status });
      setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      toast.success(`Property marked as ${status}`);
    } catch { toast.error('Status update failed'); }
  };

  const handleDelete = async (property) => {
    try {
      await deleteDoc(doc(db, 'properties', property.id));
      setProperties(prev => prev.filter(p => p.id !== property.id));
      toast.success('Property permanently deleted');
    } catch { toast.error('Failed to delete property'); }
    finally { setConfirmDelete(null); }
  };

  const formatPrice = (p) => {
    if (!p) return '—';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
    return `₹${Number(p).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return { bg: '#dcfce7', text: '#166534', icon: CheckCircle };
      case 'rejected': return { bg: '#fee2e2', text: '#991b1b', icon: XCircle };
      default: return { bg: '#fef3c7', text: '#92400e', icon: Clock };
    }
  };

  // Generic fallback if missing clock icon
  const Clock = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

  return (
    <div style={{ paddingTop: '70px', background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* Premium Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '3.5rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 68, height: 68, borderRadius: '20px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#60a5fa' }}>
              <HardDrive size={36} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                Property Database
              </h1>
              <p style={{ color: '#94a3b8', margin: '0.4rem 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                <Building2 size={16} /> Complete ledger of all platform real estate
              </p>
            </div>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '0.75rem 1.5rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Volume</span>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem', lineHeight: 1 }}>{properties.length} Listings</span>
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
                placeholder="Search by title, owner, or city..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', color: '#1a2e4a', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <div style={{ position: 'relative', minWidth: '160px' }}>
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', color: '#1a2e4a', background: '#f8fafc', appearance: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved / Live</option>
                <option value="rejected">Rejected</option>
              </select>
              <Filter size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
            Showing {filteredProperties.length} results
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Loading database...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '24px', padding: '5rem 2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '24px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Building2 size={40} />
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, color: '#1a2e4a', marginBottom: '0.5rem' }}>No listings found</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
              {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search criteria or status filters.' : 'The property database is completely empty.'}
            </p>
            {(searchTerm || filterStatus !== 'all') && (
              <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Clear All Filters</button>
            )}
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '1.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Property / Listing</th>
                    <th style={{ padding: '1.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location & Price</th>
                    <th style={{ padding: '1.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner</th>
                    <th style={{ padding: '1.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Status</th>
                    <th style={{ padding: '1.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Management Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map(p => {
                    const Status = getStatusColor(p.status);
                    const SIcon = Status.icon;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        
                        <td style={{ padding: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 64, height: 48, borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#e2e8f0' }}>
                              <img src={p.photos?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=60'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=60'} />
                            </div>
                            <div>
                              <Link to={`/property/${p.id}`} style={{ fontWeight: 800, color: '#1a2e4a', fontSize: '1rem', textDecoration: 'none', display: 'block', marginBottom: '0.2rem' }}>{p.title}</Link>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p.type === 'rental' ? '#f59e0b' : '#3b82f6', textTransform: 'uppercase', background: p.type === 'rental' ? '#fef3c7' : '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                For {p.type === 'rental' ? 'Rent' : 'Sale'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '1.25rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a2e4a', fontSize: '1.05rem', fontWeight: 800 }}>
                              {formatPrice(p.price)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
                              <MapPin size={14} color="#94a3b8" /> {p.city}
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '1.25rem' }}>
                          <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.95rem' }}>{p.ownerName}</span>
                        </td>

                        <td style={{ padding: '1.25rem' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: Status.bg, color: Status.text, padding: '0.4rem 0.85rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <SIcon size={14} /> {p.status}
                          </div>
                        </td>

                        <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <Link to={`/property/${p.id}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: '#f8fafc', color: '#475569', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' }} onMouseOver={e => e.currentTarget.style.borderColor = '#94a3b8'} onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                              <Eye size={16} />
                            </Link>

                            {p.status !== 'approved' && (
                              <button onClick={() => updateStatus(p.id, 'approved')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: '#ecfdf5', color: '#10b981', borderRadius: '10px', border: '1px solid #a7f3d0', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#d1fae5'} onMouseOut={e => e.currentTarget.style.background = '#ecfdf5'} title="Approve">
                                <CheckCircle size={16} />
                              </button>
                            )}

                            {p.status !== 'rejected' && (
                              <button onClick={() => updateStatus(p.id, 'rejected')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: '#fffbeb', color: '#f59e0b', borderRadius: '10px', border: '1px solid #fde68a', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fef3c7'} onMouseOut={e => e.currentTarget.style.background = '#fffbeb'} title="Reject">
                                <XCircle size={16} />
                              </button>
                            )}

                            <button onClick={() => setConfirmDelete(p)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: '#fee2e2', color: '#ef4444', borderRadius: '10px', border: '1px solid #fecaca', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fca5a5'} onMouseOut={e => e.currentTarget.style.background = '#fee2e2'} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
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
                  Destroy Record?
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>Target: {confirmDelete.title}</p>
              </div>
            </div>
            
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              Are you sure you want to delete the listing <strong>{confirmDelete.title}</strong>? <br/><br/>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ Warning:</span> This permanently deletes the property from Firestore. This action bypasses the standard rejection workflow.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '0.9rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ flex: 1, padding: '0.9rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(239,68,68,0.3)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <Trash2 size={18} /> Delete Listing
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

export default AdminManageProperties;
