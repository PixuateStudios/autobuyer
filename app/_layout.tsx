//Imports
import { IncomingCallOverlay } from "@/components/IncomingCallOverlay";
import { AuthProvider } from "@/lib/auth";
import { BuyerProvider } from "@/lib/buyerProfile";
import { CallProvider } from "@/lib/calling";
import "@/lib/callBackground";
import { ChatProvider } from "@/lib/chat";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  //Load Fonts 
  const [loaded] = useFonts({
    "Funnel_ExtraBold": require("../assets/fonts/FunnelDisplay-ExtraBold.ttf"),
    "Funnel_SemiBold": require("../assets/fonts/FunnelDisplay-SemiBold.ttf"),
    "800": require("../assets/fonts/Inter_800.ttf"),
    "700": require("../assets/fonts/Inter_700.ttf"),
    "600": require("../assets/fonts/Inter_600.ttf"),
    "400": require("../assets/fonts/Inter_400.ttf"),
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
    <AuthProvider>
      <BuyerProvider>
        <ChatProvider>
          <CallProvider>
            <View style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen
                name="(auth)"
                options={{ headerShown: false, animation: "fade" }}
              />
              <Stack.Screen
                name="(onboarding)"
                options={{ headerShown: false, animation: "fade" }}
              />
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false, animation: "fade" }}
              />
              <Stack.Screen
                name="profile-edit"
                options={{ headerShown: false, animation: "slide_from_bottom", presentation: "modal" }}
              />
              <Stack.Screen
                name="preference-edit"
                options={{ headerShown: false, animation: "slide_from_bottom", presentation: "modal" }}
              />
              <Stack.Screen
                name="interest-edit"
                options={{ headerShown: false, animation: "slide_from_bottom", presentation: "modal" }}
              />
              <Stack.Screen name="chat-new" options={{ headerShown: false, animation: "slide_from_bottom", presentation: "modal" }} />
              <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="call/[id]" options={{ headerShown: false, animation: "fade", gestureEnabled: false }} />
            </Stack>
            <IncomingCallOverlay />
            </View>
          </CallProvider>
        </ChatProvider>
      </BuyerProvider>
    </AuthProvider>
  );
}


export const globalStyles = StyleSheet.create({
  h1: {
    fontSize: 30,
    color: "black",
    fontFamily: "700",
  },

  h2: {
    fontSize: 24,
    color: "black",
    fontFamily: "700",
  },

  h3: {
    fontSize: 18,
    color: "black",
    fontFamily: "600",
  },

  h4: {
    fontSize: 16,
    color: "black",
    fontFamily: "400",
  },

  h5: {
    fontSize: 13,
    color: "black",
    fontFamily: "400",
  },

  h6: {
    fontSize: 12,
    color: "black",
    fontFamily: "400",
  },
  
  funnelExtraBold: {
    fontSize: 20, 
    color:"black",
    fontFamily: "Funnel_ExtraBold"
  },
  
  funnelSemiBold: {
    fontSize: 20, 
    color:"black",
    fontFamily: "Funnel_SemiBold"
  }

});
