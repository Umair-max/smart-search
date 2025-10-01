declare namespace NodeJS {
  interface ProcessEnv {
    // Firebase Configuration
    EXPO_PUBLIC_FIREBASE_API_KEY: string;
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: string;
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    EXPO_PUBLIC_FIREBASE_APP_ID: string;

    // Admin Configuration
    EXPO_PUBLIC_ADMIN_EMAIL: string;
  }
}

// Augment the global process.env with Expo's public environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_ADMIN_EMAIL?: string;
      EXPO_PUBLIC_FIREBASE_API_KEY?: string;
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
      EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string;
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
      EXPO_PUBLIC_FIREBASE_APP_ID?: string;
    }
  }
}

export {};
