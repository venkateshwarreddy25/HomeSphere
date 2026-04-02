import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize2, Eye, Clock } from 'lucide-react';

const MAX_RECENT = 6;

export const trackRecentlyViewed = (property) => {
  try {
    const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = stored.filter(p => p.id !== property.id);
    const updated = [{ ...property, viewedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  } catch {}
};

export const getRecentlyViewed = () => {
  try {
    return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  } catch { return []; }
};

const RecentlyViewed = () => {
  const items = getRecentlyViewed();
  if (items.length === 0) return null;

  const fmt = (p) => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)}Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)}L`;
    return `₹${Number(p).toLocaleString('en-IN')}`;
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <section style={{ padding: '4rem 0', background: '#fff' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 700, color: '#1a2e4a', marginBottom: '0.2rem' }}>
              Recently Viewed
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Properties you've looked at</p>
          </div>
          <button
            onClick={() => { localStorage.removeItem('recentlyViewed'); window.location.reload(); }}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
          >
            Clear History
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {items.map((p) => (
            <Link key={p.id} to={`/property/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', gap: '1rem', background: '#f8fafc', borderRadius: '14px',
                padding: '0.85rem', border: '1px solid #e2e8f0', transition: 'all 0.2s',
                alignItems: 'center'
              }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.07)'; e.currentTarget.style.background = '#fff'; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#f8fafc'; }}>
                <img
                  src={p.photos?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=60'}
                  alt={p.title}
                  style={{ width: 72, height: 60, objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=60'; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a2e4a', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                    <MapPin size={11} /> {p.city}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#674df0' }}>{fmt(p.price)}</span>
                    <span style={{ fontSize: '0.7rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={10} /> {timeAgo(p.viewedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
