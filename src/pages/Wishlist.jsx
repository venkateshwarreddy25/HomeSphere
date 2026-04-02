import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { Heart } from 'lucide-react';

const Wishlist = () => {
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'wishlist'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const wishlistItems = snap.docs.map(d => ({ wishlistId: d.id, ...d.data() }));

      // Fetch each property
      const props = await Promise.all(
        wishlistItems.map(async (item) => {
          const pRef = doc(db, 'properties', item.propertyId);
          const pSnap = await getDoc(pRef);
          if (pSnap.exists()) return { id: pSnap.id, ...pSnap.data() };
          return null;
        })
      );
      setProperties(props.filter(Boolean));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '70px' }}>
      <div className="page-header">
        <div className="container">
          <h1>My Wishlist</h1>
          <p>Properties you've saved for later</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : properties.length > 0 ? (
          <>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <strong style={{ color: '#1a2e4a' }}>{properties.length}</strong> saved properties
            </p>
            <div className="properties-grid">
              {properties.map(p => (
                <PropertyCard key={p.id} property={p} wishlisted={true} onWishlistToggle={fetchWishlist} />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Heart size={56} />
            <h3>No saved properties</h3>
            <p>Click the heart icon on any property to save it here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
