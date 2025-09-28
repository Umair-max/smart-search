# Firebase Setup Guide for Expo React Native

This guide will help you complete the Firebase setup for your Expo React Native app with Authentication, Firestore, and Storage.

## 🔧 What's Already Done

✅ **Dependencies Installed:**

- `firebase` v12.3.0 - Firebase JavaScript SDK (recommended for Expo Go)
- `expo-image-picker` - For file uploads

**Note:** We're using **Firebase JS SDK only** (not React Native Firebase) for maximum compatibility with Expo Go and universal apps (iOS, Android, Web).

✅ **Project Structure Created:**

```
├── config/
│   └── firebase.ts              # Firebase configuration
├── contexts/
│   └── AuthContext.tsx          # Authentication context & hooks
├── components/
│   ├── auth/
│   │   ├── LoginScreen.tsx      # Login/signup component
│   │   └── UserProfile.tsx      # User profile component
│   └── storage/
│       └── FileUpload.tsx       # File upload component
├── services/
│   ├── firestore.ts             # Firestore CRUD operations
│   └── storage.ts               # Storage operations
└── app/
    ├── _layout.tsx              # Root layout with AuthProvider
    └── firebase-demo.tsx        # Demo screen showcasing features
```

## 🚀 Next Steps to Complete Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Follow the setup wizard:
   - Enter project name (e.g., "smart-search-app")
   - Choose whether to enable Google Analytics
   - Select or create Google Analytics account (if enabled)

### 2. Add Your App to Firebase

#### For Web/Expo Go:

1. In Firebase Console, click "Add app" → Web (</>) icon
2. Register your app:
   - App nickname: "smart-search-web"
   - Check "Also set up Firebase Hosting" (optional)
3. Copy the Firebase config object

#### For iOS (if building standalone):

1. Click "Add app" → iOS icon
2. Enter iOS bundle ID (from your app.json)
3. Download `GoogleService-Info.plist`

#### For Android (if building standalone):

1. Click "Add app" → Android icon
2. Enter Android package name (from your app.json)
3. Download `google-services.json`

### 3. Configure Firebase Services

#### Enable Authentication:

1. Go to "Authentication" → "Sign-in method"
2. Enable Email/Password provider
3. Optionally enable other providers (Google, Facebook, etc.)

#### Set up Firestore Database:

1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (for development)
3. Select a location closest to your users

#### Set up Storage:

1. Go to "Storage" → "Get started"
2. Choose "Start in test mode"
3. Select same location as Firestore

### 4. Update Environment Variables

Update the `.env` file with your actual Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-actual-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-actual-app-id
```

### 5. Test the Integration

1. Start your development server:

   ```bash
   npm start
   # or
   npx expo start
   ```

2. Navigate to the Firebase Demo screen to test:
   - User authentication (sign up/sign in)
   - Firestore database operations
   - File uploads to Firebase Storage

## 📱 Usage Examples

### Authentication

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, signIn, signUp, signOut } = useAuth();

  // Sign up new user
  await signUp("email@example.com", "password", "Display Name");

  // Sign in existing user
  await signIn("email@example.com", "password");

  // Sign out
  await signOut();
}
```

### Firestore Operations

```typescript
import { FirestoreService } from "@/services/firestore";

// Add document
const docId = await FirestoreService.addDocument("posts", {
  title: "My Post",
  content: "Post content...",
});

// Get documents
const posts = await FirestoreService.getCollection("posts");

// Query documents
const userPosts = await FirestoreService.queryDocuments(
  "posts",
  "authorId",
  "==",
  userId
);
```

### File Upload

```typescript
import { FileUpload } from "@/components/storage/FileUpload";

<FileUpload
  uploadType="avatar"
  onUploadComplete={(downloadURL) => {
    console.log("File uploaded:", downloadURL);
  }}
  onUploadError={(error) => {
    console.error("Upload failed:", error);
  }}
/>;
```

## 🔒 Security Rules (Important!)

### Firestore Security Rules

Replace the default rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Posts are readable by anyone, writable by authenticated users
    match /posts/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Security Rules

Update in Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload to their own folders
    match /avatars/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /posts/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🛠 Additional Features You Can Add

- **Email Verification**: Use `sendEmailVerification()`
- **Password Reset**: Use `sendPasswordResetEmail()`
- **Social Login**: Configure Google, Facebook, Twitter providers
- **Real-time Updates**: Use Firestore listeners for live data
- **Offline Support**: Firestore works offline automatically
- **Push Notifications**: Add Firebase Cloud Messaging

## 🐛 Troubleshooting

### Common Issues:

1. **"Firebase not initialized"**

   - Check your environment variables are correct
   - Ensure `.env` is not in `.gitignore`

2. **"Permission denied" errors**

   - Update Firestore/Storage security rules
   - Check user is authenticated before operations

3. **Image picker not working**
   - Ensure permissions are granted
   - Check device has camera/photo library access

### Testing in Different Environments:

- **Expo Go**: Works with web config only
- **Development Build**: Requires native Firebase SDK setup
- **Production**: Configure both web and native configs

## 📚 Documentation Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
- [React Native Firebase](https://rnfirebase.io/)

Need help? Check the Firebase Console for detailed error messages and logs.
