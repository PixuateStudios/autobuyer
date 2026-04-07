//Imports
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { View } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  //Load Fonts 
  const [loaded] = useFonts({
    "Funnel_Bold": require("../assets/fonts/FunnelDisplay-ExtraBold.ttf")
  })
  const [isReady, setIsReady] = useState(true);
  
  useEffect(() => {
    setTimeout(() => setIsReady(true), 3000); // Simulated delay for splash screen

    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  
  if (!isReady) {
    return null;
  }
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="(auth)"
        options={{ headerShown: false, animation: "none" }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
