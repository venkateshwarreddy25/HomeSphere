import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Database, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_PROPERTIES = [
  {
    title: "The Imperial Sky Villa", type: "sell", price: 185000000, area: 4500, city: "Mumbai",
    address: "Bandra West, Mount Mary Road", location: "Premium sea-facing luxury neighborhood",
    lat: 19.0467, lng: 72.8213,
    description: "Experience unparalleled luxury in this breathtaking 4 BHK sea-facing sky villa in Bandra West. Featuring floor-to-ceiling glass windows, a private plunge pool, Italian marble flooring, and an ultra-modern modular kitchen. Wake up to panoramic views of the Arabian Sea every morning.",
    query: "luxury penthouse sea view balcony modern architecture"
  },
  {
    title: "Lodha Bellissimo Apartment", type: "rental", price: 210000, area: 2200, city: "Mumbai",
    address: "Mahalaxmi, South Mumbai", location: "Heart of South Bombay",
    lat: 18.9827, lng: 72.8267,
    description: "Spacious and fully furnished 3 BHK apartment in the iconic Lodha Bellissimo tower. Comes with premium wooden decking, walk-in closets, central air conditioning, and access to a 5-star clubhouse, gym, and infinity pool. Perfect for expats and corporate executives.",
    query: "modern luxury apartment living room interior design bright"
  },
  {
    title: "Prestige Golfshire Villa", type: "sell", price: 85000000, area: 5500, city: "Bengaluru",
    address: "Nandi Hills Road, Devanahalli", location: "Quiet residential golf estate",
    lat: 13.2435, lng: 77.6841,
    description: "An ultra-luxury 4 BHK independent villa nestled within an 18-hole championship golf course. Features a private garden, double-height living room ceilings, a private cinema room, and smart-home automation. A true sanctuary away from the city noise.",
    query: "luxury independent villa grass lawn golf course twilight architectural photography"
  },
  {
    title: "Brigade Gateway Penthouse", type: "sell", price: 62000000, area: 3800, city: "Bengaluru",
    address: "Malleswaram West", location: "Integrated lifestyle enclave",
    lat: 13.0121, lng: 77.5552,
    description: "A spectacular 4 BHK duplex penthouse in Bengaluru's finest integrated enclave. Boasting a massive private terrace overlooking the ISKCON temple and city skyline. Includes highly customized interiors, a private elevator, and dedicated 3-car parking.",
    query: "luxury duplex penthouse modern minimalist interior"
  },
  {
    title: "Tech Park Studio Apartment", type: "rental", price: 35000, area: 650, city: "Bengaluru",
    address: "Whitefield, ITPL Main Rd", location: "Prime IT Hub",
    lat: 12.9850, lng: 77.7335,
    description: "Fully furnished modern studio apartment right opposite ITPL in Whitefield. Perfect for IT professionals. Includes high-speed WiFi setup, smart TV, ergonomic workstation, and premium kitchen appliances. Walk to work in 5 minutes!",
    query: "modern studio apartment cozy interior workstation"
  },
  {
    title: "DLF Magnolias Signature Suite", type: "sell", price: 240000000, area: 6800, city: "Gurgaon",
    address: "Golf Course Road, Sector 42", location: "Ultra-Premium Golf Community",
    lat: 28.4552, lng: 77.0934,
    description: "The epitome of luxury living in Delhi-NCR. This massive 5 BHK apartment in DLF Magnolias offers front-row views of the DLF Golf Course. Featuring bespoke imported furniture, a private spa room, a chef's kitchen, and a 12-seater private dining hall.",
    query: "ultra luxury living room mansion interior golf course view"
  },
  {
    title: "Cyber City Corporate Condo", type: "rental", price: 95000, area: 1800, city: "Gurgaon",
    address: "DLF Phase 2, Near Cyberhub", location: "Bustling corporate and entertainment hub",
    lat: 28.4876, lng: 77.0890,
    description: "Premium 3 BHK condo located a stone's throw away from Cyber Hub. Features contemporary decor, floor-to-ceiling windows, imported wooden flooring, and round-the-clock concierge service. Experience the best of Gurgaon's lifestyle.",
    query: "contemporary modern condo interior beautiful lighting"
  },
  {
    title: "Vasant Vihar Independent Floor", type: "sell", price: 140000000, area: 4000, city: "Delhi",
    address: "Block A, Vasant Vihar", location: "Diplomatic and Elite Residential Area",
    lat: 28.5603, lng: 77.1610,
    description: "A rare brand new 4 BHK builder floor in the highly coveted Vasant Vihar block. Features a massive stilt parking with private lobby, Italian marble, teakwood doors, VRV air conditioning, and a massive lush green terrace.",
    query: "luxury independent builder floor exterior architecture modern style"
  },
  {
    title: "Emaar MGF Palm Springs", type: "sell", price: 55000000, area: 2800, city: "Gurgaon",
    address: "Sector 54, Golf Course Road", location: "Upscale residential complex",
    lat: 28.4357, lng: 77.1009,
    description: "Beautifully maintained 4 BHK plus servant room apartment in the reputed Palm Springs complex. Offers abundant natural light, large balconies facing the central green, and an active high-profile community lifestyle.",
    query: "beautiful premium apartment exterior building pool"
  },
  {
    title: "Koregaon Park Artisan Villa", type: "rental", price: 150000, area: 3200, city: "Pune",
    address: "Lane 5, Koregaon Park", location: "Greenest and most elite suburb",
    lat: 18.5362, lng: 73.8939,
    description: "A stunning masterpiece 3 BHK heritage-style villa in KP. Surrounded by 100-year old banyan trees. Features an open-to-sky courtyard, a massive library room, rustic exposed brick walls, and modern smart-home amenities seamlessly integrated.",
    query: "heritage style luxury villa exterior courtyard overgrown greenery"
  },
  {
    title: "Amanora Gateway Towers", type: "sell", price: 34000000, area: 2100, city: "Pune",
    address: "Amanora Park Town, Hadapsar", location: "Premium Township",
    lat: 18.5195, lng: 73.9392,
    description: "Experience the height of luxury at Swarovski-designed Gateway Towers. This 3 BHK smart apartment comes with automated lighting, Swarovski crystal embellishments in the lobby, and exclusive access to the White Lotus club.",
    query: "swarovski luxury high rise apartment glass facade"
  },
  {
    title: "Jubilee Hills Grand Mansion", type: "sell", price: 380000000, area: 12000, city: "Hyderabad",
    address: "Road No 36, Jubilee Hills", location: "Billionaire's Row of Hyderabad",
    lat: 17.4326, lng: 78.4071,
    description: "An unbelievable 6 BHK palatial mansion seated on a huge plot in Jubilee Hills. Features a massive private home theater seating 20, a fully equipped gym, a temperature-controlled indoor pool, and a beautifully landscaped 1-acre garden.",
    query: "palatial grand mansion exterior luxury estate architecture pool"
  },
  {
    title: "Hitec City Executive Flat", type: "rental", price: 75000, area: 1600, city: "Hyderabad",
    address: "Madhapur, Near Mindspace", location: "Prime Tech Corridor",
    lat: 17.4483, lng: 78.3915,
    description: "A very well maintained 3 BHK apartment offering a fantastic view of the Hyderabad IT sector skyline. Fully furnished with modular Italian kitchen, premium leather sofas, and an extra-large balcony. 2 mins walk to Mindspace Tech Park.",
    query: "modern executive apartment balcony view high rise"
  },
  {
    title: "Banjara Hills Boutique Apartment", type: "sell", price: 42000000, area: 2500, city: "Hyderabad",
    address: "Road No 12, Banjara Hills", location: "Historic Elite Neighborhood",
    lat: 17.4105, lng: 78.4398,
    description: "A serene 3 BHK boutique apartment in a low-density project. Features massive wrap-around balconies, teak interiors, a smart-security system, and a quiet, peaceful environment despite being in the heart of the city.",
    query: "boutique luxury low rise apartment interior teak wood"
  },
  {
    title: "Boat Club Road Ultra Luxury", type: "sell", price: 120000000, area: 4200, city: "Chennai",
    address: "Boat Club Road, R A Puram", location: "The most prestigious zip code in Chennai",
    lat: 13.0270, lng: 80.2559,
    description: "A very rare 4 BHK independent luxury floor in Chennai's most heavily guarded and prestigious Boat Club area. Boasts massive open spaces, central AC, 100% power backup, and unparalleled privacy wrapped in dense foliage.",
    query: "luxury independent floor modern architecture foliage trees private"
  }
];

