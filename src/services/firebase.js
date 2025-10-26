import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase, ref, onValue, push, update, serverTimestamp } from "firebase/database";

// 1. Load config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

// Debug: Check if Firebase config is loaded
console.log("Firebase Config Check:", {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
  console.error("⚠️ Firebase configuration is missing! Please check your .env file.");
  console.error("Required variables: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.");
}

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 3. Initialize services
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

// 4. Auth helper functions
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// 5. RTDB helper functions
export const dbRef = (path) => ref(rtdb, path);

export const dbPush = (path, data) => {
  const reference = dbRef(path);
  return push(reference, data);
};

export const dbUpdate = (path, data) => {
  const reference = dbRef(path);
  return update(reference, data);
};

export const dbOnValue = (path, callback) => {
  const reference = dbRef(path);
  return onValue(reference, callback);
};

export const getServerTimestamp = () => serverTimestamp();

export default app;
