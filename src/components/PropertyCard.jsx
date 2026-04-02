import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize2, Heart, Eye, CheckCircle, GitCompare } from 'lucide-react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import toast from 'react-hot-toast';

const PropertyCard = ({ property, showStatus = false, wishlisted = false, onWishlistToggle }) => {
  const { currentUser, userProfile } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare() || {};
  const [inWishlist, setInWishlist] = useState(wishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const { id, title, city, type, price, area, photos, status, ownerName } = property;
  const mainPhoto = photos?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80';

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser || userProfile?.role !== 'user') {
      toast.error('Please login as a user to save to wishlist');
      return;
    }
    setWishlistLoading(true);
    try {
      const wishlistId = `${currentUser.uid}_${id}`;
      const wishlistRef = doc(db, 'wishlist', wishlistId);
      if (inWishlist) {
        await deleteDoc(wishlistRef);
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await setDoc(wishlistRef, { userId: currentUser.uid, propertyId: id, createdAt: serverTimestamp() });
        setInWishlist(true);
        toast.success('Added to wishlist!');
      }
      onWishlistToggle?.();
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const formatPrice = (p) => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
    if (p >= 1000) return `₹${(p / 1000).toFixed(0)}K`;
    return `₹${p}`;
  };

  // Rough EMI estimate : 8.5% for 20 years
  const emiEstimate = (() => {
    if (type === 'rental' || !price) return null;
    const r = 8.5 / 12 / 100;
    const n = 240;
    const emi = (price * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return formatPrice(Math.round(emi));
  })();

  return (
    <div className="property-card-wrap" style={{ position: 'relative' }}>
      <div style={{
        background: '#fff', borderRadius: '18px', overflow: 'hidden',
        border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.25s', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column'
      }}
        onMouseOver={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(103,77,240,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
        onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: '210px', overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={mainPhoto}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80'; }}
          />
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 60%)' }} />

          {/* Type Badge */}
          <span style={{
            position: 'absolute', top: '12px', left: '12px',
            background: type === 'rental' ? 'rgba(14,165,233,0.9)' : 'rgba(16,185,129,0.9)',
            backdropFilter: 'blur(8px)', color: '#fff',
            padding: '0.3rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700
          }}>
            {type === 'rental' ? 'For Rent' : 'For Sale'}
          </span>

          {/* Status Badge for owner */}
          {showStatus && (
            <span style={{
              position: 'absolute', top: '12px', right: '52px',
              background: status === 'approved' ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)',
              backdropFilter: 'blur(8px)', color: '#fff',
              padding: '0.3rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700
            }}>
              {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
          )}

          {/* Wishlist Heart */}
          {userProfile?.role === 'user' && (
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              style={{
                position: 'absolute', top: '10px', right: '10px',
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                border: '1.5px solid rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Heart
                size={16}
                fill={inWishlist ? '#ef4444' : 'none'}
                color={inWishlist ? '#ef4444' : '#94a3b8'}
                strokeWidth={2}
              />
            </button>
          )}

          {/* EMI chip on image bottom */}
          {emiEstimate && (
            <div style={{
              position: 'absolute', bottom: '10px', left: '10px',
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              color: '#fff', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700
            }}>
              EMI ~{emiEstimate}/mo
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontSize: '1rem', fontWeight: 700, color: '#1a2e4a',
            marginBottom: '0.4rem', lineHeight: 1.3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>{title}</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <MapPin size={13} color="#674df0" />
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{city}</span>
            {ownerName && (
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle size={11} color="#10b981" /> Verified
              </span>
            )}
          </div>

          <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 0.85rem' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
            <div>
              <span style={{
                fontSize: '1.25rem', fontWeight: 900,
                background: 'linear-gradient(135deg, #674df0, #4b36c4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                {formatPrice(price)}
              </span>
              {type === 'rental' && (
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 600 }}>/month</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
              <Maximize2 size={12} color="#94a3b8" />
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{area} sq.ft</span>
            </div>
          </div>

          <Link
            to={`/property/${id}`}
            style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem',
              marginTop: '1rem', padding: '0.75rem',
              background: 'linear-gradient(135deg, #674df0, #4b36c4)',
              color: '#fff', borderRadius: '12px', fontWeight: 700, fontSize: '0.875rem',
              textDecoration: 'none', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(103,77,240,0.2)'
            }}
            onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 18px rgba(103,77,240,0.35)'}
            onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(103,77,240,0.2)'}
          >
            <Eye size={15} /> View Details
          </Link>
          {/* Compare button */}
          {addToCompare && (
            <button
              onClick={(e) => {
                e.preventDefault();
                const inList = isInCompare?.(id);
                if (inList) {
                  removeFromCompare?.(id);
                  toast('Removed from comparison', { icon: '❌' });
                } else {
                  const added = addToCompare({ id, title, city, type, price, area, photos });
                  if (added) toast('Added to compare! Select up to 3.', { icon: '🔄' });
                  else toast.error('You can compare up to 3 properties');
                }
              }}
              style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem',
                marginTop: '0.5rem', padding: '0.6rem', width: '100%',
                background: isInCompare?.(id) ? '#f0edff' : 'transparent',
                color: isInCompare?.(id) ? '#674df0' : '#94a3b8',
                border: `1.5px solid ${isInCompare?.(id) ? '#a78bfa' : '#e2e8f0'}`,
                borderRadius: '12px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <GitCompare size={14} /> {isInCompare?.(id) ? 'In Comparison ✓' : 'Compare'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
