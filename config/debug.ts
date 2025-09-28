// Debug helper to check environment variables
export const debugEnvVars = () => {
  console.log("=== Environment Variables Debug ===");
  console.log(
    "EXPO_PUBLIC_FIREBASE_API_KEY:",
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? "SET" : "MISSING"
  );
  console.log(
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:",
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? "SET" : "MISSING"
  );
  console.log(
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID:",
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? "SET" : "MISSING"
  );
  console.log(
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:",
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ? "SET" : "MISSING"
  );
  console.log(
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:",
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "SET" : "MISSING"
  );
  console.log(
    "EXPO_PUBLIC_FIREBASE_APP_ID:",
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? "SET" : "MISSING"
  );
  console.log("=== End Debug ===");
};

// Call this to debug
if (__DEV__) {
  debugEnvVars();
}
