import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Upload, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const PostComplaint = () => {
  const { currentUser, userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({
    propertyId: searchParams.get('propertyId') || '',
    address: '', houseNo: '', complaint: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
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

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.propertyId) { toast.error('Please select a property'); return; }
    if (!form.address.trim()) { toast.error('Address is required'); return; }
    if (!form.complaint.trim()) { toast.error('Complaint description is required'); return; }
    setLoading(true);
    try {
      let imageUrl = '';
      if (image) {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(image);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 600;
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.5));
            };
          };
        });
      }
      const selectedProp = properties.find(p => p.id === form.propertyId);
      await addDoc(collection(db, 'complaints'), {
        propertyId: form.propertyId,
        propertyTitle: selectedProp?.title || '',
        ownerId: selectedProp?.ownerId || '',
        userId: currentUser.uid,
        userName: userProfile?.name || '',
        userEmail: currentUser.email,
        address: form.address,
        houseNo: form.houseNo,
        complaint: form.complaint,
        image: imageUrl,
        status: 'Pending',
        createdAt: serverTimestamp()
      });
      toast.success('Complaint submitted successfully!');
      setForm({ propertyId: '', address: '', houseNo: '', complaint: '' });
      setImage(null);
      setPreview('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '70px' }}>
      <div className="page-header">
        <div className="container">
          <h1>Post a Complaint</h1>
          <p>Report an issue with a property</p>
        </div>
      </div>
      <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '720px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={22} color="#f59e0b" />
            </div>
            <div>
              <h2 style={{ fontWeight: 700, color: '#1a2e4a', fontSize: '1.1rem' }}>Complaint Form</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Your complaint will be reviewed by the property owner</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Property *</label>
              <select name="propertyId" value={form.propertyId} onChange={handleChange} className="form-control">
                <option value="">— Select a property —</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title} — {p.city}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Your Address *</label>
                <input name="address" value={form.address} onChange={handleChange} className="form-control" placeholder="Street address" />
              </div>
              <div className="form-group">
                <label className="form-label">House / Flat No.</label>
                <input name="houseNo" value={form.houseNo} onChange={handleChange} className="form-control" placeholder="e.g. A-204" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Name</label>
              <input value={userProfile?.name || ''} className="form-control" readOnly style={{ background: '#f8fafc' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Complaint Description *</label>
              <textarea name="complaint" value={form.complaint} onChange={handleChange} className="form-control" rows={5} placeholder="Describe the issue in detail…" />
            </div>

            <div className="form-group">
              <label className="form-label">Attach Image (optional)</label>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '1.5rem', cursor: 'pointer',
                background: preview ? '#f8fafc' : '#fff', transition: 'all 0.2s'
              }}>
                <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                {preview ? (
                  <img src={preview} alt="Preview" style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'cover' }} />
                ) : (
                  <>
                    <Upload size={28} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Click to upload image (max 5MB)</span>
                  </>
                )}
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Submitting…' : <><Send size={16} /> Submit Complaint</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostComplaint;
