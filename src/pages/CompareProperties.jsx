import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CheckCircle, XCircle, MapPin, Maximize2, Building2, ArrowLeft } from 'lucide-react';

const CompareProperties = () => {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
  const [properties, setProperties] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (ids.length < 2) { setLoading(false); return; }
    const fetchProps = async () => {
      try {
        const q = query(collection(db, 'properties'), where(documentId(), 'in', ids.slice(0, 3)));
        const snap = await getDocs(q);
        setProperties(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProps();
  }, []);

  const fmt = (p) => {
    if (!p) return '—';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
    return `₹${Number(p).toLocaleString('en-IN')}`;
  };

  const rows = [
    { label: 'Price', key: 'price', render: (p) => <span style={{ fontWeight: 900, color: '#674df0', fontSize: '1.1rem' }}>{fmt(p.price)}</span> },
    { label: 'Type', key: 'type', render: (p) => <span style={{ background: p.type === 'rental' ? '#e0f2fe' : '#d1fae5', color: p.type === 'rental' ? '#0369a1' : '#065f46', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>{p.type === 'rental' ? 'For Rent' : 'For Sale'}</span> },
    { label: 'Area', key: 'area', render: (p) => `${p.area || '—'} sq.ft` },
    { label: 'City', key: 'city', render: (p) => p.city || '—' },
    { label: 'Address', key: 'address', render: (p) => p.address || '—' },
    { label: 'Description', key: 'description', render: (p) => <span style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description || '—'}</span> },
  ];

  if (loading) return (
    <div style={{ paddingTop: '70px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#674df0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  if (ids.length < 2) return (
    <div style={{ paddingTop: '70px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', gap: '1rem' }}>
      <Building2 size={64} color="#e2e8f0" />
      <h2 style={{ fontFamily: 'Outfit', color: '#1a2e4a' }}>Select at least 2 properties to compare</h2>
      <Link to="/search" style={{ background: 'linear-gradient(135deg, #674df0, #4b36c4)', color: '#fff', padding: '0.85rem 2rem', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>Browse Properties</Link>
    </div>
  );

  return (
    <div style={{ paddingTop: '70px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4b36c4 0%, #674df0 100%)', padding: '2.5rem 0' }}>
        <div className="container">
          <Link to="/search" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            <ArrowLeft size={16} /> Back to Search
          </Link>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Property Comparison</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: '0.35rem 0 0' }}>Compare {properties.length} properties side by side</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem 5rem', overflowX: 'auto' }}>
        <div style={{ minWidth: 600 }}>
          {/* Property Header Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: `200px repeat(${properties.length}, 1fr)`, gap: '1rem', marginBottom: '1.5rem' }}>
            <div /> {/* empty corner */}
            {properties.map(p => (
              <div key={p.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <img src={p.photos?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=60'} alt={p.title}
                  style={{ width: '100%', height: 150, objectFit: 'cover' }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=60'; }} />
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a2e4a', margin: '0 0 0.25rem' }}>{p.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    <MapPin size={12} /> {p.city}
                  </div>
                  <Link to={`/property/${p.id}`} style={{ display: 'block', background: '#f0edff', color: '#674df0', padding: '0.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>View Details</Link>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Rows */}
          {rows.map((row, ri) => (
            <div key={row.key} style={{
              display: 'grid', gridTemplateColumns: `200px repeat(${properties.length}, 1fr)`,
              gap: '1rem', marginBottom: '0.75rem'
            }}>
              {/* Row Label */}
              <div style={{
                background: '#fff', borderRadius: '12px', padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center',
                fontWeight: 700, color: '#64748b', fontSize: '0.85rem', letterSpacing: '0.02em'
              }}>
                {row.label}
              </div>
              {/* Values */}
              {properties.map(p => (
                <div key={p.id} style={{
                  background: '#fff', borderRadius: '12px', padding: '1rem 1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  color: '#1a2e4a', fontSize: '0.9rem', fontWeight: 600
                }}>
                  {row.render(p)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompareProperties;
