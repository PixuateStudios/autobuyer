import { useAuth } from "@/lib/auth";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { user, ready } = useAuth();

  if (!ready) {
    return null;
  }

  if (user) {
    return <Redirect href="/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
