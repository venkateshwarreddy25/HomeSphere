import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Search, MapPin, ChevronRight, Mic, Crosshair, ChevronDown, Building2, Lightbulb } from 'lucide-react';
import RecentlyViewed from '../components/RecentlyViewed';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Buy');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const tabs = [
    { label: 'Buy' },
    { label: 'Rent' },
    { label: 'New Launch', dot: true },
    { label: 'Commercial' },
    { label: 'Plots/Land' },
    { label: 'Projects' }
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        let propertyType = 'sell';
        if (activeTab === 'Rent') propertyType = 'rental';
        if (activeTab === 'Commercial') propertyType = 'commercial';
        if (activeTab === 'Plots/Land') propertyType = 'plot';

        const q = query(
          collection(db, 'properties'),
          where('status', '==', 'approved')
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        const filteredByType = docs.filter(d => d.type === propertyType);
        
        setFeatured(
          filteredByType
            .sort((a,b) => (b.createdAt?.toMillis() || Date.now()) - (a.createdAt?.toMillis() || Date.now()))
            .slice(0, 10)
        );
      } catch (err) {
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?city=${search}`);
    }
  };

  const formatPrice = (p) => {
    if (p >= 10000000) return `₹ ${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹ ${(p / 100000).toFixed(2)} Lacs`;
    return `₹ ${Number(p).toLocaleString('en-IN')}`;
  };

  const exploreCards = [
    { title: 'Buying a home',        img: 'https://picsum.photos/seed/buyhome/300/200',     action: () => navigate('/search?type=sell') },
    { title: 'Renting a home',       img: 'https://picsum.photos/seed/rent/300/200',        action: () => navigate('/search?type=rental') },
    { title: 'Invest in Real Estate',img: 'https://picsum.photos/seed/invest/300/200',     badge: 'NEW', action: () => navigate('/search?type=commercial') },
    { title: 'Sell/Rent your property', img: 'https://picsum.photos/seed/sellprop/300/200', action: () => navigate('/register') },
    { title: 'Plots/Land',           img: 'https://picsum.photos/seed/plotland/300/200',   action: () => navigate('/search?type=plot') },
    { title: 'Explore Insights',     img: 'https://picsum.photos/seed/insights/300/200',   badge: 'NEW', action: () => navigate('/search') }
  ];

  const popularCities = [
    { name: 'Delhi / NCR',  properties: '240,000+', img: 'https://picsum.photos/seed/delhi/300/200' },
    { name: 'Bangalore',    properties: '80,000+',  img: 'https://picsum.photos/seed/bangalore/300/200' },
    { name: 'Pune',         properties: '64,000+',  img: 'https://picsum.photos/seed/pune/300/200' },
    { name: 'Chennai',      properties: '49,000+',  img: 'https://picsum.photos/seed/chennai/300/200' },
    { name: 'Mumbai',       properties: '73,000+',  img: 'https://picsum.photos/seed/mumbai/300/200' },
    { name: 'Hyderabad',    properties: '41,000+',  img: 'https://picsum.photos/seed/hyderabad/300/200' },
    { name: 'Kolkata',      properties: '47,000+',  img: 'https://picsum.photos/seed/kolkata/300/200' },
    { name: 'Ahmedabad',    properties: '35,000+',  img: 'https://picsum.photos/seed/ahmedabad/300/200' }
  ];

  const benefitsData = [
    { icon: <Building2 size={24} color="#0078db" />, title: '01. Over 12 Lac properties', text: '10,000+ properties are added every day' },
    { icon: <Crosshair size={24} color="#0078db" />, title: '02. Verification by E-Housing team', text: 'Photos / Videos and other details are verified on location' },
    { icon: <Lightbulb size={24} color="#0078db" />, title: '03. Large user base', text: 'High active user count and user engagement to find and close deals' }
  ];

  const testimonials = [
    { name: 'Rajesh Kumar',       role: 'Owner, Tamil Nadu',  text: 'A Relationship Manager from E-Housing closely followed up with potential buyers. Got a great deal within 3 weeks!', img: 'https://i.pravatar.cc/100?img=12', stars: 5 },
    { name: 'S. Anandan',         role: 'Owner, Tamil Nadu',  text: 'Products they offer give us more leverage in reaching out to the right customer at the right time.', img: 'https://i.pravatar.cc/100?img=33', stars: 5 },
    { name: 'Priya Sharma',       role: 'Buyer, Pune',        text: 'Found my dream 3BHK apartment in Pune within days. The search filters are incredibly precise and helpful.', img: 'https://i.pravatar.cc/100?img=47', stars: 5 },
    { name: 'Arun Mehta',         role: 'Landlord, Mumbai',   text: 'Rented out my Andheri flat in just 10 days. The tenant verification process gave me complete peace of mind.', img: 'https://i.pravatar.cc/100?img=68', stars: 4 },
    { name: 'Kavitha Nair',       role: 'Tenant, Bangalore',  text: 'Relocated from Kerala to Bangalore. E-Housing made finding a verified furnished flat super smooth and stress-free.', img: 'https://i.pravatar.cc/100?img=56', stars: 5 },
    { name: 'Infinite Foundations', role: 'Builder, Hyderabad', text: 'Enables us to reach far more customers compared to traditional advertising, with lowest cost per lead.', img: 'https://i.pravatar.cc/100?img=15', stars: 5 }
  ];

  return (
    <div style={{ paddingTop: '70px', background: '#fff', minHeight: '100vh' }}>
      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        height: '420px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {/* Dark Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1000px' }}>
          
          {/* Hero Promotional Text */}
          <div style={{ textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>
             <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                 PAY 30% <span style={{ fontSize: '2rem', verticalAlign: 'middle', fontWeight: 600 }}>AND OWN</span>
             </h1>
             <p style={{ fontSize: '1.2rem', margin: '0.5rem 0 0', fontWeight: 500, letterSpacing: '1px' }}>
                 3 BHK ₹2.98 CR* Onwards
             </p>
          </div>

          {/* Search Box Container */}
          <div style={{
            background: '#fff', borderRadius: '16px', 
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)', overflow: 'hidden'
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e1e4e8', overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 1rem' }}>
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(tab.label)}
                  style={{
                    padding: '1rem 1.5rem',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.label ? '3px solid #0078db' : '3px solid transparent',
                    fontWeight: activeTab === tab.label ? 700 : 500,
                    color: activeTab === tab.label ? '#1a1a1a' : '#4a4a4a',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    position: 'relative'
                  }}
                >
                  {tab.label}
                  {tab.dot && <span style={{ position: 'absolute', top: '12px', right: '12px', width: '6px', height: '6px', background: '#eb1946', borderRadius: '50%' }}></span>}
                </button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                <Link to="/register" style={{ 
                  background: '#f2f9ff', color: '#0078db', padding: '0.4rem 0.8rem', 
                  borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
                  border: '1px solid #cce4f7'
                }}>
                  Post Property <span style={{ background: '#22c55e', color: '#fff', padding: '1px 4px', borderRadius: '2px', fontSize: '0.65rem', marginLeft: '4px' }}>FREE</span>
                </Link>
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSearch} style={{ display: 'flex', padding: '1.2rem', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', borderRight: '1px solid #e1e4e8', cursor: 'pointer' }}>
                 <span style={{ fontSize: '0.95rem', color: '#4a4a4a', fontWeight: 500, marginRight: '4px' }}>All Residential</span>
                 <ChevronDown size={16} color="#4a4a4a" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0 1rem' }}>
                <Search size={20} color="#909090" style={{ marginRight: '0.75rem', flexShrink: 0 }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search 'PG in sector 74 noida'"
                  style={{ flex: 1, border: 'none', background: 'transparent', padding: '0.5rem 0', fontSize: '1rem', outline: 'none', color: '#1a1a1a' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', padding: '0 1rem' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                   <Crosshair size={18} color="#0078db" />
                 </div>
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                   <Mic size={18} color="#0078db" />
                 </div>
              </div>
              <button type="submit" style={{
                background: '#0078db', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '0.8rem 2rem',
                fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#0066b8'}
              onMouseOut={e => e.currentTarget.style.background = '#0078db'}
              >
                Search
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* 2. GET STARTED OPTIONS (Horizontal Scroll) */}
      <section style={{ padding: '3rem 0', background: '#fff', textAlign: 'center' }}>
        <div className="container">
          <h3 style={{ color: '#909090', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Get started with exploring real estate options</h3>
          <div style={{ display: 'flex', gap: '1.2rem', overflowX: 'auto', paddingBottom: '1.5rem', msOverflowStyle: 'none', scrollbarWidth: 'none', justifyContent: 'center' }}>
            {exploreCards.map((c, i) => (
               <div key={i} onClick={c.action} style={{ flex: '0 0 auto', width: '180px', display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer' }}
                 onMouseOver={e => e.currentTarget.querySelector('img').style.transform = 'scale(1.08)'}
                 onMouseOut={e => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}
               >
                 <div style={{ width: '100%', height: '110px', borderRadius: '12px', overflow: 'hidden', position: 'relative', background: '#f5f7fa' }}>
                   {c.badge && <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#eb1946', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', zIndex: 10 }}>{c.badge}</div>}
                   <img src={c.img} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} />
                 </div>
                 <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a', textAlign: 'center' }}>{c.title}</div>
               </div>
            ))}
          </div>
          
          <div style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', fontFamily: 'Outfit, sans-serif' }}>Find Better Places to Live, Work<br/>and Wonder...</h2>
          </div>
        </div>
      </section>

      {/* 3. NEWLY LAUNCHED & HANDPICKED PROJECTS */}
      <section style={{ padding: '2rem 0 5rem', background: '#fff' }}>
        <div className="container">
          
          {/* Handpicked Header */}
          <div style={{ marginBottom: '1.5rem' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem' }}>Handpicked Residential Projects</h2>
             <p style={{ color: '#7a7a7a', fontSize: '0.95rem' }}>Featured Residential projects across India</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {loading ? (
               Array.from({length: 6}).map((_, i) => <div key={i} style={{ width: '100%', height: '320px', background: '#f5f7fa', borderRadius: '16px' }} />)
            ) : featured.length > 0 ? (
              featured.map(p => (
                <Link to={`/property/${p.id}`} key={p.id} style={{ display: 'block', width: '100%', textDecoration: 'none' }}>
                  <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', background: '#000' }}>
                    <img src={p.photos?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} alt={p.title} 
                         style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                    
                    {/* Featured / RERA Tag */}
                    <div style={{ position: 'absolute', top: '15px', left: '15px', background: '#8b3dff', color: '#fff', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                      Featured
                    </div>

                    {/* Inner floating box */}
                    <div style={{ position: 'absolute', bottom: '15px', left: '15px', right: '15px', background: '#fff', borderRadius: '12px', padding: '25px 15px 15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      {/* Avatar/Logo overlapping */}
                      <div style={{ position: 'absolute', top: '-25px', left: '15px', width: '50px', height: '50px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Building2 size={24} color="#d4a373" />
                      </div>
                      
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#1a1a1a' }}>{p.title}</h3>
                      <p style={{ color: '#7a7a7a', fontSize: '0.85rem', margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                         {p.type === 'plot' ? 'Land/Plot' : p.type === 'rental' ? 'Rent' : 'Independent House/Villa'}, {p.address}
                      </p>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a1a1a' }}>{formatPrice(p.price)}</div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ padding: '2rem', border: '1px solid #e1e4e8', borderRadius: '16px', gridColumn: '1 / -1', textAlign: 'center' }}>
                <p style={{ color: '#7a7a7a' }}>No matching properties found.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. POPULAR CITIES */}
      <section style={{ padding: '3rem 0', background: '#fff' }}>
        <div className="container">
          <p style={{ color: '#7a7a7a', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Top Cities</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '2rem', fontFamily: 'Outfit, sans-serif' }}>Explore Real Estate in Popular Indian Cities</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {popularCities.map((city, idx) => (
               <div key={idx} onClick={() => navigate(`/search?city=${city.name.split(' ')[0]}`)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: '#fff', borderRadius: '12px', padding: '0.5rem', transition: 'box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'} onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}>
                 <img src={city.img} alt={city.name} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                 <div>
                   <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#1a1a1a' }}>{city.name}</h4>
                   <p style={{ margin: 0, fontSize: '0.85rem', color: '#7a7a7a' }}>{city.properties} Properties</p>
                 </div>
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BENEFITS */}
      <section style={{ padding: '4rem 0', background: '#f5f7fa', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: '#7a7a7a', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Benefits of E-Housing</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '3rem', fontFamily: 'Outfit, sans-serif' }}>Why choose E-Housing</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {benefitsData.map((b, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e6f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                   {b.icon}
                </div>
                <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#0078db' }}>{b.title}</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#7a7a7a', lineHeight: 1.5 }}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section style={{ padding: '4rem 0', background: '#fff' }}>
        <div className="container">
          <p style={{ color: '#7a7a7a', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Testimonials</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>What our customers are<br/>saying about E-Housing</h2>
          <p style={{ color: '#7a7a7a', fontSize: '0.95rem', marginBottom: '3rem' }}>Hear from our satisfied buyers, tenants, owners and dealers</p>

          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1.5rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {testimonials.map((t, i) => (
              <div key={i}
                style={{
                  flex: '0 0 auto', width: '340px', padding: '1.75rem',
                  borderRadius: '12px', border: '1px solid #e8eaed',
                  background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.25s, transform 0.25s', cursor: 'default'
                }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Person row */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <img
                    src={t.img}
                    alt={t.name}
                    style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8eaed' }}
                    onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=0078db&color=fff&size=100`; }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 2px', fontSize: '1rem', fontWeight: 700, color: '#1a1a1a' }}>{t.name}</h4>
                    <p style={{ margin: '0 0 5px', fontSize: '0.8rem', color: '#7a7a7a' }}>{t.role}</p>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <span key={s} style={{ color: s < t.stars ? '#f59e0b' : '#e2e8f0', fontSize: '0.85rem' }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Divider */}
                <div style={{ height: '1px', background: '#f0f2f5', marginBottom: '1.25rem' }} />
                {/* Quote */}
                <div style={{ position: 'relative', paddingLeft: '1.25rem' }}>
                  <span style={{
                    position: 'absolute', top: '-8px', left: '-4px',
                    fontSize: '3.5rem', color: '#dbeafe', lineHeight: 1,
                    fontFamily: 'Georgia, serif', userSelect: 'none'
                  }}>"</span>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#4a4a4a', lineHeight: 1.75 }}>{t.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.75rem' }}>
            <span style={{ color: '#0078db', fontWeight: 600, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
            >
              View all testimonials <ChevronRight size={16} />
            </span>
          </div>
        </div>
      </section>

      {/* RECENTLY VIEWED */}
      <div style={{ background: '#f5f7fa', padding: '1rem 0' }}>
         <RecentlyViewed />
      </div>

    </div>
  );
};

export default HomePage;
