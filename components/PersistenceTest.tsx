import { auth } from "@/config/firebase";
import { useAuthStore } from "@/store/authStore";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PersistenceTest = () => {
  const { user, signinUser, logoutUser, loading } = useAuthStore();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  useEffect(() => {
    addResult(`Auth initialized. Current user: ${user ? user.email : "None"}`);
  }, [user]);

  const testLogin = async () => {
    try {
      addResult("Testing login...");
      await signinUser({
        email: "test@example.com",
        password: "password123",
      });
      addResult("Login test completed");
    } catch (error) {
      addResult(`Login failed: ${error}`);
    }
  };

  const testLogout = async () => {
    try {
      addResult("Testing logout...");
      await logoutUser();
      addResult("Logout test completed");
    } catch (error) {
      addResult(`Logout failed: ${error}`);
    }
  };

  const checkCurrentUser = () => {
    addResult(
      `Firebase currentUser: ${
        auth.currentUser ? auth.currentUser.email : "None"
      }`
    );
    addResult(`Store user: ${user ? user.email : "None"}`);
    addResult(
      `Store isAuthenticated: ${useAuthStore.getState().isAuthenticated}`
    );
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Persistence Test</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={testLogin}
          style={styles.button}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testLogout}
          style={styles.button}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={checkCurrentUser} style={styles.button}>
          <Text style={styles.buttonText}>Check User State</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={clearResults}
          style={[styles.button, styles.clearButton]}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    margin: 5,
    minWidth: 80,
  },
  clearButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
  },
  resultsContainer: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
    maxHeight: 200,
  },
  resultsTitle: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5,
  },
  resultText: {
    color: "#00ff00",
    fontSize: 10,
    fontFamily: "Courier",
    marginVertical: 1,
  },
});

export default PersistenceTest;
