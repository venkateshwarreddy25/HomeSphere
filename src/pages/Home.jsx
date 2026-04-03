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
      <section className="home-hero-section" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop')` }}>
        <div className="home-hero-overlay"></div>

        <div className="home-hero-content">
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
             <h1 className="home-hero-title">
                 PAY 30% <span>AND OWN</span>
             </h1>
             <p className="home-hero-subtitle">
                 3 BHK ₹2.98 CR* Onwards
             </p>
          </div>

          <div className="home-search-container">
            <div className="home-search-tabs">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(tab.label)}
                  style={{
                    padding: '1.2rem 1.75rem',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.label ? '4px solid #0078db' : '4px solid transparent',
                    fontWeight: activeTab === tab.label ? 800 : 600,
                    color: activeTab === tab.label ? '#0078db' : '#4a4a4a',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    position: 'relative'
                  }}
                >
                  {tab.label}
                  {tab.dot && <span style={{ position: 'absolute', top: '15px', right: '15px', width: '6px', height: '6px', background: '#eb1946', borderRadius: '50%' }}></span>}
                </button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                <Link to="/register" style={{ 
                  background: 'rgba(0,120,219,0.1)', color: '#0078db', padding: '0.5rem 1rem', 
                  borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none',
                  border: '1px solid rgba(0,120,219,0.2)', whiteSpace: 'nowrap'
                }}>
                  Post Property <span style={{ background: '#22c55e', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', marginLeft: '6px' }}>FREE</span>
                </Link>
              </div>
            </div>

            <form onSubmit={handleSearch} className="home-search-form">
              <div className="search-filter-div">
                 <span style={{ fontSize: '1rem', color: '#1a1a1a', fontWeight: 600, marginRight: '8px' }}>All Residential</span>
                 <ChevronDown size={18} color="#1a1a1a" />
              </div>
              <div className="search-input-wrapper">
                <Search size={22} color="#0078db" style={{ marginRight: '0.75rem', flexShrink: 0 }} />
                <input
                  className="search-input"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search 'PG in sector 74 noida'"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', padding: '0 0.5rem' }}>
                 <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,120,219,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(0,120,219,0.2)'} onMouseOut={e=>e.currentTarget.style.background='rgba(0,120,219,0.1)'}>
                   <Crosshair size={20} color="#0078db" />
                 </div>
                 <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,120,219,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(0,120,219,0.2)'} onMouseOut={e=>e.currentTarget.style.background='rgba(0,120,219,0.1)'}>
                   <Mic size={20} color="#0078db" />
                 </div>
              </div>
              <button type="submit" className="search-btn-primary">
                Search
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* 2. GET STARTED OPTIONS */}
      <section style={{ padding: '4rem 0', background: '#fff', textAlign: 'center' }}>
        <div className="container">
          <h3 className="home-section-subtitle">Get started with exploring real estate options</h3>
          <div className="home-explore-grid">
            {exploreCards.map((c, i) => (
               <div key={i} onClick={c.action} className="home-explore-card"
                 onMouseOver={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1.08)'; e.currentTarget.querySelector('.explore-title').style.color = '#0078db'; }}
                 onMouseOut={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1)'; e.currentTarget.querySelector('.explore-title').style.color = '#1a1a1a'; }}
               >
                 <div style={{ width: '100%', height: '140px', borderRadius: '16px', overflow: 'hidden', position: 'relative', background: '#f5f7fa', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
                   {c.badge && <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#eb1946', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', zIndex: 10 }}>{c.badge}</div>}
                   <img src={c.img} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                 </div>
                 <div className="explore-title" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a1a', textAlign: 'center', marginTop: '1rem', transition: 'color 0.2s' }}>{c.title}</div>
               </div>
            ))}
          </div>
          
          <div style={{ marginTop: '3rem' }}>
              <h2 className="home-section-title">Find Better Places to Live, Work<br/>and Wonder...</h2>
          </div>
        </div>
      </section>

      {/* 3. NEWLY LAUNCHED & HANDPICKED PROJECTS */}
      <section style={{ padding: '2rem 0 5rem', background: '#fff' }}>
        <div className="container">
          
          <div style={{ marginBottom: '2rem' }}>
             <h2 className="home-section-title" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Handpicked Residential Projects</h2>
             <p className="home-section-subtitle" style={{ letterSpacing: '1px' }}>Featured Residential projects across India</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {loading ? (
               Array.from({length: 6}).map((_, i) => <div key={i} style={{ width: '100%', height: '360px', background: '#f5f7fa', borderRadius: '20px' }} />)
            ) : featured.length > 0 ? (
              featured.map(p => (
                <Link to={`/property/${p.id}`} key={p.id} style={{ display: 'block', width: '100%', textDecoration: 'none' }}>
                  <div style={{ position: 'relative', width: '100%', height: '360px', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', background: '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', transition: 'transform 0.3s' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <img src={p.photos?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} alt={p.title} 
                         style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, transition: 'opacity 0.3s' }} 
                         onMouseOver={e => e.currentTarget.style.opacity = 1}
                         onMouseOut={e => e.currentTarget.style.opacity = 0.8}
                    />
                    
                    <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#8b3dff', color: '#fff', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '6px', fontWeight: 800, textTransform: 'uppercase' }}>
                      Featured
                    </div>

                    <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: '#fff', borderRadius: '16px', padding: '25px 20px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                      <div style={{ position: 'absolute', top: '-25px', left: '20px', width: '50px', height: '50px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <Building2 size={24} color="#d4a373" />
                      </div>
                      
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#1a1a1a' }}>{p.title}</h3>
                      <p style={{ color: '#7a7a7a', fontSize: '0.9rem', margin: '0 0 10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                         {p.type === 'plot' ? 'Land/Plot' : p.type === 'rental' ? 'Rent' : 'House/Villa'}, {p.address}
                      </p>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a1a1a' }}>{formatPrice(p.price)}</div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ padding: '3rem', background: '#f5f7fa', borderRadius: '20px', gridColumn: '1 / -1', textAlign: 'center' }}>
                <p style={{ color: '#7a7a7a', fontSize: '1.1rem', fontWeight: 600 }}>No matching properties found.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. POPULAR CITIES */}
      <section style={{ padding: '4rem 0', background: '#f8fafc' }}>
        <div className="container">
          <p className="home-section-subtitle">Top Cities</p>
          <h2 className="home-section-title" style={{ marginBottom: '3rem' }}>Explore Real Estate in Popular Indian Cities</h2>
          
          <div className="home-cities-grid">
            {popularCities.map((city, idx) => (
               <div key={idx} onClick={() => navigate(`/search?city=${city.name.split(' ')[0]}`)} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', background: '#fff', borderRadius: '16px', padding: '0.75rem', transition: 'box-shadow 0.3s, transform 0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} onMouseOver={e => {e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)';}} onMouseOut={e => {e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)';}}>
                 <img src={city.img} alt={city.name} style={{ width: '90px', height: '90px', borderRadius: '12px', objectFit: 'cover' }} />
                 <div>
                   <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a' }}>{city.name}</h4>
                   <p style={{ margin: 0, fontSize: '0.9rem', color: '#7a7a7a', fontWeight: 500 }}>{city.properties} Properties</p>
                 </div>
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BENEFITS */}
      <section style={{ padding: '6rem 0', background: '#fff', textAlign: 'center' }}>
        <div className="container">
          <p className="home-section-subtitle">Benefits of E-Housing</p>
          <h2 className="home-section-title" style={{ marginBottom: '4rem' }}>Why choose E-Housing</h2>
          
          <div className="home-benefits-grid">
            {benefitsData.map((b, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '24px', transition: 'transform 0.3s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#e6f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 8px 16px rgba(0,120,219,0.15)' }}>
                   {React.cloneElement(b.icon, { size: 30 })}
                </div>
                <h4 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 800, color: '#0078db' }}>{b.title}</h4>
                <p style={{ margin: 0, fontSize: '1.05rem', color: '#7a7a7a', lineHeight: 1.6 }}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section style={{ padding: '4rem 0 6rem', background: '#f8fafc' }}>
        <div className="container">
          <p className="home-section-subtitle">Testimonials</p>
          <h2 className="home-section-title" style={{ marginBottom: '0.5rem' }}>What our customers are<br/>saying about E-Housing</h2>
          <p style={{ color: '#7a7a7a', fontSize: '1.1rem', marginBottom: '3rem', fontWeight: 500 }}>Hear from our satisfied buyers, tenants, owners and dealers</p>

          <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem', msOverflowStyle: 'none', scrollbarWidth: 'none', paddingLeft: '1rem', paddingRight: '1rem' }}>
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card"
                style={{
                  flex: '0 0 auto', width: '380px', padding: '2rem',
                  borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)',
                  background: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.3s, transform 0.3s', cursor: 'default'
                }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <img
                    src={t.img}
                    alt={t.name}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f0f2f5' }}
                    onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=0078db&color=fff&size=100`; }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a' }}>{t.name}</h4>
                    <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#7a7a7a', fontWeight: 600 }}>{t.role}</p>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <span key={s} style={{ color: s < t.stars ? '#f59e0b' : '#e2e8f0', fontSize: '1rem' }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ height: '1px', background: '#f0f2f5', marginBottom: '1.5rem' }} />
                <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{
                    position: 'absolute', top: '-12px', left: '-8px',
                    fontSize: '4rem', color: 'rgba(0,120,219,0.1)', lineHeight: 1,
                    fontFamily: 'Georgia, serif', userSelect: 'none'
                  }}>"</span>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#4a4a4a', lineHeight: 1.8, fontWeight: 500 }}>{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECENTLY VIEWED */}
      <div style={{ background: '#fff', padding: '2rem 0' }}>
         <RecentlyViewed />
      </div>

    </div>
  );
};

export default HomePage;
