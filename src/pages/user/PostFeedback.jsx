import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import StarRating from '../../components/StarRating';
import { MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const PostFeedback = () => {
  const { currentUser, userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({
    propertyId: searchParams.get('propertyId') || '',
    message: '',
    rating: 0
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const q = query(collection(db, 'properties'), where('status', '==', 'approved'));
        const snap = await getDocs(q);
        setProperties(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
      finally { setFetching(false); }
    };
    fetchProperties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.propertyId) { toast.error('Please select a property'); return; }
    if (form.rating === 0) { toast.error('Please select a star rating'); return; }
    if (!form.message.trim()) { toast.error('Please enter your feedback'); return; }
    setLoading(true);
    try {
      const selectedProp = properties.find(p => p.id === form.propertyId);
      await addDoc(collection(db, 'feedback'), {
        propertyId: form.propertyId,
        propertyTitle: selectedProp?.title || '',
        ownerId: selectedProp?.ownerId || '',
        userId: currentUser.uid,
        userName: userProfile?.name || '',
        message: form.message,
        rating: form.rating,
        createdAt: serverTimestamp()
      });
      toast.success('Feedback submitted! Thank you.');
      setForm({ propertyId: '', message: '', rating: 0 });
    } catch (err) {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '70px' }}>
      <div className="page-header">
        <div className="container">
          <h1>Post Feedback</h1>
          <p>Share your experience with a property</p>
        </div>
      </div>
      <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '680px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={22} color="#10b981" />
            </div>
            <div>
              <h2 style={{ fontWeight: 700, color: '#1a2e4a', fontSize: '1.1rem' }}>Feedback Form</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Help others by sharing your honest experience</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Property *</label>
              <select name="propertyId" value={form.propertyId} onChange={e => setForm(p => ({ ...p, propertyId: e.target.value }))} className="form-control">
                <option value="">— Select a property —</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title} — {p.city}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Your Rating *</label>
              <div style={{ padding: '0.5rem 0' }}>
                <StarRating rating={form.rating} onRate={r => setForm(p => ({ ...p, rating: r }))} size={32} />
                {form.rating > 0 && (
                  <p style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]} ({form.rating}/5)
                  </p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Feedback *</label>
              <textarea
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                className="form-control"
                rows={5}
                placeholder="Share your experience with this property — the neighbourhood, amenities, owner responsiveness…"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Submitting…' : <><Send size={16} /> Submit Feedback</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostFeedback;
