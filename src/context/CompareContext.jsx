import React, { createContext, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, GitCompare, ArrowRight } from 'lucide-react';

// ─── Context ────────────────────────────────────────────────────────────────
const CompareContext = createContext(null);
export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = (property) => {
    if (compareList.length >= 3) {
      return false; // max 3
    }
    if (compareList.find(p => p.id === property.id)) return false;
    setCompareList(prev => [...prev, property]);
    return true;
  };

  const removeFromCompare = (id) => {
    setCompareList(prev => prev.filter(p => p.id !== id));
  };

  const clearCompare = () => setCompareList([]);

  const isInCompare = (id) => compareList.some(p => p.id === id);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
      <CompareBar />
    </CompareContext.Provider>
  );
};

// ─── Floating Compare Bar ────────────────────────────────────────────────────
const CompareBar = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) return null;

  const formatPrice = (p) => {
    if (!p) return '—';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)}Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)}L`;
    return `₹${p}`;
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(15, 10, 40, 0.97)', backdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(167,139,250,0.25)',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
      padding: '0.85rem 1.5rem',
      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      animation: 'slideUp 0.3s ease'
    }}>
      {/* Icon + Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #674df0, #4b36c4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GitCompare size={18} color="#fff" />
        </div>
        <div>
          <p style={{ color: '#a78bfa', fontSize: '0.7rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Compare
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', margin: 0 }}>
            {compareList.length}/3 selected
          </p>
        </div>
      </div>

      <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

      {/* Selected Properties */}
      <div style={{ display: 'flex', gap: '0.75rem', flex: 1, flexWrap: 'wrap' }}>
        {compareList.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)',
            borderRadius: '10px', padding: '0.4rem 0.4rem 0.4rem 0.75rem'
          }}>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', margin: 0, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</p>
              <p style={{ color: '#a78bfa', fontSize: '0.72rem', margin: 0, fontWeight: 700 }}>{formatPrice(p.price)}</p>
            </div>
            <button onClick={() => removeFromCompare(p.id)} style={{
              background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '6px',
              width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#ef4444', flexShrink: 0
            }}>
              <X size={13} />
            </button>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: 3 - compareList.length }).map((_, i) => (
          <div key={i} style={{
            width: 160, height: 40, borderRadius: '10px',
            border: '2px dashed rgba(167,139,250,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem'
          }}>
            + Add property
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: 'auto' }}>
        <button onClick={clearCompare} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '10px', padding: '0.6rem 1rem', color: 'rgba(255,255,255,0.6)',
          fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
        }}>Clear</button>
        <Link to={`/compare?ids=${compareList.map(p => p.id).join(',')}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'linear-gradient(135deg, #674df0, #4b36c4)',
          color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '10px',
          fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(103,77,240,0.4)'
        }}>
          Compare Now <ArrowRight size={14} />
        </Link>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CompareProvider;
