// ============================================================
// 🔥 Firebase Configuration
// ============================================================
// INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a project called "memory-game-study"
// 3. Add a Web App and copy the config below
// 4. Enable Firestore Database (test mode)
// 5. Replace the placeholder values below with your config
// ============================================================

import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT.firebasestorage.app",
//   messagingSenderId: "YOUR_SENDER_ID",
//   appId: "YOUR_APP_ID",
// };

const firebaseConfig = {
  apiKey: "AIzaSyCCwM6KX50IjsVhQXVzxeJTPHYQ5O_Gj3U",
  authDomain: "memory-game-2c276.firebaseapp.com",
  projectId: "memory-game-2c276",
  storageBucket: "memory-game-2c276.firebasestorage.app",
  messagingSenderId: "717644188067",
  appId: "1:717644188067:web:3fed87d6a0ecb1cac77216",
  measurementId: "G-ZRJE076XTW"
};

// Check if Firebase is configured (placeholder = not yet replaced)
const PLACEHOLDER_API_KEY = "YOUR_API_KEY";
export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey !== PLACEHOLDER_API_KEY);
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured()) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export { app, db };
export default firebaseConfig;
