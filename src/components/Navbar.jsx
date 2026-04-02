import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, Search, Heart, LogIn, UserPlus, LogOut, Building2,
  Menu, X, LayoutDashboard, ChevronDown, Bell, Shield, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to apply glassmorphic effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    try { await logout(); toast.success('Logged out successfully'); navigate('/'); }
    catch { toast.error('Logout failed'); }
  };

  const role = userProfile?.role;
  const isActive = (path) => location.pathname === path;
  const getDashboardLink = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'owner') return '/owner/dashboard';
    return '/user/dashboard';
  };

  const navBg = scrolled
    ? 'rgba(15, 10, 40, 0.92)'
    : 'linear-gradient(135deg, #1a1040 0%, #2d1f70 100%)';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
      background: navBg,
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 20px rgba(0,0,0,0.2)',
      borderBottom: scrolled ? '1px solid rgba(167,139,250,0.15)' : 'none',
      height: '70px', display: 'flex', alignItems: 'center',
      transition: 'all 0.3s ease'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #674df0, #4b36c4)',
            borderRadius: '12px', padding: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(103,77,240,0.4)'
          }}>
            <Building2 size={20} color="#fff" />
          </div>
          <span style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.4rem',
            background: 'linear-gradient(135deg, #fff 30%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>E-Housing</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }} className="desktop-nav">
          <NavLink to="/" active={isActive('/')}><Home size={15} /> Home</NavLink>
          <NavLink to="/search" active={isActive('/search')}><Search size={15} /> Search</NavLink>

          {currentUser && role === 'user' && (
            <NavLink to="/wishlist" active={isActive('/wishlist')}><Heart size={15} /> Wishlist</NavLink>
          )}

          {!currentUser && (
            <>
              <NavLink to="/login" active={isActive('/login')}><LogIn size={15} /> Login</NavLink>
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: 'linear-gradient(135deg, #674df0, #4b36c4)',
                color: '#fff', padding: '0.45rem 1.1rem', borderRadius: '10px',
                fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', marginLeft: '0.25rem',
                boxShadow: '0 4px 12px rgba(103,77,240,0.35)', transition: 'all 0.2s'
              }}
                onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 16px rgba(103,77,240,0.5)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(103,77,240,0.35)'}
              >
                <UserPlus size={15} />Register
              </Link>
            </>
          )}

          {currentUser && (
            <div style={{ position: 'relative', marginLeft: '0.5rem' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(167,139,250,0.12)', border: '1.5px solid rgba(167,139,250,0.25)',
                  borderRadius: '12px', padding: '0.4rem 0.85rem', color: '#fff',
                  fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.2)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.12)'; }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #674df0, #9f7aea)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800, color: '#fff', flexShrink: 0
                }}>
                  {userProfile?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                {userProfile?.name?.split(' ')[0] || 'User'}
                <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  background: '#fff', borderRadius: '16px', boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
                  minWidth: '220px', overflow: 'hidden', zIndex: 100,
                  border: '1px solid #e2e8f0', animation: 'dropIn 0.2s ease'
                }} onMouseLeave={() => setDropdownOpen(false)}>
                  {/* User info header */}
                  <div style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, #f0edff, #fff)', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #674df0, #4b36c4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem' }}>
                        {userProfile?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#1a2e4a', fontSize: '0.9rem', margin: 0 }}>{userProfile?.name}</p>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: role === 'admin' ? '#ef4444' : role === 'owner' ? '#f59e0b' : '#10b981', textTransform: 'capitalize', background: role === 'admin' ? '#fee2e2' : role === 'owner' ? '#fef3c7' : '#d1fae5', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                          {role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div style={{ padding: '0.5rem' }}>
                    <DropItem to={getDashboardLink()} icon={<LayoutDashboard size={15} />} onClick={() => setDropdownOpen(false)}>Dashboard</DropItem>
                    {role === 'user' && <DropItem to="/user/profile" icon={<UserPlus size={15} />} onClick={() => setDropdownOpen(false)}>My Profile</DropItem>}
                    {role === 'user' && <DropItem to="/wishlist" icon={<Heart size={15} />} onClick={() => setDropdownOpen(false)}>Wishlist</DropItem>}
                    {role === 'owner' && <DropItem to="/owner/properties" icon={<Building2 size={15} />} onClick={() => setDropdownOpen(false)}>My Properties</DropItem>}
                    {role === 'admin' && <DropItem to="/admin/seed-data" icon={<Settings size={15} />} onClick={() => setDropdownOpen(false)}>DB Seeder</DropItem>}
                    
                    <div style={{ height: 1, background: '#f1f5f9', margin: '0.5rem 0.5rem' }} />
                    <button onClick={() => { setDropdownOpen(false); handleLogout(); }} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                      padding: '0.6rem 0.85rem', borderRadius: '10px', background: 'transparent',
                      border: 'none', color: '#ef4444', fontSize: '0.875rem', fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff', padding: '6px 8px', cursor: 'pointer' }}
          className="mobile-hamburger"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '70px', left: 0, right: 0,
          background: 'rgba(15, 10, 40, 0.97)', backdropFilter: 'blur(20px)',
          padding: '1rem 1.5rem 1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          borderBottom: '1px solid rgba(167,139,250,0.15)', zIndex: 998
        }}>
          {/* User info on mobile */}
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(167,139,250,0.1)', borderRadius: '12px', marginBottom: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #674df0, #4b36c4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, flexShrink: 0 }}>
                {userProfile?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>{userProfile?.name}</p>
                <p style={{ color: '#a78bfa', fontSize: '0.75rem', margin: 0, textTransform: 'capitalize' }}>{role}</p>
              </div>
            </div>
          )}
          <MobileLink to="/" icon={<Home size={16} />}>Home</MobileLink>
          <MobileLink to="/search" icon={<Search size={16} />}>Search Properties</MobileLink>
          {currentUser && role === 'user' && <MobileLink to="/wishlist" icon={<Heart size={16} />}>Wishlist</MobileLink>}
          {currentUser && <MobileLink to={getDashboardLink()} icon={<LayoutDashboard size={16} />}>Dashboard</MobileLink>}
          {!currentUser && <MobileLink to="/login" icon={<LogIn size={16} />}>Login</MobileLink>}
          {!currentUser && <MobileLink to="/register" icon={<UserPlus size={16} />}>Register</MobileLink>}
          {currentUser && (
            <button onClick={() => { setMenuOpen(false); handleLogout(); }} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
              padding: '0.85rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px', color: '#ef4444', fontSize: '0.9rem', fontWeight: 700,
              cursor: 'pointer', marginTop: '0.5rem'
            }}>
              <LogOut size={16} /> Sign Out
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
};

