import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';
import {
  MapPin, Maximize2, Send, MessageSquare, AlertTriangle,
  ArrowLeft, Building2, Calendar, ChevronLeft, ChevronRight,
  CheckCircle, Home, Bath, BedDouble
} from 'lucide-react';
import EMICalculator from '../components/EMICalculator';
import { trackRecentlyViewed } from '../components/RecentlyViewed';
import { PayPalButtons } from '@paypal/react-paypal-js';

const PropertyDetails = () => {
  const { id } = useParams();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [related, setRelated] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [enquiry, setEnquiry] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const ADVANCE_AMOUNT_USD = "100.00"; // Generic test amount for Sandbox

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const ref = doc(db, 'properties', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setProperty(data);
        trackRecentlyViewed(data); // Track for Recently Viewed
        fetchRelated(data.city, data.id);
        fetchFeedback(data.id);
        if (currentUser && userProfile) {
          setEnquiry(prev => ({ ...prev, name: userProfile.name || '', email: currentUser.email || '' }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (city, excludeId) => {
    try {
      const q = query(collection(db, 'properties'), where('city', '==', city), where('status', '==', 'approved'), limit(4));
      const snap = await getDocs(q);
      setRelated(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== excludeId).slice(0, 3));
    } catch {}
  };

  const fetchFeedback = async (propId) => {
    try {
      const q = query(collection(db, 'feedback'), where('propertyId', '==', propId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setFeedback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {}
  };

  const handleEnquiry = async (e) => {
    e.preventDefault();
    if (!currentUser) { toast.error('Please login to send an enquiry'); return; }
    if (!enquiry.message.trim()) { toast.error('Please enter a message'); return; }
    setSending(true);
    try {
      await addDoc(collection(db, 'enquiries'), {
        propertyId: id,
        propertyTitle: property.title,
        userId: currentUser.uid,
        userName: enquiry.name || userProfile?.name,
        userEmail: enquiry.email || currentUser.email,
        message: enquiry.message,
        ownerId: property.ownerId,
        createdAt: serverTimestamp()
      });
      toast.success('Enquiry sent successfully!');
      setEnquiry(prev => ({ ...prev, message: '' }));
    } catch {
      toast.error('Failed to send enquiry');
    } finally {
      setSending(false);
    }
  };

  const handlePayPalApprove = async (details) => {
    try {
      await addDoc(collection(db, 'transactions'), {
        propertyId: id,
        propertyTitle: property.title,
        userId: currentUser.uid,
        userName: userProfile?.name || currentUser.email,
        ownerId: property.ownerId,
        amount: ADVANCE_AMOUNT_USD,
        currency: 'USD',
        transactionId: details.id,
        payerEmail: details.payer.email_address,
        status: 'completed',
        createdAt: serverTimestamp()
      });
      toast.success('Payment successful! Owner has been notified.');
      setShowPaymentModal(false);
    } catch {
      toast.error('Payment recorded with errors. Please contact support.');
    }
  };

  const formatPrice = (p) => {
    if (!p) return '—';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
    return `₹${Number(p).toLocaleString('en-IN')}`;
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', paddingTop: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#674df0', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: '#64748b', fontWeight: 600 }}>Loading property details...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  if (!property) return (
    <div style={{ paddingTop: '70px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Building2 size={64} color="#e2e8f0" />
        <h3 style={{ color: '#1a2e4a', marginTop: '1rem' }}>Property not found</h3>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go Home</Link>
      </div>
    </div>
  );

  const photos = property.photos?.length ? property.photos : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'];

  return (
    <div style={{ paddingTop: '70px', background: '#f8fafc', minHeight: '100vh' }}>

      {/* HERO GALLERY — Full Width */}
      <div style={{ position: 'relative', background: '#000', height: 'min(65vw, 500px)' }}>
        <img
          src={photos[activePhoto]}
          alt={property.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92, transition: 'opacity 0.3s' }}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'; }}
        />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />

        {/* Back btn */}
        <button onClick={() => navigate(-1)} style={{
          position: 'absolute', top: '1.5rem', left: '1.5rem',
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px',
          color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem'
        }}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Type badge */}
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          <span style={{
            background: property.type === 'rental' ? '#0ea5e9' : '#10b981',
            color: '#fff', padding: '0.35rem 0.85rem', borderRadius: '99px',
            fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.03em'
          }}>
            {property.type === 'rental' ? 'For Rent' : 'For Sale'}
          </span>
        </div>

        {/* Nav arrows */}
        {photos.length > 1 && (
          <>
            <button onClick={() => setActivePhoto(i => (i - 1 + photos.length) % photos.length)} style={{
              position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50%',
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer'
            }}><ChevronLeft size={20} /></button>
            <button onClick={() => setActivePhoto(i => (i + 1) % photos.length)} style={{
              position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50%',
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer'
            }}><ChevronRight size={20} /></button>
          </>
        )}

        {/* Photo counter */}
        <div style={{
          position: 'absolute', bottom: '1rem', right: '1rem',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          color: '#fff', padding: '0.3rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600
        }}>{activePhoto + 1} / {photos.length}</div>
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div style={{ background: '#1a2440', padding: '0.75rem 1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {photos.map((ph, i) => (
            <img key={i} src={ph} alt="" onClick={() => setActivePhoto(i)}
              style={{
                width: 64, height: 48, objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', flexShrink: 0,
                border: i === activePhoto ? '2px solid #674df0' : '2px solid transparent',
                opacity: i === activePhoto ? 1 : 0.6, transition: 'all 0.2s'
              }}
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=60'; }}
            />
          ))}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
        <div className="pd-grid">

          {/* ========= LEFT COLUMN ========= */}
          <div>

            {/* Title + Price Card */}
            <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
              <div className="pd-title-row">
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#1a2e4a', lineHeight: 1.25, marginBottom: '0.75rem' }}>
                    {property.title}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                    <MapPin size={16} color="#674df0" style={{ flexShrink: 0 }} />
                    <span>{property.address}, {property.city}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, background: 'linear-gradient(135deg, #674df0, #4b36c4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {formatPrice(property.price)}
                  </div>
                  {property.type === 'rental' && <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>/month</div>}
                </div>
              </div>

              {/* Stats Row */}
              <div className="pd-stats">
                <StatPill icon={<Maximize2 size={16} />} label="Area" value={`${property.area || '—'} sq.ft`} />
                <StatPill icon={<Home size={16} />} label="Type" value={property.type === 'rental' ? 'Rental' : 'Sale'} />
                <StatPill icon={<Calendar size={16} />} label="Listed" value={formatDate(property.createdAt)} />
              </div>
            </div>

            {/* Description */}
            <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', color: '#1a2e4a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 4, height: 20, background: '#674df0', borderRadius: '2px', display: 'inline-block' }} />
                About this Property
              </h2>
              <p style={{ color: '#475569', lineHeight: 1.85, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{property.description}</p>

              {property.location && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MapPin size={18} color="#674df0" />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.15rem' }}>LOCALITY</p>
                    <p style={{ color: '#1a2e4a', fontWeight: 600, fontSize: '0.95rem' }}>{property.location}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Google Map */}
            {property.lat && property.lng && (
              <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
                <div style={{ background: '#fff', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                  <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', color: '#1a2e4a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 4, height: 20, background: '#674df0', borderRadius: '2px', display: 'inline-block' }} />
                    Location on Map
                  </h2>
                </div>
                <iframe
                  title="Property Location"
                  width="100%" height="320"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${property.lat},${property.lng}&z=15&output=embed`}
                />
              </div>
            )}

            {/* Reviews */}
            {feedback.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', color: '#1a2e4a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 4, height: 20, background: '#674df0', borderRadius: '2px', display: 'inline-block' }} />
                  Reviews ({feedback.length})
                </h2>
                {feedback.map(fb => (
                  <div key={fb.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #674df0, #4b36c4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                          {fb.userName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span style={{ fontWeight: 700, color: '#1a2e4a', fontSize: '0.95rem' }}>{fb.userName}</span>
                      </div>
                      <StarRating rating={fb.rating} readOnly size={14} />
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, paddingLeft: '3rem' }}>{fb.message}</p>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', paddingLeft: '3rem' }}>{formatDate(fb.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========= RIGHT SIDEBAR ========= */}
          <div className="pd-sidebar">

            {/* Owner Card */}
            <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#1a2e4a', marginBottom: '1.25rem', fontSize: '1rem' }}>Listed By</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'linear-gradient(135deg, #674df0, #4b36c4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.3rem', flexShrink: 0 }}>
                  {property.ownerName?.[0]?.toUpperCase() || 'O'}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: '#1a2e4a', marginBottom: '0.2rem' }}>{property.ownerName || 'Property Owner'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                    <CheckCircle size={13} /> Verified Owner
                  </div>
                </div>
              </div>
            </div>

            {/* EMI Calculator */}
            <EMICalculator propertyPrice={property.price} type={property.type} />

            {/* Action Buttons */}
            {userProfile?.role === 'user' && (
              <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to={`/user/feedback?propertyId=${id}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.85rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem',
                  background: '#f0edff', color: '#674df0', textDecoration: 'none', border: '1.5px solid #d4cbff',
                  transition: 'all 0.2s'
                }}>
                  <MessageSquare size={16} /> Post Feedback
                </Link>
                <Link to={`/user/complaint?propertyId=${id}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.85rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem',
                  background: '#fff7ed', color: '#c2410c', textDecoration: 'none', border: '1.5px solid #fed7aa',
                  transition: 'all 0.2s'
                }}>
                  <AlertTriangle size={16} /> Post Complaint
                </Link>
                <button onClick={() => setShowPaymentModal(true)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.85rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem',
                  background: 'linear-gradient(135deg, #0070ba, #1546a0)', color: '#fff', border: 'none',
                  cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,112,186,0.3)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/></svg> 
                  Pay Advance / Target Book
                </button>
              </div>
            )}

            {/* Enquiry Form */}
            <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#1a2e4a', marginBottom: '1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={16} color="#674df0" /> Send Enquiry
              </h3>
              {!currentUser ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0edff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Send size={24} color="#674df0" />
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Login to send an enquiry to the owner</p>
                  <Link to="/login" style={{
                    display: 'block', background: 'linear-gradient(135deg, #674df0, #4b36c4)',
                    color: '#fff', padding: '0.9rem', borderRadius: '12px', fontWeight: 700,
                    textDecoration: 'none', textAlign: 'center'
                  }}>Sign In</Link>
                </div>
              ) : (
                <form onSubmit={handleEnquiry} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Name</label>
                    <input className="form-control" value={enquiry.name} onChange={e => setEnquiry(v => ({ ...v, name: e.target.value }))} placeholder="Your name" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                    <input className="form-control" value={enquiry.email} onChange={e => setEnquiry(v => ({ ...v, email: e.target.value }))} placeholder="Your email" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message</label>
                    <textarea className="form-control" rows={4} value={enquiry.message} onChange={e => setEnquiry(v => ({ ...v, message: e.target.value }))} placeholder="I'm interested in this property…" style={{ resize: 'vertical' }} />
                  </div>
                  <button type="submit" disabled={sending} style={{
                    background: sending ? '#94a3b8' : 'linear-gradient(135deg, #674df0, #4b36c4)',
                    color: '#fff', border: 'none', borderRadius: '12px', padding: '1rem',
                    fontWeight: 700, fontSize: '0.95rem', cursor: sending ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(103,77,240,0.3)'
                  }}>
                    <Send size={16} /> {sending ? 'Sending…' : 'Send Enquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Related Properties */}
        {related.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#1a2e4a', marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 4, height: 24, background: '#674df0', borderRadius: '2px', display: 'inline-block' }} />
              Similar Properties in {property.city}
            </h2>
            <div className="properties-grid">
              {related.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .pd-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
          gap: 2rem;
          align-items: start;
        }
        .pd-sidebar {
          position: sticky;
          top: 90px;
        }
        .pd-title-row {
          display: flex;
          gap: 1rem;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .pd-stats {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          padding-top: 1.25rem;
          border-top: 1px solid #f1f5f9;
        }

        @media (max-width: 900px) {
          .pd-grid {
            grid-template-columns: 1fr !important;
          }
          .pd-sidebar {
            position: static !important;
          }
        }

        @media (max-width: 640px) {
          .pd-title-row {
            flex-direction: column;
          }
          .pd-title-row > div:last-child {
            text-align: left !important;
          }
        }
        }
      `}</style>

      {showPaymentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowPaymentModal(false)}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '2rem', animation: 'slideUp 0.3s ease' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 800, color: '#1a2e4a', marginBottom: '0.5rem', textAlign: 'center' }}>Secure Payment</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', marginBottom: '2rem' }}>
              Pay an advance of <strong>${ADVANCE_AMOUNT_USD} USD</strong> to secure this {property.type === 'rental' ? 'rental' : 'property'} from the owner.
            </p>
            <div style={{ minHeight: '150px' }}>
              <PayPalButtons 
                style={{ layout: "vertical", shape: "rect", color: "blue" }} 
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [{ amount: { value: ADVANCE_AMOUNT_USD, currency_code: "USD" } }]
                  });
                }}
                onApprove={async (data, actions) => {
                  const details = await actions.order.capture();
                  handlePayPalApprove(details);
                }}
                onError={() => {
                  toast.error('Payment failed or cancelled.');
                }}
              />
            </div>
            <button onClick={() => setShowPaymentModal(false)} style={{ width: '100%', padding: '0.8rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: 700, marginTop: '1rem', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

const StatPill = ({ icon, label, value }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    background: '#f8fafc', borderRadius: '10px', padding: '0.6rem 1rem',
    border: '1px solid #e2e8f0', flex: '1 1 auto'
  }}>
    <span style={{ color: '#674df0' }}>{icon}</span>
    <div>
      <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.1rem' }}>{label}</p>
      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a2e4a' }}>{value}</p>
    </div>
  </div>
);

export default PropertyDetails;
