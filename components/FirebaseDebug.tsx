import { auth } from "@/config/firebase";
import { useAuthStore } from "@/store/authStore";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const FirebaseDebug = () => {
  const { signinUser, loading } = useAuthStore();

  const testFirebaseConnection = async () => {
    console.log("=== Firebase Debug Test ===");
    console.log("Auth instance:", auth);
    console.log("Current user:", auth.currentUser);

    // Test with a dummy email to see what error we get
    try {
      await signinUser({
        email: "test@example.com",
        password: "testpassword123",
      });
    } catch (error) {
      console.log("Test error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Debug</Text>
      <TouchableOpacity onPress={testFirebaseConnection} style={styles.button}>
        <Text style={styles.buttonText}>Test Firebase Connection</Text>
      </TouchableOpacity>
      <Text style={styles.note}>Check console for debug info</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0f0f0",
    margin: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  note: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});

export default FirebaseDebug;
