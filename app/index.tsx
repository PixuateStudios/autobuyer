import { Image } from "expo-image";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  
  //Find Desination 
  const [destination, setDestination] = useState(null)
  useEffect(() => {
    
    setTimeout(() => {
      setDestination("(onboarding)/onboarding")
    }, 0); // Simulated delay for splash screen

  }, []);

  
  
  if (!destination)
  {
    
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
            style={{ width: 58, height: 67}}
            contentFit="contain"
          />
  
          
        </View>
          
  
      </SafeAreaView>
    );
  } else 
  {
    return <Redirect href={destination}/>
  }
}



const styles = StyleSheet.create({
  

  
})