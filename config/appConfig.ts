/**
 * Environment configuration utility
 * Validates and provides typed access to environment variables
 */

interface AppConfig {
  // Firebase Configuration
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };

  // Admin Configuration
  admin: {
    email: string;
  };
}

class ConfigService {
  private static instance: AppConfig | null = null;

  /**
   * Get validated configuration
   */
  static getConfig(): AppConfig {
    if (!this.instance) {
      this.instance = this.validateAndCreateConfig();
    }
    return this.instance;
  }

  /**
   * Validate and create configuration from environment variables
   */
  private static validateAndCreateConfig(): AppConfig {
    const missingVars: string[] = [];

    // Firebase configuration
    const firebaseConfig = {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    };

    // Check for missing Firebase variables
    Object.entries(firebaseConfig).forEach(([key, value]) => {
      if (!value) {
        missingVars.push(`EXPO_PUBLIC_FIREBASE_${key.toUpperCase()}`);
      }
    });

    // Admin configuration with fallback
    const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL || "";

    if (!process.env.EXPO_PUBLIC_ADMIN_EMAIL) {
      console.warn(
        "⚠️  EXPO_PUBLIC_ADMIN_EMAIL not set, using default admin email"
      );
    }

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}\n` +
          "Please check your .env file and ensure all required variables are set."
      );
    }

    console.log("✅ Environment configuration validated successfully");
    console.log(`📧 Admin email: ${adminEmail}`);

    return {
      firebase: firebaseConfig as AppConfig["firebase"],
      admin: {
        email: adminEmail,
      },
    };
  }

  /**
   * Get admin email
   */
  static getAdminEmail(): string {
    return this.getConfig().admin.email;
  }

  /**
   * Check if an email is the admin email
   */
  static isAdminEmail(email: string): boolean {
    return email === this.getAdminEmail();
  }

  /**
   * Get Firebase configuration
   */
  static getFirebaseConfig(): AppConfig["firebase"] {
    return this.getConfig().firebase;
  }
}

export default ConfigService;
