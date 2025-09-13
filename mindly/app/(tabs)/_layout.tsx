import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,                  // hides the top header
        tabBarStyle: { display: 'none' },    // hides the bottom tab bar completely
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}
    >
      {/* Add your screens here */}
      {/* Example:
      <Tabs.Screen name="home" />
      <Tabs.Screen name="profile" />
      */}
    </Tabs>
  );
}
