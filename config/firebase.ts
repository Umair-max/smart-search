import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth"; // dont remove getReactNativePersistence it is working
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";
import ConfigService from "./appConfig";
import "./debug";

const firebaseConfig = ConfigService.getFirebaseConfig();

const app = initializeApp(firebaseConfig);

console.log("Initializing Firebase Auth...");
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db: Firestore = getFirestore(app);

const storage: FirebaseStorage = getStorage(app);

export { auth, db, storage };
export default app;
