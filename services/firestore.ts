import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  OrderByDirection,
  query,
  Query,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
  WhereFilterOp,
} from "firebase/firestore";
import { db } from "../config/firebase";

// Generic document interface
export interface FirebaseDocument {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Firestore service class for CRUD operations
export class FirestoreService {
  /**
   * Get a single document by ID
   */
  static async getDocument<T extends FirebaseDocument>(
    collectionName: string,
    docId: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error("Error getting document:", error);
      throw error;
    }
  }

  /**
   * Get all documents from a collection
   */
  static async getCollection<T extends FirebaseDocument>(
    collectionName: string,
    orderByField?: string,
    orderDirection: OrderByDirection = "desc",
    limitCount?: number
  ): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionName);
      let q: Query<DocumentData> | CollectionReference<DocumentData> =
        collectionRef;

      if (orderByField) {
        q = query(collectionRef, orderBy(orderByField, orderDirection));
      }

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error("Error getting collection:", error);
      throw error;
    }
  }

  /**
   * Query documents with conditions
   */
  static async queryDocuments<T extends FirebaseDocument>(
    collectionName: string,
    field: string,
    operator: WhereFilterOp,
    value: any,
    orderByField?: string,
    orderDirection: OrderByDirection = "desc",
    limitCount?: number
  ): Promise<T[]> {
    try {
      let q = query(
        collection(db, collectionName),
        where(field, operator, value)
      );

      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error("Error querying documents:", error);
      throw error;
    }
  }

  /**
   * Add a new document
   */
  static async addDocument<T extends FirebaseDocument>(
    collectionName: string,
    data: Omit<T, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const now = Timestamp.now();
      const docData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, collectionName), docData);
      return docRef.id;
    } catch (error) {
      console.error("Error adding document:", error);
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  static async updateDocument<T extends FirebaseDocument>(
    collectionName: string,
    docId: string,
    data: Partial<Omit<T, "id" | "createdAt">>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(
    collectionName: string,
    docId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }

  /**
   * Listen to real-time updates for a collection
   */
  static subscribeToCollection<T extends FirebaseDocument>(
    collectionName: string,
    callback: (documents: T[]) => void,
    orderByField?: string,
    orderDirection: OrderByDirection = "desc",
    limitCount?: number
  ): Unsubscribe {
    try {
      const collectionRef = collection(db, collectionName);
      let q: Query<DocumentData> | CollectionReference<DocumentData> =
        collectionRef;

      if (orderByField) {
        q = query(collectionRef, orderBy(orderByField, orderDirection));
      }

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      return onSnapshot(q, (querySnapshot) => {
        const documents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        callback(documents);
      });
    } catch (error) {
      console.error("Error subscribing to collection:", error);
      throw error;
    }
  }

  /**
   * Listen to real-time updates for a single document
   */
  static subscribeToDocument<T extends FirebaseDocument>(
    collectionName: string,
    docId: string,
    callback: (document: T | null) => void
  ): Unsubscribe {
    try {
      const docRef = doc(db, collectionName, docId);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() } as T);
        } else {
          callback(null);
        }
      });
    } catch (error) {
      console.error("Error subscribing to document:", error);
      throw error;
    }
  }
}

// Example usage interfaces for common collections
export interface UserData extends FirebaseDocument {
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  preferences?: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

export interface Post extends FirebaseDocument {
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  tags?: string[];
  published: boolean;
  likes?: number;
  comments?: number;
}

// Utility functions for common operations
export const firestoreUtils = {
  // Get user data
  async getUserData(userId: string): Promise<UserData | null> {
    return FirestoreService.getDocument<UserData>("users", userId);
  },

  // Create or update user profile
  async saveUserProfile(
    userId: string,
    userData: Partial<UserData>
  ): Promise<void> {
    const existingUser = await FirestoreService.getDocument<UserData>(
      "users",
      userId
    );

    if (existingUser) {
      await FirestoreService.updateDocument("users", userId, userData);
    } else {
      // For new users, we need to use setDoc instead of addDoc to use custom ID
      const { doc, setDoc } = await import("firebase/firestore");
      const userRef = doc(db, "users", userId);
      const now = Timestamp.now();

      await setDoc(userRef, {
        ...userData,
        createdAt: now,
        updatedAt: now,
      });
    }
  },

  // Get posts by user
  async getUserPosts(userId: string): Promise<Post[]> {
    return FirestoreService.queryDocuments<Post>(
      "posts",
      "authorId",
      "==",
      userId,
      "createdAt",
      "desc"
    );
  },

  // Get recent posts
  async getRecentPosts(limitCount: number = 10): Promise<Post[]> {
    return FirestoreService.getCollection<Post>(
      "posts",
      "createdAt",
      "desc",
      limitCount
    );
  },
};

export default FirestoreService;
