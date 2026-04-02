import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import PropertyCard from '../components/PropertyCard';
import PropertyCardSkeleton from '../components/PropertyCardSkeleton';
import { Search, Home, SlidersHorizontal, X } from 'lucide-react';

const CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Gurgaon', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Area: Largest', value: 'area_desc' },
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || 'all',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    sort: 'newest',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, properties]);

  const fetchAll = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const q = query(collection(db, 'properties'), where('status', '==', 'approved'));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProperties(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let res = [...properties];
    if (filters.city.trim()) {
      const c = filters.city.trim().toLowerCase();
      res = res.filter(p => p.city?.toLowerCase().includes(c) || p.address?.toLowerCase().includes(c));
    }
    if (filters.type !== 'all') res = res.filter(p => p.type === filters.type);
    if (filters.minPrice) res = res.filter(p => Number(p.price) >= Number(filters.minPrice));
    if (filters.maxPrice) res = res.filter(p => Number(p.price) <= Number(filters.maxPrice));
    if (filters.minArea) res = res.filter(p => Number(p.area) >= Number(filters.minArea));

    switch (filters.sort) {
      case 'price_asc': res.sort((a, b) => a.price - b.price); break;
      case 'price_desc': res.sort((a, b) => b.price - a.price); break;
      case 'area_desc': res.sort((a, b) => b.area - a.area); break;
      default: res.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    }
    setFiltered(res);
  };

  const clearFilters = () => setFilters({ city: '', type: 'all', minPrice: '', maxPrice: '', minArea: '', sort: 'newest' });

  const activeFilterCount = [filters.city, filters.type !== 'all' && filters.type, filters.minPrice, filters.maxPrice, filters.minArea].filter(Boolean).length;

  return (
    <div style={{ paddingTop: '70px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ background: 'linear-gradient(135deg, #4b36c4 0%, #674df0 100%)', padding: '3rem 0 2rem' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            Search Properties
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem' }}>
            {searched ? `${filtered.length} properties found` : 'Find your perfect home'}
          </p>

          {/* Quick Search Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '12px', padding: '0 1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Search size={18} color="#94a3b8" style={{ marginRight: '0.75rem', flexShrink: 0 }} />
              <input
                value={filters.city}
                onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
                placeholder="Search city, locality, landmark..."
                style={{ flex: 1, border: 'none', outline: 'none', padding: '1rem 0', fontSize: '0.95rem', color: '#1a2e4a', background: 'transparent' }}
              />
              {filters.city && (
                <button onClick={() => setFilters(f => ({ ...f, city: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem' }}>
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: showFilters ? '#fff' : 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', padding: '0 1.25rem',
                color: showFilters ? '#674df0' : '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem'
              }}
            >
              <SlidersHorizontal size={16} />
              Filters {activeFilterCount > 0 && <span style={{ background: '#f59e0b', color: '#fff', borderRadius: '99px', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>{activeFilterCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div className="container" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
              {/* Type */}
              <div>
                <label style={labelStyle}>Property Type</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[['all', 'All'], ['sell', 'Buy'], ['rental', 'Rent']].map(([val, lbl]) => (
                    <button key={val} onClick={() => setFilters(f => ({ ...f, type: val }))}
                      style={{
                        flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1.5px solid',
                        borderColor: filters.type === val ? '#674df0' : '#e2e8f0',
                        background: filters.type === val ? '#f0edff' : '#fff',
                        color: filters.type === val ? '#674df0' : '#64748b',
                        fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                      }}>{lbl}</button>
                  ))}
                </div>
              </div>
              {/* Min Price */}
              <div>
                <label style={labelStyle}>Min Price (₹)</label>
                <input className="form-control" type="number" placeholder="e.g. 1000000"
                  value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
              </div>
              {/* Max Price */}
              <div>
                <label style={labelStyle}>Max Price (₹)</label>
                <input className="form-control" type="number" placeholder="e.g. 50000000"
                  value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
              </div>
              {/* Min Area */}
              <div>
                <label style={labelStyle}>Min Area (sq.ft)</label>
                <input className="form-control" type="number" placeholder="e.g. 1000"
                  value={filters.minArea} onChange={e => setFilters(f => ({ ...f, minArea: e.target.value }))} />
              </div>
              {/* Clear */}
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={clearFilters} style={{
                  width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                  background: '#fff', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
                }}>Clear All</button>
              </div>
            </div>

            {/* City Quick Select */}
            <div style={{ marginTop: '1rem' }}>
              <label style={labelStyle}>Quick City Select</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {CITIES.map(c => (
                  <button key={c} onClick={() => setFilters(f => ({ ...f, city: f.city === c ? '' : c }))}
                    style={{
                      padding: '0.4rem 0.9rem', borderRadius: '99px', border: '1.5px solid',
                      borderColor: filters.city === c ? '#674df0' : '#e2e8f0',
                      background: filters.city === c ? '#674df0' : '#fff',
                      color: filters.city === c ? '#fff' : '#64748b',
                      fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s'
                    }}>{c}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
        {/* Sort + Count Bar */}
        {!loading && searched && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              <strong style={{ color: '#1a2e4a', fontSize: '1.1rem' }}>{filtered.length}</strong> properties found
              {filters.city && <span> in <strong style={{ color: '#674df0' }}>{filters.city}</strong></span>}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Sort:</span>
              <select
                value={filters.sort}
                onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#1a2e4a', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="properties-grid" style={{ paddingTop: '1rem' }}>
            <PropertyCardSkeleton count={6} />
          </div>
        ) : filtered.length > 0 ? (
          <div className="properties-grid">
            {filtered.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : searched ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: '20px', background: '#f0edff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Search size={36} color="#674df0" />
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#1a2e4a', marginBottom: '0.5rem' }}>No properties found</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Try a different city, adjust your price range, or clear the filters</p>
            <button onClick={clearFilters} style={{ background: 'linear-gradient(135deg, #674df0, #4b36c4)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.85rem 2rem', fontWeight: 700, cursor: 'pointer' }}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <Home size={56} color="#e2e8f0" />
            <h3 style={{ fontFamily: 'Outfit', color: '#1a2e4a', marginTop: '1rem' }}>Start searching</h3>
            <p style={{ color: '#64748b' }}>Use the search bar above</p>
          </div>
        )}
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' };

export default SearchResults;
