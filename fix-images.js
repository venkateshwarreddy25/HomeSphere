import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

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

// A curated list of extremely high-quality luxury property Unsplash photos
const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
  'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4ea0d?w=800&q=80',
  'https://images.unsplash.com/photo-1600573472591-ee6bfc6f7316?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1613490908236-a7498d281358?w=800&q=80',
  'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80',
  'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&q=80'
];

async function fixImages() {
  console.log("Fetching seeded properties...");
  const propertiesRef = collection(db, 'properties');
  const snap = await getDocs(propertiesRef);
  
  let i = 0;
  for (const document of snap.docs) {
    const data = document.data();
    
    // Always assign an array of 3 reliable images
    const photos = [
      UNSPLASH_IMAGES[i % UNSPLASH_IMAGES.length],
      UNSPLASH_IMAGES[(i + 1) % UNSPLASH_IMAGES.length],
      UNSPLASH_IMAGES[(i + 2) % UNSPLASH_IMAGES.length]
    ];

    await updateDoc(doc(db, 'properties', document.id), { photos });
    console.log(`Updated images for -> ${data.title}`);
    i++;
  }
  
  console.log("Successfully replaced AI image links with lightning-fast Unsplash photos!");
  process.exit(0);
}

fixImages().catch(err => {
  console.error(err);
  process.exit(1);
});
