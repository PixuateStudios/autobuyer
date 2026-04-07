import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#00E567",

        display: "flex",
        justifyContent: "center",
        alignItems:"center"
      }}
    >
      <View style={{ display: "flex", flexDirection:"row", justifyContent:"center", alignItems: "center", width: "100%"}}>

        <Image
          source={require("@/assets/icons/company/tire.svg")}
          placeholder={"tire"}
          style={{ width: 75, height: 75}}
          contentFit="contain"
        />

        {/*<Text style={{fontFamily:"Funnel_Bold", color:'white', fontSize: 40, marginLeft: 10}}>
          autoquest
        </Text>*/}

      </View>


    </SafeAreaView>
  );
}



const styles = StyleSheet.create({



})
