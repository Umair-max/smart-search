import { initializeApp } from "firebase/app";
import { Auth, initializeAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";
import ConfigService from "./appConfig";
import "./debug"; // Import debug helper

// Get validated Firebase configuration
const firebaseConfig = ConfigService.getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
// For Expo with Firebase v12, use initializeAuth
console.log("Initializing Firebase Auth...");
const auth: Auth = initializeAuth(app);

// Initialize Firestore
const db: Firestore = getFirestore(app);

// Initialize Firebase Storage
const storage: FirebaseStorage = getStorage(app);

export { auth, db, storage };
export default app;
