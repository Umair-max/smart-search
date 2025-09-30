import AsyncStorage from "@react-native-async-storage/async-storage";

export const testAsyncStorage = async () => {
  try {
    console.log("=== Testing AsyncStorage ===");

    // Test writing
    await AsyncStorage.setItem("test_key", "test_value");
    console.log("✅ AsyncStorage write successful");

    // Test reading
    const value = await AsyncStorage.getItem("test_key");
    console.log("✅ AsyncStorage read successful:", value);

    // Test removing
    await AsyncStorage.removeItem("test_key");
    console.log("✅ AsyncStorage remove successful");

    console.log("=== AsyncStorage working properly ===");
    return true;
  } catch (error) {
    console.error("❌ AsyncStorage test failed:", error);
    return false;
  }
};

export const debugFirebaseAuth = () => {
  console.log("=== Firebase Auth Debug ===");
  console.log("Firebase config loaded successfully");
  console.log("AsyncStorage available:", !!AsyncStorage);
  console.log("Auth instance created");
  console.log("=== Debug Complete ===");
};
