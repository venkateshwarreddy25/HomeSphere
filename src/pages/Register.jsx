import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, Building2, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const FEATURES = [
  'List your property for free',
  'Connect with verified buyers/tenants',
  'Manage properties from dashboard',
  'Get AI-powered listing descriptions',
  'Access premium analytics & insights',
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.';
    if (!form.email) return 'Email is required.';
    if (!form.phone) return 'Phone number is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name.trim(), form.phone, form.role);
      toast.success('Account created! Welcome aboard.');
      navigate(form.role === 'owner' ? '/owner/dashboard' : '/user/dashboard');
    } catch (err) {
      setError(err.message || getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getFirebaseError = (code) => {
    const map = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/weak-password': 'Password is too weak.',
    };
    return map[code] || 'Registration failed. Please try again.';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      
      {/* LEFT — Branding Panel */}
      <div className="login-panel" style={{
        flex: '1 1 45%', background: 'linear-gradient(155deg, #2d1f70 0%, #4b36c4 50%, #674df0 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem 3.5rem', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', position: 'relative' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '14px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Building2 size={26} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color: '#fff' }}>E-Housing</span>
        </div>

        <h2 style={{ fontFamily: 'Outfit', fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', lineHeight: 1.25, position: 'relative' }}>
          Join the Future of<br />Real Estate
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.6, position: 'relative' }}>
          Whether you're looking for your dream home or have a property to list, connect with the right people today.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'relative' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={14} color="#fff" />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>{f}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '3rem', position: 'relative' }}>
          {[
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=70',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&q=70',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=70',
          ].map((src, i) => (
            <img key={i} src={src} alt="property" style={{ flex: 1, height: 80, objectFit: 'cover', borderRadius: '12px', opacity: 0.7 }}
              onError={e => { e.target.style.display = 'none'; }} />
          ))}
        </div>
      </div>

      {/* RIGHT — Form Panel */}
      <div style={{
        flex: '1 1 55%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc', padding: '2rem 1.5rem', overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: '460px', paddingTop: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: '#1a2e4a', marginBottom: '0.5rem' }}>
            Create an account
          </h1>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#674df0', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
          </p>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.5rem', color: '#991b1b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Role Selection */}
            <div>
              <label style={labelStyle}>I want to...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { value: 'user', label: 'Buy / Rent House', icon: '🏠' },
                  { value: 'owner', label: 'List Property', icon: '🏢' }
                ].map(opt => (
                  <label key={opt.value} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.85rem', borderRadius: '12px', cursor: 'pointer',
                    border: `1.5px solid ${form.role === opt.value ? '#674df0' : '#e2e8f0'}`,
                    background: form.role === opt.value ? '#f0edff' : '#fff',
                    color: form.role === opt.value ? '#674df0' : '#64748b',
                    transition: 'all 0.2s', fontSize: '0.9rem', fontWeight: 700
                  }}>
                    <input type="radio" name="role" value={opt.value} checked={form.role === opt.value} onChange={handleChange} style={{ display: 'none' }} />
                    <span style={{ fontSize: '1rem' }}>{opt.icon}</span> {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
              </div>
            </div>

            {/* Passwords */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 chars" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirm</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type={showPass ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handleChange} placeholder="Match password" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #674df0, #4b36c4)',
              color: '#fff', border: 'none', borderRadius: '14px', padding: '1rem',
              fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 20px rgba(103,77,240,0.35)',
              transition: 'all 0.2s', marginTop: '0.5rem'
            }}>
              {loading ? (
                <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Creating account…</>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1.5rem', lineHeight: 1.5 }}>
            By creating an account, you agree to our{' '}
            <a href="#" style={{ color: '#674df0', textDecoration: 'none' }}>Terms of Service</a> &{' '}
            <a href="#" style={{ color: '#674df0', textDecoration: 'none' }}>Privacy Policy</a>.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
};

const handleFocus = e => e.target.style.borderColor = '#674df0';
const handleBlur = e => e.target.style.borderColor = '#e2e8f0';

const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '0.85rem 1rem 0.85rem 2.6rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.9rem', color: '#1a2e4a', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };

export default Register;
