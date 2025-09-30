import CustomBottomTab from "@/components/CustomBottomTab";
import DataLoader from "@/components/DataLoader";
import { Tabs } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <DataLoader>
      <Tabs
        initialRouteName="home"
        screenOptions={{ headerShown: false, animation: "none" }}
        tabBar={(props) => <CustomBottomTab {...props} />}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="expiry"
          options={{
            title: "expiry",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
      </Tabs>
    </DataLoader>
  );
}
