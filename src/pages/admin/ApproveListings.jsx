import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, Clock, ShieldCheck, MapPin, Building2, Calendar, User, Search, Fingerprint } from 'lucide-react';
import toast from 'react-hot-toast';

const ApproveListings = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null); // { property, action }
  const [processing, setProcessing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchPending(); }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProperties(properties);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredProperties(properties.filter(p => 
        p.title?.toLowerCase().includes(lower) || 
        p.ownerName?.toLowerCase().includes(lower) || 
        p.city?.toLowerCase().includes(lower)
      ));
    }
  }, [searchTerm, properties]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'properties'), where('status', '==', 'pending'), orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProperties(docs);
      setFilteredProperties(docs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAction = async () => {
    if (!confirmAction) return;
    const { property, action } = confirmAction;
    setProcessing(property.id);
    try {
      await updateDoc(doc(db, 'properties', property.id), { status: action });
      setProperties(prev => prev.filter(p => p.id !== property.id));
      toast.success(`Property ${action === 'approved' ? '✅ Approved' : '❌ Rejected'} successfully`);
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setProcessing(null);
      setConfirmAction(null);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatPrice = (p) => {
    if (!p) return '—';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
    return `₹${Number(p).toLocaleString('en-IN')}`;
  };

  return (
    <div style={{ paddingTop: '70px', background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '3.5rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 68, height: 68, borderRadius: '20px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#10b981' }}>
              <ShieldCheck size={36} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                Approval Queue
              </h1>
              <p style={{ color: '#94a3b8', margin: '0.4rem 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                <Fingerprint size={16} /> Review new listings for quality & compliance
              </p>
            </div>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '0.75rem 1.5rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 10px rgba(245,158,11,0.5)', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{properties.length} Pending</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        
        {/* Controls Bar */}
        <div style={{ background: '#fff', padding: '1.25rem 1.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by title, owner, or city..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', color: '#1a2e4a', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#10b981'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
            Showing {filteredProperties.length} results
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Loading approval queue...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '24px', padding: '5rem 2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '24px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle size={40} />
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, color: '#1a2e4a', marginBottom: '0.5rem' }}>Inbox Zero!</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
              {searchTerm ? 'No pending properties match your search.' : 'You have reviewed all pending property submissions. Great job!'}
            </p>
            {searchTerm && <button onClick={() => setSearchTerm('')} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Clear Search</button>}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {filteredProperties.map(p => (
              <div key={p.id} style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', transition: 'transform 0.2s', padding: '1.5rem', gap: '1.5rem' }}
                   onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                
                {/* Image */}
                <div style={{ width: 200, height: 160, flexShrink: 0, borderRadius: '14px', overflow: 'hidden', position: 'relative', background: '#f1f5f9' }}>
                  <img src={p.photos?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=70'} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=70'; }} />
                  <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: p.type === 'rental' ? '#f59e0b' : '#3b82f6', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {p.type === 'rental' ? 'Rent' : 'Sale'}
                  </div>
                </div>

                {/* Info Block */}
                <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a2e4a', margin: '0 0 0.25rem', lineHeight: 1.3 }}>{p.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                        <MapPin size={14} /> {p.city}
                      </div>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', whiteSpace: 'nowrap' }}>
                      {formatPrice(p.price)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', margin: '1rem 0', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <User size={16} color="#94a3b8" />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a2e4a' }}>{p.ownerName}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Building2 size={16} color="#94a3b8" />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Area</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a2e4a' }}>{p.area ? `${p.area} sq.ft` : '—'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Calendar size={16} color="#94a3b8" />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a2e4a' }}>{formatDate(p.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>
                </div>

                {/* Actions Column */}
                <div style={{ width: 140, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                  <Link to={`/property/${p.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#f8fafc', color: '#475569', padding: '0.75rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', transition: 'all 0.2s', border: '1px solid #e2e8f0' }} onMouseOver={e => e.currentTarget.style.borderColor = '#94a3b8'} onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                    <Eye size={16} /> Preview
                  </Link>
                  <button onClick={() => setConfirmAction({ property: p, action: 'approved' })} disabled={processing === p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#10b981', color: '#fff', padding: '0.75rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: processing === p.id ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }} onMouseOver={e => !processing && (e.currentTarget.style.transform = 'translateY(-1px)')} onMouseOut={e => !processing && (e.currentTarget.style.transform = 'translateY(0)')}>
                    {processing === p.id ? <span className="spinner-small" /> : <><CheckCircle size={16} /> Approve</>}
                  </button>
                  <button onClick={() => setConfirmAction({ property: p, action: 'rejected' })} disabled={processing === p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: processing === p.id ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }} onMouseOver={e => !processing && (e.currentTarget.style.background = '#fecaca')} onMouseOut={e => !processing && (e.currentTarget.style.background = '#fee2e2')}>
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Action Modal */}
      {confirmAction && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setConfirmAction(null)}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '460px', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '16px', background: confirmAction.action === 'approved' ? '#ecfdf5' : '#fee2e2', color: confirmAction.action === 'approved' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {confirmAction.action === 'approved' ? <ShieldCheck size={28} /> : <XCircle size={28} />}
              </div>
              <div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 800, color: '#1a2e4a', margin: '0 0 0.25rem' }}>
                  {confirmAction.action === 'approved' ? 'Approve Listing' : 'Reject Listing'}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>Property: {confirmAction.property.title}</p>
              </div>
            </div>
            
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              Are you sure you want to <strong>{confirmAction.action}</strong> this property submitted by <strong>{confirmAction.property.ownerName}</strong>? <br/><br/>
              {confirmAction.action === 'approved' 
                ? '✅ Once approved, this listing will be immediately available to all website visitors.' 
                : '❌ Once rejected, the owner will be notified and the listing will not be publicly visible.'}
            </p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setConfirmAction(null)} style={{ flex: 1, padding: '0.9rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}>Cancel</button>
              <button onClick={handleAction} style={{ flex: 1, padding: '0.9rem', background: confirmAction.action === 'approved' ? '#10b981' : '#ef4444', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: `0 8px 20px ${confirmAction.action === 'approved' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                {confirmAction.action === 'approved' ? <><CheckCircle size={18} /> Confirm Approval</> : <><XCircle size={18} /> Confirm Rejection</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.1); box-shadow: 0 0 15px rgba(245,158,11,0.8); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .spinner-small { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>
    </div>
  );
};

export default ApproveListings;
