import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Globe, Share2, Mail, Phone, MapPin,
  ArrowRight, ExternalLink, MessageSquare, Rss,
  Home, Search, Heart, MessageCircle, ShieldCheck,
  ChevronRight
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.trim()) { setSubscribed(true); setEmail(''); }
  };

  const stats = [
    { val: '12L+',  label: 'Total Listings',   sub: 'Verified properties' },
    { val: '45K+',  label: 'Happy Families',   sub: 'Deals closed' },
    { val: '10K+',  label: 'Added Daily',       sub: 'New properties' },
    { val: '25+',   label: 'Cities Covered',    sub: 'Pan India' },
    { val: '4.8★',  label: 'Avg. Rating',       sub: 'User satisfaction' },
  ];

  const quickLinks = [
    { to: '/',       label: 'Home' },
    { to: '/search', label: 'Browse Properties' },
    { to: '/search?type=sell',    label: 'Properties for Sale' },
    { to: '/search?type=rental',  label: 'Properties for Rent' },
    { to: '/register',            label: 'Post Property FREE' },
    { to: '/login',               label: 'Sign In / Register' },
  ];

  const propertyTypes = [
    { to: '/search?type=sell',       label: 'Apartments for Sale' },
    { to: '/search?type=rental',     label: 'Flats for Rent' },
    { to: '/search?type=sell',       label: 'Luxury Villas' },
    { to: '/search?type=commercial', label: 'Commercial Spaces' },
    { to: '/search?type=plot',       label: 'Plots & Land' },
    { to: '/search',                 label: 'Studio Apartments' },
  ];

  const popularCities = [
    { to: '/search?city=Mumbai',    label: 'Mumbai' },
    { to: '/search?city=Delhi',     label: 'Delhi / NCR' },
    { to: '/search?city=Bangalore', label: 'Bangalore' },
    { to: '/search?city=Hyderabad', label: 'Hyderabad' },
    { to: '/search?city=Pune',      label: 'Pune' },
    { to: '/search?city=Chennai',   label: 'Chennai' },
  ];

  const socials = [
    { Icon: Globe,          href: '#', color: '#1DA1F2', label: 'Website' },
    { Icon: MessageSquare,  href: '#', color: '#E1306C', label: 'Messages' },
    { Icon: Share2,         href: '#', color: '#0077B5', label: 'Share' },
    { Icon: Rss,            href: '#', color: '#FF0000', label: 'Blog' },
  ];

  const linkStyle = {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem',
    marginBottom: '0.75rem', textDecoration: 'none', transition: 'all 0.2s'
  };

  return (
    <footer style={{ background: '#0a0f1e', color: '#fff', marginTop: 'auto' }}>

      {/* ── TOP CONTACT HIGHLIGHT STRIP ── */}
      <div style={{ background: 'linear-gradient(135deg, #0078db 0%, #0056a3 100%)', padding: '2.5rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          
          {/* Phone */}
          <a href="tel:+918317527369" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', textDecoration: 'none' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)' }}>
              <Phone size={26} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Call Us Anytime</p>
              <p style={{ margin: '4px 0 0', color: '#fff', fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>+91-8317527369</p>
            </div>
          </a>

          {/* Email */}
          <a href="mailto:mvreddy052005@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', textDecoration: 'none' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)' }}>
              <Mail size={26} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Email Us</p>
              <p style={{ margin: '4px 0 0', color: '#fff', fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>mvreddy052005@gmail.com</p>
            </div>
          </a>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)' }}>
              <MapPin size={26} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Our Office</p>
              <p style={{ margin: '4px 0 0', color: '#fff', fontSize: '1rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Hyderabad, Telangana, India</p>
            </div>
          </div>

          {/* Working Hours */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)' }}>
              <ShieldCheck size={26} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Available</p>
              <p style={{ margin: '4px 0 0', color: '#fff', fontSize: '1rem', fontWeight: 700 }}>Mon–Sat: 9AM – 7PM</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── NEWSLETTER ── */}
      <div style={{ background: 'linear-gradient(135deg, #13183a 0%, #1a2240 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '3rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <p style={{ color: '#0078db', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 0.5rem' }}>Newsletter</p>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color: '#fff', margin: '0 0 0.4rem' }}>Get New Property Alerts</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: 0 }}>Be the first to know about new listings in your city</p>
          </div>
          {subscribed ? (
            <div style={{ background: 'rgba(0,120,219,0.15)', border: '1px solid rgba(0,120,219,0.4)', borderRadius: '12px', padding: '1rem 1.5rem', color: '#4ade80', fontWeight: 700 }}>
              ✓ You're subscribed! Welcome on board.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', flex: '1 1 360px', maxWidth: 520 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={{
                  flex: 1, padding: '0.9rem 1.25rem', borderRadius: '12px',
                  border: '1.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
                  color: '#fff', fontSize: '0.9rem', outline: 'none',
                }}
              />
              <button onClick={handleSubscribe} style={{
                background: '#0078db', color: '#fff', border: 'none', borderRadius: '12px',
                padding: '0.9rem 1.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0,
                transition: 'all 0.2s'
              }}
                onMouseOver={e => e.currentTarget.style.background = '#0066b8'}
                onMouseOut={e => e.currentTarget.style.background = '#0078db'}
              >
                Subscribe <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── STATS BANNER ── */}
      <div style={{ background: '#0d1228', padding: '2.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '1.5rem 1rem', borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'Outfit', background: 'linear-gradient(135deg, #0078db, #60b8ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700, marginTop: '0.5rem' }}>{s.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER GRID ── */}
      <div className="container" style={{ padding: '5rem 1.5rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '4rem', marginBottom: '4rem' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #0078db, #0056a3)', borderRadius: '14px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={26} color="#fff" />
              </div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.8rem', background: 'linear-gradient(135deg, #fff 40%, #60b8ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                E-Housing
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.9, marginBottom: '2rem', maxWidth: 320 }}>
              India's premium AI-powered real estate platform. Connecting buyers, renters and owners with their perfect property since 2024. Trusted by over 45,000+ families.
            </p>
            {/* Contact in brand col */}
            <div style={{ marginBottom: '2rem' }}>
              <a href="tel:+918317527369" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', textDecoration: 'none' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,120,219,0.15)', border: '1px solid rgba(0,120,219,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={16} color="#0078db" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>+91-8317527369</span>
              </a>
              <a href="mailto:mvreddy052005@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,120,219,0.15)', border: '1px solid rgba(0,120,219,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={16} color="#0078db" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>mvreddy052005@gmail.com</span>
              </a>
            </div>
            {/* Socials */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {socials.map(({ Icon, href, color, label }) => (
                <a key={label} href={href} title={label} style={{
                  width: 42, height: 42, borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.45)', transition: 'all 0.25s', textDecoration: 'none'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.borderColor = color; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0078db', marginBottom: '1.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Quick Links</h4>
            {quickLinks.map(link => (
              <Link key={link.to + link.label} to={link.to} style={linkStyle}
                onMouseEnter={e => { e.currentTarget.style.color = '#60b8ff'; e.currentTarget.style.paddingLeft = '0.3rem'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.paddingLeft = '0'; }}>
                <ChevronRight size={13} /> {link.label}
              </Link>
            ))}
          </div>

          {/* Property Types */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0078db', marginBottom: '1.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Property Types</h4>
            {propertyTypes.map(link => (
              <Link key={link.label} to={link.to} style={linkStyle}
                onMouseEnter={e => { e.currentTarget.style.color = '#60b8ff'; e.currentTarget.style.paddingLeft = '0.3rem'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.paddingLeft = '0'; }}>
                <ChevronRight size={13} /> {link.label}
              </Link>
            ))}
          </div>

          {/* Popular Cities */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0078db', marginBottom: '1.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Popular Cities</h4>
            {popularCities.map(link => (
              <Link key={link.label} to={link.to} style={linkStyle}
                onMouseEnter={e => { e.currentTarget.style.color = '#60b8ff'; e.currentTarget.style.paddingLeft = '0.3rem'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.paddingLeft = '0'; }}>
                <ChevronRight size={13} /> {link.label}
              </Link>
            ))}

            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0078db', marginBottom: '1.25rem', marginTop: '2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Support</h4>
            {[
              { to: '/user/feedback', label: 'Give Feedback' },
              { to: '/user/complaint', label: 'Raise Complaint' },
            ].map(link => (
              <Link key={link.label} to={link.to} style={linkStyle}
                onMouseEnter={e => { e.currentTarget.style.color = '#60b8ff'; e.currentTarget.style.paddingLeft = '0.3rem'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.paddingLeft = '0'; }}>
                <ChevronRight size={13} /> {link.label}
              </Link>
            ))}
          </div>

        </div>

        {/* ── BOTTOM BAR ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', margin: 0 }}>
              © 2026 <strong style={{ color: 'rgba(255,255,255,0.5)' }}>E-Housing</strong>. All rights reserved. Made with ❤️ in India.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', margin: '4px 0 0' }}>
              Designed & Developed by <strong style={{ color: 'rgba(255,255,255,0.4)' }}>M.V. Reddy</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Sitemap'].map(item => (
              <a key={item} href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#60b8ff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
