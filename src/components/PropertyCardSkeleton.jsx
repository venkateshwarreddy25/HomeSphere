import React from 'react';

/**
 * PropertyCard Skeleton — shown while properties are loading.
 * Usage: <PropertyCardSkeleton count={6} />
 */
const PropertyCardSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          background: '#fff', borderRadius: '16px', overflow: 'hidden',
          border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
        }}>
          {/* Image shimmer */}
          <div style={{ height: 210, background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
          {/* Body shimmer */}
          <div style={{ padding: '1.25rem' }}>
            <div style={{ height: 18, background: '#f1f5f9', borderRadius: 6, marginBottom: 10, width: '70%', animation: 'shimmer 1.4s infinite' }} />
            <div style={{ height: 13, background: '#f1f5f9', borderRadius: 6, marginBottom: 18, width: '45%', animation: 'shimmer 1.4s infinite' }} />
            <div style={{ height: 1, background: '#f1f5f9', marginBottom: 12 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ height: 22, background: '#f1f5f9', borderRadius: 6, width: '35%', animation: 'shimmer 1.4s infinite' }} />
              <div style={{ height: 22, background: '#f1f5f9', borderRadius: 6, width: '25%', animation: 'shimmer 1.4s infinite' }} />
            </div>
            <div style={{ height: 38, background: '#f1f5f9', borderRadius: 10, marginTop: 14, animation: 'shimmer 1.4s infinite' }} />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </>
  );
};

export default PropertyCardSkeleton;