const DatabaseSeeder = () => {
  const { currentUser } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateImagesForProperty = (queryPhrase) => {
    // Generate 3 unique images using Pollinations AI based on the core property aesthetic
    const keywords = [
      `${queryPhrase} architectural digest cinematic lighting 8k`,
      `${queryPhrase} modern interior beautiful natural light wide angle`,
      `${queryPhrase} beautiful bedroom minimalist aesthetic 4k`
    ];
    return keywords.map(kw => 
      `https://image.pollinations.ai/prompt/${encodeURIComponent(kw)}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 999999)}`
    );
  };

  const handleMassSeed = async () => {
    if (!window.confirm("WARNING: This will inject 15+ massive AI-generated properties into your live database. Continue?")) return;
    
    setSeeding(true);
    setProgress(0);
    const propertiesRef = collection(db, 'properties');

    try {
      for (let i = 0; i < MOCK_PROPERTIES.length; i++) {
        const prop = MOCK_PROPERTIES[i];
        
        // 1. Generate 3 AI Photos dynamically
        const generatedPhotos = generateImagesForProperty(prop.query);

        // 2. Prepare payload
        const payload = {
          title: prop.title,
          description: prop.description,
          type: prop.type,
          price: prop.price,
          area: prop.area,
          address: prop.address,
          city: prop.city,
          location: prop.location,
          lat: prop.lat,
          lng: prop.lng,
          photos: generatedPhotos,
          ownerId: currentUser.uid, // You own them, making deletion easy!
          status: 'approved',       // Instantly bypasses the queue!
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        // 3. Inject to Firestore
        await addDoc(propertiesRef, payload);
        
        // 4. Update Progress
        setProgress(((i + 1) / MOCK_PROPERTIES.length) * 100);
      }
      
      toast.success('Mass Seeding Complete! 15+ Properties Added!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to seed some properties. Check console.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div style={{ paddingTop: '70px', background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', maxWidth: '600px', width: '90%', textAlign: 'center' }}>
        
        <div style={{ width: 80, height: 80, borderRadius: '24px', background: 'linear-gradient(135deg, #674df0, #4b36c4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 25px rgba(103,77,240,0.3)' }}>
          <Database size={36} color="#fff" />
        </div>

        <h1 style={{ fontFamily: 'Outfit', fontSize: '2.2rem', fontWeight: 800, color: '#1a2e4a', marginBottom: '1rem' }}>AI Database Seeder</h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Instantly populate your application with beautiful, diverse, and highly realistic real estate data. 
          This script will generate <strong>15 premium properties</strong> across 5 major Indian cities, completely filled with Pollinations AI-generated imagery and professional descriptions.
        </p>

        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', textAlign: 'left', marginBottom: '2rem' }}>
          <AlertTriangle size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: '#9a3412', fontWeight: 700, margin: '0 0 0.25rem' }}>Admin Notice</h4>
            <p style={{ color: '#c2410c', fontSize: '0.85rem', margin: 0 }}>These properties will be assigned to your account and instantly marked as "Approved", flooding the live home page with content.</p>
          </div>
        </div>

        {seeding && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
              <span>Generating AI Assets & Submitting...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div style={{ width: '100%', height: 12, background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #674df0, #8975f5)', transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        <button 
          onClick={handleMassSeed}
          disabled={seeding}
          style={{ 
            width: '100%', padding: '1.25rem', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', fontSize: '1.1rem', fontWeight: 700, cursor: seeding ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            boxShadow: '0 8px 20px rgba(16,185,129,0.3)', transition: 'transform 0.2s', opacity: seeding ? 0.7 : 1
          }}
          onMouseOver={e => !seeding && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={e => !seeding && (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {seeding ? (
            <><Loader2 size={20} className="spin" /> Seeding Database...</>
          ) : (
            <><CheckCircle size={20} /> Initialize Database Mass-Seed</>
          )}
        </button>

      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DatabaseSeeder;
