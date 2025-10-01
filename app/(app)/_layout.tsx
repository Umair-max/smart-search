import AuthGuard from "@/components/AuthGuard";
import { Stack } from "expo-router";
import React from "react";

export default function AppLayout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="import" options={{ headerShown: false }} />
        <Stack.Screen
          name="manage-permissions"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="details" options={{ headerShown: false }} />
      </Stack>
    </AuthGuard>
  );
}
