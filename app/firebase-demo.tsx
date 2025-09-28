import { LoginScreen } from "@/components/auth/LoginScreen";
import { UserProfile } from "@/components/auth/UserProfile";
import { FileUpload } from "@/components/storage/FileUpload";
import { useAuth } from "@/contexts/AuthContext";
import { FirestoreService, Post } from "@/services/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FirebaseDemo() {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (user) {
      // Load some example posts
      loadPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    try {
      const recentPosts = await FirestoreService.getCollection<Post>(
        "posts",
        "createdAt",
        "desc",
        5
      );
      setPosts(recentPosts);
    } catch (error) {
      console.log("No posts found or error loading posts");
    }
  };

  const createSamplePost = async () => {
    if (!user) return;

    try {
      const samplePost: Omit<Post, "id" | "createdAt" | "updatedAt"> = {
        title: "Sample Post",
        content: "This is a sample post created from the Firebase demo!",
        authorId: user.uid,
        authorName: user.displayName || user.email || "Anonymous",
        published: true,
        likes: 0,
        tags: ["firebase", "demo", "sample"],
      };

      const postId = await FirestoreService.addDocument("posts", samplePost);
      Alert.alert("Success", `Post created with ID: ${postId}`);
      loadPosts(); // Refresh posts
    } catch (error) {
      Alert.alert("Error", "Failed to create post");
      console.error("Error creating post:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <LoginScreen
          isSignUp={isSignUp}
          onToggleMode={() => setIsSignUp(!isSignUp)}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Firebase Demo</Text>

      {/* User Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication</Text>
        <UserProfile />
      </View>

      {/* Firestore Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Firestore Database</Text>
        <TouchableOpacity style={styles.button} onPress={createSamplePost}>
          <Text style={styles.buttonText}>Create Sample Post</Text>
        </TouchableOpacity>

        {posts.length > 0 && (
          <View style={styles.postsContainer}>
            <Text style={styles.subsectionTitle}>Recent Posts:</Text>
            {posts.map((post, index) => (
              <View key={post.id || index} style={styles.postItem}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postAuthor}>by {post.authorName}</Text>
                <Text style={styles.postContent}>{post.content}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Storage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Firebase Storage</Text>
        <FileUpload
          uploadType="avatar"
          onUploadComplete={(url) => {
            Alert.alert("Success", "Avatar uploaded successfully!");
            console.log("Avatar URL:", url);
          }}
          onUploadError={(error) => {
            Alert.alert("Upload Error", error);
          }}
        />
      </View>

      <View style={styles.section}>
        <FileUpload
          uploadType="image"
          onUploadComplete={(url) => {
            Alert.alert("Success", "Image uploaded successfully!");
            console.log("Image URL:", url);
          }}
          onUploadError={(error) => {
            Alert.alert("Upload Error", error);
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  section: {
    marginBottom: 30,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  postsContainer: {
    marginTop: 15,
  },
  postItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  postAuthor: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 6,
  },
  postContent: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
});
