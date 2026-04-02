import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCWcuwpAR_aWGe9w3_n7PAgLy8DVPdfM_g",
  authDomain: "house-3035d.firebaseapp.com",
  projectId: "house-3035d",
  storageBucket: "house-3035d.firebasestorage.app",
  messagingSenderId: "944056320567",
  appId: "1:944056320567:web:60c0f06f74cc5c9d6c35b2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MOCK_PROPERTIES = [
  {
    title: "The Imperial Sky Villa", type: "sell", price: 185000000, area: 4500, city: "Mumbai",
    address: "Bandra West, Mount Mary Road", location: "Premium sea-facing luxury",
    lat: 19.0467, lng: 72.8213,
    description: "Experience unparalleled luxury in this breathtaking 4 BHK sea-facing sky villa in Bandra West. Featuring floor-to-ceiling glass windows.",
    query: "luxury penthouse sea view balcony modern architecture"
  },
  {
    title: "Lodha Bellissimo Apartment", type: "rental", price: 210000, area: 2200, city: "Mumbai",
    address: "Mahalaxmi, South Mumbai", location: "Heart of South Bombay",
    lat: 18.9827, lng: 72.8267,
    description: "Spacious and fully furnished 3 BHK apartment in the iconic Lodha Bellissimo tower. Comes with premium wooden decking.",
    query: "modern luxury apartment living room interior design bright"
  },
  {
    title: "Prestige Golfshire Villa", type: "sell", price: 85000000, area: 5500, city: "Bengaluru",
    address: "Nandi Hills Road, Devanahalli", location: "Quiet residential golf estate",
    lat: 13.2435, lng: 77.6841,
    description: "An ultra-luxury 4 BHK independent villa nestled within an 18-hole championship golf course.",
    query: "luxury independent villa grass lawn golf course twilight architecture"
  },
  {
    title: "Tech Park Studio Apartment", type: "rental", price: 35000, area: 650, city: "Bengaluru",
    address: "Whitefield, ITPL Main Rd", location: "Prime IT Hub",
    lat: 12.9850, lng: 77.7335,
    description: "Fully furnished modern studio apartment right opposite ITPL in Whitefield. Perfect for IT professionals.",
    query: "modern studio apartment cozy interior workstation"
  },
  {
    title: "DLF Magnolias Signature Suite", type: "sell", price: 240000000, area: 6800, city: "Gurgaon",
    address: "Golf Course Road, Sector 42", location: "Ultra-Premium Golf Community",
    lat: 28.4552, lng: 77.0934,
    description: "The epitome of luxury living in Delhi-NCR. This massive 5 BHK apartment offers front-row views of the DLF Golf Course.",
    query: "ultra luxury living room mansion interior golf course view"
  },
  {
    title: "Cyber City Corporate Condo", type: "rental", price: 95000, area: 1800, city: "Gurgaon",
    address: "DLF Phase 2, Near Cyberhub", location: "Bustling corporate hub",
    lat: 28.4876, lng: 77.0890,
    description: "Premium 3 BHK condo located a stone's throw away from Cyber Hub. Features contemporary decor.",
    query: "contemporary modern condo interior beautiful lighting"
  },
  {
    title: "Vasant Vihar Independent Floor", type: "sell", price: 140000000, area: 4000, city: "Delhi",
    address: "Block A, Vasant Vihar", location: "Diplomatic Area",
    lat: 28.5603, lng: 77.1610,
    description: "A rare brand new 4 BHK builder floor in the highly coveted Vasant Vihar block. Features massive stilt parking.",
    query: "luxury independent builder floor exterior architecture"
  },
  {
    title: "Koregaon Park Artisan Villa", type: "rental", price: 150000, area: 3200, city: "Pune",
    address: "Lane 5, Koregaon Park", location: "Greenest and most elite suburb",
    lat: 18.5362, lng: 73.8939,
    description: "A stunning masterpiece 3 BHK heritage-style villa in KP. Surrounded by 100-year old banyan trees.",
    query: "heritage style luxury villa exterior courtyard overgrown greenery"
  },
  {
    title: "Amanora Gateway Towers", type: "sell", price: 34000000, area: 2100, city: "Pune",
    address: "Amanora Park Town, Hadapsar", location: "Premium Township",
    lat: 18.5195, lng: 73.9392,
    description: "Experience the height of luxury at Swarovski-designed Gateway Towers. This 3 BHK smart apartment comes with automated lighting.",
    query: "swarovski luxury high rise apartment glass facade"
  },
  {
    title: "Jubilee Hills Grand Mansion", type: "sell", price: 380000000, area: 12000, city: "Hyderabad",
    address: "Road No 36, Jubilee Hills", location: "Billionaire's Row",
    lat: 17.4326, lng: 78.4071,
    description: "An unbelievable 6 BHK palatial mansion seated on a huge plot in Jubilee Hills. Features a massive private home theater seating 20.",
    query: "palatial grand mansion exterior luxury estate pool"
  },
  {
    title: "Hitec City Executive Flat", type: "rental", price: 75000, area: 1600, city: "Hyderabad",
    address: "Madhapur, Near Mindspace", location: "Prime Tech Corridor",
    lat: 17.4483, lng: 78.3915,
    description: "A very well maintained 3 BHK apartment offering a fantastic view of the Hyderabad IT sector skyline. Fully furnished with modular Italian kitchen.",
    query: "modern executive apartment balcony view high rise"
  },
  {
    title: "Banjara Hills Boutique Apartment", type: "sell", price: 42000000, area: 2500, city: "Hyderabad",
    address: "Road No 12, Banjara Hills", location: "Historic Elite Neighborhood",
    lat: 17.4105, lng: 78.4398,
    description: "A serene 3 BHK boutique apartment in a low-density project. Features massive wrap-around balconies, teak interiors.",
    query: "boutique luxury low rise apartment interior teak wood"
  }
];

const generateImages = (q) => {
  const seed = Math.floor(Math.random() * 999999);
  return [
    `https://image.pollinations.ai/prompt/${encodeURIComponent(q + ' architectural majestic')}&nologo=true&seed=${seed}`,
    `https://image.pollinations.ai/prompt/${encodeURIComponent(q + ' interior design clean')}&nologo=true&seed=${seed+1}`,
    `https://image.pollinations.ai/prompt/${encodeURIComponent(q + ' beautiful lighting bedroom')}&nologo=true&seed=${seed+2}`
  ];
};

async function seed() {
  console.log("Seeding database...");
  for (const p of MOCK_PROPERTIES) {
    const payload = {
      title: p.title,
      type: p.type,
      price: p.price,
      area: p.area,
      city: p.city,
      address: p.address,
      location: p.location,
      lat: p.lat,
      lng: p.lng,
      description: p.description,
      photos: generateImages(p.query),
      status: 'approved',
      ownerId: 'SystemSeeder',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await addDoc(collection(db, 'properties'), payload);
    console.log(`Added -> ${p.title} (${p.type})`);
  }
  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