const NavLink = ({ to, active, children }) => (
  <Link to={to} style={{
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.45rem 0.85rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600,
    color: active ? '#a78bfa' : 'rgba(255,255,255,0.75)',
    background: active ? 'rgba(167,139,250,0.15)' : 'transparent',
    border: active ? '1px solid rgba(167,139,250,0.25)' : '1px solid transparent',
    transition: 'all 0.2s', textDecoration: 'none'
  }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.background = 'transparent'; } }}>
    {children}
  </Link>
);

const DropItem = ({ to, icon, children, onClick }) => (
  <Link to={to} onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem',
    borderRadius: '10px', color: '#334155', fontSize: '0.875rem', fontWeight: 600,
    transition: 'all 0.2s', textDecoration: 'none', marginBottom: '2px'
  }}
    onMouseEnter={e => { e.currentTarget.style.background = '#f0edff'; e.currentTarget.style.color = '#674df0'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}>
    <span style={{ color: '#674df0' }}>{icon}</span> {children}
  </Link>
);

const MobileLink = ({ to, children, icon }) => (
  <Link to={to} style={{
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem',
    color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 600,
    borderRadius: '12px', textDecoration: 'none', marginBottom: '0.35rem',
    transition: 'all 0.2s', border: '1px solid transparent'
  }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.12)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.2)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
    <span style={{ color: '#a78bfa' }}>{icon}</span> {children}
  </Link>
);

export default Navbar;
