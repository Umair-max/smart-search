import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { Auth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";
import "./debug"; // Import debug helper

// Firebase configuration object using environment variables
const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyCN3p78vHaR2UERtcMS4JPqVp0SjFxBJpE",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "smart-search-ba916.firebaseapp.com",
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "smart-search-ba916",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "smart-search-ba916.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1056772382407",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    "1:1056772382407:web:d37b14980edaba6fa0a8e2",
};

// Validate Firebase configuration
const validateConfig = () => {
  const requiredFields = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];

  const missing = requiredFields.filter(
    (field) => !firebaseConfig[field as keyof typeof firebaseConfig]
  );

  if (missing.length > 0) {
    console.error("Missing Firebase configuration:", missing);
    console.error("Current config:", firebaseConfig);
    throw new Error(
      `Missing Firebase configuration fields: ${missing.join(", ")}`
    );
  }
};

// Validate configuration before initializing
validateConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
// For Expo with Firebase v12, use initializeAuth with getReactNativePersistence
console.log("Initializing Firebase Auth with AsyncStorage persistence...");
const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore
const db: Firestore = getFirestore(app);

// Initialize Firebase Storage
const storage: FirebaseStorage = getStorage(app);

export { auth, db, storage };
export default app;
