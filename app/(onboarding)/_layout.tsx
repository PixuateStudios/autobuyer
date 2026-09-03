import { useAuth } from "@/lib/auth";
import { Redirect, Stack } from "expo-router";

export default function Layout() {
  const { user, ready } = useAuth();

  if (!ready) {
    return null;
  }

  if (user) {
    return <Redirect href="/home" />;
  }

  return (
    <Stack>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}
