import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Building2, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FEATURES = [
  'Browse 73,000+ verified listings',
  'AI-powered property descriptions',
  'EMI calculator & finance tools',
  'Compare properties side by side',
  'Save properties to your wishlist',
];

const Login = () => {
  const { login, userProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('All fields are required.'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err) {
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (userProfile) {
      if (userProfile.role === 'admin') navigate('/admin/dashboard');
      else if (userProfile.role === 'owner') navigate('/owner/dashboard');
      else navigate('/user/dashboard');
    }
  }, [userProfile]);

  const getFirebaseError = (code) => {
    const map = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/too-many-requests': 'Too many attempts. Try again later.',
      'auth/invalid-email': 'Invalid email address.',
    };
    return map[code] || 'Login failed. Please try again.';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* LEFT — Branding Panel */}
      <div className="login-panel" style={{
        flex: '1 1 45%', background: 'linear-gradient(155deg, #2d1f70 0%, #4b36c4 50%, #674df0 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem 3.5rem', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background decoration circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', position: 'relative' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '14px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Building2 size={26} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color: '#fff' }}>E-Housing</span>
        </div>

        <h2 style={{ fontFamily: 'Outfit', fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', lineHeight: 1.25, position: 'relative' }}>
          India's Most<br />Trusted Property<br />Platform
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.6, position: 'relative' }}>
          Find your perfect home from millions of verified listings across top cities.
        </p>

        {/* Feature list */}
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

        {/* Property image strip */}
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
        background: '#f8fafc', padding: '2rem 1.5rem'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: '#1a2e4a', marginBottom: '0.5rem' }}>
            Welcome back 👋
          </h1>
          <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#674df0', fontWeight: 700, textDecoration: 'none' }}>Create one free</Link>
          </p>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.5rem', color: '#991b1b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com"
                  style={inputStyle} onFocus={e => e.target.style.borderColor = '#674df0'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="Enter your password"
                  style={inputStyle} onFocus={e => e.target.style.borderColor = '#674df0'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #674df0, #4b36c4)',
              color: '#fff', border: 'none', borderRadius: '14px', padding: '1rem',
              fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 20px rgba(103,77,240,0.35)',
              transition: 'all 0.2s', marginTop: '0.25rem'
            }}>
              {loading ? (
                <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Signing in…</>
              ) : (
                <><LogIn size={18} /> Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '2rem' }}>
            By signing in you agree to our{' '}
            <a href="#" style={{ color: '#674df0', textDecoration: 'none' }}>Terms</a> &{' '}
            <a href="#" style={{ color: '#674df0', textDecoration: 'none' }}>Privacy Policy</a>
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

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '0.9rem 1rem 0.9rem 2.75rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.95rem', color: '#1a2e4a', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };

export default Login;
