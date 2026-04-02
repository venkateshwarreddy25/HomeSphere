import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Eye, Building2, AlertOctagon, MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageProperties = () => {
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchProperties(); }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProperties(properties);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredProperties(properties.filter(p => 
        p.title?.toLowerCase().includes(lower) || 
        p.city?.toLowerCase().includes(lower) || 
        p.type?.toLowerCase().includes(lower)
      ));
    }
  }, [searchTerm, properties]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'properties'), where('ownerId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = docs.sort((a, b) => (b.createdAt?.toMillis() || Date.now()) - (a.createdAt?.toMillis() || Date.now()));
      setProperties(sorted);
      setFilteredProperties(sorted);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'properties', id));
      setProperties(prev => prev.filter(p => p.id !== id));
      toast.success('Property deleted successfully');
    } catch (err) {
      toast.error('Failed to delete property');
    } finally {
      setConfirmDelete(null);
    }
  };

  const formatPrice = (p) => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
    return `₹${Number(p).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return { bg: '#dcfce7', text: '#166534' };
      case 'rejected': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#fef3c7', text: '#92400e' };
    }
  };

  return (
    <div style={{ paddingTop: '70px', background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a2e4a 0%, #2b4c7e 100%)', padding: '3rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem' }}>My Listings</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '1.05rem' }}>Manage and track your property portfolio</p>
            </div>
            <Link to="/owner/add-property" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'linear-gradient(135deg, #f5a623, #d4891a)',
              color: '#fff', textDecoration: 'none', padding: '0.85rem 1.75rem', borderRadius: '14px',
              fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 8px 16px rgba(245,166,35,0.3)', transition: 'transform 0.2s'
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <Plus size={18} /> Add New Property
            </Link>
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
              placeholder="Search by title, city, or type..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', color: '#1a2e4a', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#674df0'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
            Showing {filteredProperties.length} properties
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#674df0', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '24px', padding: '5rem 2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '24px', background: '#f0edff', color: '#674df0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Building2 size={40} />
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800, color: '#1a2e4a', marginBottom: '0.5rem' }}>No properties found</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
              {searchTerm ? 'Try adjusting your search filters to find what you are looking for.' : 'You haven\'t added any properties yet. Start your real estate journey today by creating a listing.'}
            </p>
            {!searchTerm && (
              <Link to="/owner/add-property" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#674df0', color: '#fff', padding: '0.85rem 2rem', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
                <Plus size={18} /> Add Your First Property
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredProperties.map(p => {
              const statusColors = getStatusColor(p.status);
              return (
                <div key={p.id} style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}
                     onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  
                  {/* Card Image area */}
                  <div style={{ height: '200px', position: 'relative' }}>
                    <img 
                      src={p.photos?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=70'} 
                      alt={p.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=70'; }}
                    />
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: statusColors.bg, color: statusColors.text, padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {p.status}
                    </div>
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: p.type === 'rental' ? '#f59e0b' : '#3b82f6', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {p.type === 'rental' ? 'Rent' : 'Sale'}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1a2e4a', margin: 0, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.title}
                      </h3>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#674df0', whiteSpace: 'nowrap' }}>
                        {formatPrice(p.price)}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 500 }}>
                      <MapPin size={14} /> {p.city}
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                      <Link to={`/property/${p.id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#f8fafc', color: '#334155', padding: '0.65rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>
                        <Eye size={15} /> View
                      </Link>
                      <Link to={`/owner/edit-property/${p.id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#f0edff', color: '#674df0', padding: '0.65rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e0d4ff'} onMouseOut={e => e.currentTarget.style.background = '#f0edff'}>
                        <Edit2 size={15} /> Edit
                      </Link>
                      <button onClick={() => setConfirmDelete(p)} style={{ width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fee2e2', color: '#ef4444', padding: '0.65rem', borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fecaca'} onMouseOut={e => e.currentTarget.style.background = '#fee2e2'}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modern Delete Confirmation Modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setConfirmDelete(null)}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '420px', borderRadius: '24px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s ease' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, borderRadius: '16px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <AlertOctagon size={28} />
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 800, color: '#1a2e4a', marginBottom: '0.75rem', marginTop: 0 }}>Delete Property?</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              Are you absolutely sure you want to permanently delete <strong>"{confirmDelete.title}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '0.85rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete.id)} style={{ flex: 1, padding: '0.85rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ManageProperties;
