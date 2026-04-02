import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Wand2, Image as ImageIcon, Sparkles, Send, MapPin, Building, Home, Move, FileText, CheckCircle, List, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const AddProperty = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', description: '', type: 'rental', price: '',
    area: '', address: '', city: '', location: '', lat: '', lng: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);

  // Environment variable for Groq API
  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // AI Description Generator
  const generateDescription = async () => {
    if (!form.title.trim() || !form.city.trim() || !form.price) {
      toast.error('Title, City, and Price required for AI magic! ✨');
      return;
    }
    setAiLoading(true);
    toast.loading('Crafting premium copy...', { id: 'ai' });

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{
            role: "user",
            content: `Write a luxurious, convincing real estate description (3 short paragraphs) for a ${form.type === 'sell' ? 'house for sale' : 'rental property'} titled "${form.title}" in "${form.city}". Price: ${form.price}. Highlight premium features and location advantage.`
          }],
          temperature: 0.7, max_tokens: 300,
        })
      });

      if (!response.ok) throw new Error("API failed");
      const data = await response.json();
      setForm(prev => ({ ...prev, description: data.choices[0].message.content.trim() }));
      toast.success('Description generated!', { id: 'ai' });
    } catch (err) {
      toast.error('AI Generation Failed.', { id: 'ai' });
    } finally {
      setAiLoading(false);
    }
  };

  // AI Image Generator
  const generateImages = () => {
    if (!form.title.trim() || !form.city.trim()) {
      toast.error('Title and City required for images!');
      return;
    }
    setGeneratingImages(true);
    
    const prompts = [
      `Luxury exterior photography of a ${form.title} in ${form.city}, bright daylight, architectural digest, hyperrealistic`,
      `Modern bright interior living room of ${form.title} in ${form.city}, huge windows, luxury lighting`,
      `Beautiful cozy bedroom naturally lit in ${form.title} in ${form.city}, minimalist design`
    ];

    const urls = prompts.map(p => `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random()*10000)}`);
    setImages(urls);
    toast.success('Stunning photos generated! 📸');
    setGeneratingImages(false);
  };

  const validate = () => {
    if (!form.title.trim() || !form.city.trim() || !form.price || !form.area) return 'Please fill all required fields marked with *';
    if (images.length === 0) return 'Generate at least 1 property photo';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'properties'), {
        ...form,
        price: Number(form.price),
        area: Number(form.area),
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
        photos: images,
        ownerId: currentUser.uid,
        ownerName: userProfile?.name || '',
        ownerEmail: currentUser.email,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast.success('Property submitted! Awaiting approval.');
      navigate('/owner/properties');
    } catch (err) {
      toast.error('Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
      {[
        { num: 1, label: 'Basic Info', icon: Home },
        { num: 2, label: 'Details', icon: FileText },
        { num: 3, label: 'Media', icon: ImageIcon }
      ].map((s, i) => (
        <React.Fragment key={s.num}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: step >= s.num ? 1 : 0.5, transition: 'opacity 0.3s' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step >= s.num ? 'linear-gradient(135deg, #674df0, #4b36c4)' : '#e2e8f0',
              color: step >= s.num ? '#fff' : '#64748b', fontWeight: 800, transition: 'all 0.3s',
              boxShadow: step === s.num ? '0 0 0 4px rgba(103,77,240,0.2)' : 'none'
            }}>
              {step > s.num ? <CheckCircle size={20} /> : <s.icon size={20} />}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: step >= s.num ? '#1a2e4a' : '#94a3b8' }}>{s.label}</span>
          </div>
          {i < 2 && <div style={{ flex: 1, height: 2, background: step > s.num ? '#674df0' : '#e2e8f0', margin: '0 1rem -1.5rem', transition: 'background 0.3s' }} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div style={{ paddingTop: '70px', background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* Premium Hero */}
      <div style={{ background: 'linear-gradient(135deg, #2d1f70 0%, #4b36c4 50%, #674df0 100%)', padding: '4rem 0 6rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)' }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem' }}>List Your Property</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>Leverage our AI tools to create a compelling listing that attracts high-quality leads.</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.5)', maxWidth: '800px', margin: '0 auto' }}>
          
          <StepIndicator />

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <Field label="Property Title *" icon={<Building size={16} />}>
                    <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Luxury 3BHK Apartment" style={inputStyle} />
                  </Field>
                  <Field label="City *" icon={<MapPin size={16} />}>
                     <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Mumbai" style={inputStyle} />
                  </Field>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <Field label="Price (₹) *" icon={<span style={{ fontWeight: 800, color: '#94a3b8' }}>₹</span>}>
                    <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="e.g. 25000" style={inputStyle} />
                  </Field>
                  <Field label="Area (sq.ft) *" icon={<Move size={16} />}>
                     <input type="number" name="area" value={form.area} onChange={handleChange} placeholder="e.g. 1200" style={inputStyle} />
                  </Field>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={labelStyle}>Listing Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[{v: 'rental', l: 'For Rent'}, {v: 'sell', l: 'For Sale'}].map(t => (
                      <label key={t.v} style={{
                        padding: '1rem', border: `2px solid ${form.type === t.v ? '#674df0' : '#e2e8f0'}`, borderRadius: '12px',
                        background: form.type === t.v ? '#f0edff' : '#fff', color: form.type === t.v ? '#674df0' : '#475569',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                      }}>
                        <input type="radio" name="type" value={t.v} checked={form.type === t.v} onChange={handleChange} style={{ display: 'none' }} />
                        {t.v === 'rental' ? <Home size={18} /> : <Building size={18} />} {t.l}
                      </label>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={() => {
                  if(!form.title || !form.city || !form.price || !form.area) toast.error('Fill required fields marked with *');
                  else setStep(2);
                }} style={btnPrimary}>Continue <ArrowRight size={16} /></button>
              </div>
            )}

            {step === 2 && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                     <label style={{ ...labelStyle, margin: 0 }}>Description *</label>
                     <button type="button" onClick={generateDescription} disabled={aiLoading} style={{
                       display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                       color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: aiLoading ? 'not-allowed' : 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(168,85,247,0.3)'
                     }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                       {aiLoading ? <span className="spinner-small" /> : <Wand2 size={13} />} AI Generate
                     </button>
                   </div>
                   <textarea name="description" value={form.description} onChange={handleChange} rows="5" placeholder="Detailed property description..." style={{ ...inputStyle, padding: '1rem', height: 'auto' }} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <Field label="Full Address *" icon={<MapPin size={16} />}>
                    <input name="address" value={form.address} onChange={handleChange} placeholder="Street, landmark, pincode" style={inputStyle} />
                  </Field>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setStep(1)} style={btnSecondary}>Back</button>
                  <button type="button" onClick={() => {
                     if(!form.description || !form.address) toast.error('Fill required description and address');
                     else setStep(3);
                  }} style={{ ...btnPrimary, flex: 1 }}>Continue <ArrowRight size={16} /></button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0edff', color: '#674df0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Sparkles size={30} />
                  </div>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800, color: '#1a2e4a', marginBottom: '0.5rem' }}>AI Property Staging</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                    We automatically generate high-quality exterior and interior staging photos for your listing based on your property details. 100% Free.
                  </p>
                  <button type="button" onClick={generateImages} disabled={generatingImages} style={{ ...btnPrimary, margin: '0 auto' }}>
                    {generatingImages ? 'Generating 3 Images...' : <><ImageIcon size={18} /> Generate stunning photos</>}
                  </button>
                </div>

                {images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {images.map((src, i) => (
                      <div key={i} style={{ position: 'relative', height: 120, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <img src={src} alt={`Property ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, backdropFilter: 'blur(4px)' }}>AI Generated</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setStep(2)} style={btnSecondary}>Back</button>
                  <button type="submit" disabled={loading} style={{ ...btnPrimary, flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
                    {loading ? 'Submitting...' : <><Send size={18} /> Publish Listing</>}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .spinner-small { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>
    </div>
  );
};

const Field = ({ label, icon, children }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>{icon}</span>
      {React.cloneElement(children, { style: { ...inputStyle, ...children.props.style } })}
    </div>
  </div>
);

const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '0.9rem 1rem 0.9rem 2.5rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#1a2e4a', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };

const btnPrimary = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #674df0, #4b36c4)', color: '#fff', border: 'none', borderRadius: '14px', padding: '1rem 2rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(103,77,240,0.35)', width: '100%', transition: 'all 0.2s' };
const btnSecondary = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '14px', padding: '1rem 2rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' };

// Dummy ArrowRight import if missing:
const ArrowRight = ({ size=16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;

export default AddProperty;
