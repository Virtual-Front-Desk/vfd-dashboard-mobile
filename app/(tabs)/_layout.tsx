import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          display: "none",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "",
        }}
      />
    </Tabs>
  );
}