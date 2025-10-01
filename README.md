# Smart Search - Medical Supplies Management App 🏥

This is a React Native application built with [Expo](https://expo.dev) for managing medical supplies with user authentication, permissions, and inventory tracking.

## Features

- 🔐 **User Authentication** - Firebase Auth with email/password
- 👥 **Multi-user System** - Admin and staff roles with different permissions
- 📦 **Inventory Management** - Add, edit, delete medical supplies
- 📅 **Expiry Tracking** - Monitor expiration dates with alerts
- 🖼️ **Image Management** - Photo upload with automatic compression
- 🔍 **Search & Filter** - Find items quickly
- 📊 **Dashboard Analytics** - Overview of inventory status

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```bash
# Firebase Configuration (from your Firebase console)
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Configuration
EXPO_PUBLIC_ADMIN_EMAIL=your_admin_email@example.com
```

### 3. Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Enable Storage
5. Copy your configuration values to the `.env` file

### 4. Start the App

```bash
npx expo start
```

## User Roles & Permissions

### Admin User

- Email configured in `EXPO_PUBLIC_ADMIN_EMAIL`
- Full access to all features
- Can manage user permissions
- Can block/unblock users
- Cannot be blocked by other admins

### Staff Users

- All other registered users
- Permissions controlled by admin:
  - **Edit Permission**: Can modify existing items
  - **Upload Permission**: Can add new items and images
- Can be blocked by admin

## Project Structure

```
├── app/                    # App router screens
│   ├── (auth)/            # Authentication screens
│   ├── (app)/             # Protected app screens
│   └── (tabs)/            # Tab navigation screens
├── components/            # Reusable UI components
├── config/               # Configuration files
│   ├── firebase.ts       # Firebase configuration
│   └── appConfig.ts      # Environment config management
├── hooks/                # Custom React hooks
├── services/             # Business logic services
├── store/                # Zustand state management
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Key Technologies

- **React Native** + **Expo** - Mobile app framework
- **TypeScript** - Type safety
- **Firebase** - Authentication, Firestore, Storage
- **Zustand** - State management
- **Expo Router** - File-based navigation
- **Expo Image Picker** - Camera/gallery access
- **Expo Image Manipulator** - Image compression

## Development Commands

```bash
# Start development server
npx expo start

# Type checking
npx tsc --noEmit

# Reset to fresh project
npm run reset-project
```

## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/)
- [Firebase documentation](https://firebase.google.com/docs)
