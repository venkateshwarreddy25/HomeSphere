import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Save, ArrowLeft, Wand2, Sparkles, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const EditProperty = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', type: 'rental', price: '', area: '', address: '', city: '', location: '', lat: '', lng: '' });
  const [existingPhotos, setExistingPhotos] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);

  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const snap = await getDoc(doc(db, 'properties', id));
        if (snap.exists()) {
          const data = snap.data();
          if (data.ownerId !== currentUser.uid) { toast.error('Unauthorized'); navigate('/owner/properties'); return; }
          setForm({
            title: data.title || '', description: data.description || '',
            type: data.type || 'rental', price: data.price || '',
            area: data.area || '', address: data.address || '',
            city: data.city || '', location: data.location || '',
            lat: data.lat || '', lng: data.lng || ''
          });
          setExistingPhotos(data.photos || []);
        }
      } catch (err) { toast.error('Failed to load property'); }
      finally { setLoading(false); }
    };
    fetchProperty();
  }, [id, currentUser.uid, navigate]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Groq AI Description Generator
  const generateDescription = async () => {
    if (!form.title.trim() || !form.city.trim() || !form.price) {
      toast.error('Please enter Title, City, and Price first for better AI results!');
      return;
    }
    setAiLoading(true);
    toast.loading('Rewriting description with AI...', { id: 'ai-toast' });

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{
            role: "user",
            content: `Write a beautiful, professional, and convincing real estate description (max 4 short paragraphs) for a "${form.type === 'sell' ? 'house for sale' : 'rental property'}" titled "${form.title}" located in "${form.city}". Price is ${form.price}. Highlight the luxury and convenience.`
          }],
          temperature: 0.7,
          max_tokens: 500,
        })
      });

      if (!response.ok) throw new Error("Failed to fetch Groq API");
      const data = await response.json();
      const generatedText = data.choices[0].message.content.trim();
      
      setForm(prev => ({ ...prev, description: generatedText }));
      toast.success('Description generated!', { id: 'ai-toast' });
    } catch (err) {
      console.error(err);
      toast.error('AI Generation Failed. Please try manually.', { id: 'ai-toast' });
    } finally {
      setAiLoading(false);
    }
  };

  // Pollinations AI Image Generator
  const generateImages = () => {
    if (!form.title.trim() || !form.city.trim()) {
      toast.error('Please enter Property Title and City first!');
      return;
    }
    setGeneratingImages(true);
    
    const prompts = [
      `exterior real estate photography of a ${form.title} in ${form.city}, bright daylight, luxury, highly detailed, architectural digest`,
      `interior design of living room in a ${form.title} in ${form.city}, modern, bright, huge windows, luxury furniture`,
      `beautiful minimalist bedroom interior in a ${form.title} in ${form.city}, cozy, natural light`
    ];

    const generatedUrls = prompts.map((prompt) => 
      `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 10000)}`
    );

    setExistingPhotos(generatedUrls);
    toast.success('3 AI Photos Generated Successfully!');
    setGeneratingImages(false);
  };

  const removeExisting = (idx) => {
    // No longer need to delete from Firebase Storage since these are AI hosted URLs
    setExistingPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price || !form.city.trim()) { toast.error('Title, price and city are required'); return; }
    if (existingPhotos.length === 0) { toast.error('Generate at least 1 photo'); return; }
    setSaving(true);
    
    try {
      await updateDoc(doc(db, 'properties', id), {
        title: form.title.trim(), description: form.description.trim(),
        type: form.type, price: Number(form.price), area: Number(form.area),
        address: form.address.trim(), city: form.city.trim(),
        location: form.location.trim(),
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
        photos: existingPhotos,
        status: 'pending', // Reset to pending after edit
        updatedAt: serverTimestamp()
      });
      toast.success('Property updated! Awaiting re-approval.');
      navigate('/owner/properties');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update property');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner-wrapper" style={{ minHeight: '80vh', paddingTop: '70px' }}><div className="spinner" /></div>;

  return (
    <div style={{ paddingTop: '70px' }}>
      <div className="page-header">
        <div className="container">
          <h1>Edit Property (AI Powered)</h1>
          <p>Update your listing details or use AI to rewrite descriptions and regenerate photos</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '860px' }}>
        <button onClick={() => navigate('/owner/properties')} className="btn btn-outline btn-sm" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={15} /> Back to Properties
        </button>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: '#1a2e4a', marginBottom: '1.5rem' }}>Basic Information</h3>
            <div className="form-group">
              <label className="form-label">Property Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="form-control" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input name="city" value={form.city} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <input name="address" value={form.address} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Location Description</label>
                <input name="location" value={form.location} onChange={handleChange} className="form-control" />
              </div>
            </div>
            
            {/* Description with AI AI */}
            <div className="form-group" style={{ position: 'relative', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Description *</label>
                <button 
                  type="button" 
                  onClick={generateDescription}
                  disabled={aiLoading}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.4rem', 
                    background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
                    border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {aiLoading ? (
                     <div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  ) : <Sparkles size={14} />}
                  Auto-rewrite with Groq AI
                </button>
              </div>
              <textarea name="description" value={form.description} onChange={handleChange} className="form-control" rows={6} />
            </div>
          </div>

          {/* Pricing & Map */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: '#1a2e4a', marginBottom: '1.5rem' }}>Pricing & Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select name="type" value={form.type} onChange={handleChange} className="form-control">
                  <option value="rental">For Rent</option>
                  <option value="sell">For Sale</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input name="price" value={form.price} onChange={handleChange} className="form-control" type="number" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Area (sq.ft)</label>
                <input name="area" value={form.area} onChange={handleChange} className="form-control" type="number" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input name="lat" value={form.lat} onChange={handleChange} className="form-control" type="number" step="any" />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input name="lng" value={form.lng} onChange={handleChange} className="form-control" type="number" step="any" />
              </div>
            </div>
          </div>

          {/* AI Photos */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontWeight: 700, color: '#1a2e4a', marginBottom: '0.25rem' }}>AI Property Photos</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Images are generated over AI and cost 0 bytes of storage.</p>
              </div>
              <button 
                type="button" 
                onClick={generateImages}
                disabled={generatingImages}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  background: 'linear-gradient(135deg, #a855f7, #7e22ce)', color: '#fff',
                  border: 'none', borderRadius: '10px', padding: '0.75rem 1.25rem',
                  fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <Wand2 size={16} />
                Regenerate AI Photos
              </button>
            </div>

            {existingPhotos.length === 0 ? (
              <div style={{ 
                height: 140, background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}>
                <ImageIcon size={40} color="#cbd5e1" />
                <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>No photos available</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {existingPhotos.map((url, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '140px', background: '#f1f5f9' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200'; }} />
                    <button type="button" onClick={() => removeExisting(i)} style={{ position: 'absolute', top: '8px', right: '8px', width: 26, height: 26, borderRadius: '50%', background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={14} />
                    </button>
                    {i === 0 && (
                      <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: '#f5a623', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>Cover View</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
            {saving ? 'Saving…' : <><Save size={17} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
