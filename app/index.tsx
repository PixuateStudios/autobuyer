import { Image } from "expo-image";
import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function Splash() {
  return (
    <SafeAreaView
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#00E567",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Image
          source={require("@/assets/icons/company/tire.svg")}
          placeholder={"tire"}
          style={{ width: 58, height: 67 }}
          contentFit="contain"
        />
      </View>
    </SafeAreaView>
  );
}

export default function Index() {
  const { user, ready } = useAuth();

  if (!ready) {
    return <Splash />;
  }

  if (user) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/onboarding" />;
}
