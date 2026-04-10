import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Page_1, Page_2, Page_3, Page_4 } from "./pages/info";
import { useState } from "react";
import { Image } from "expo-image";
import { globalStyles } from "../_layout";

export default function Onboarding() {
  
  //States 
  const [currentPage, setCurrentPage] = useState(1)
  const pages = {
    1: <Page_1 setCurrentPage={setCurrentPage}/>,
    2: <Page_2 setCurrentPage={setCurrentPage} />,
    3: <Page_3 setCurrentPage={setCurrentPage} />,
    4: <Page_4 setCurrentPage={setCurrentPage}/>,
  }
  
  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        
        display: "flex",
        justifyContent: "center",
        alignItems:"center"
      }}
    >
      <SafeAreaView style={onboardingStyles.onboardingPage}>
        
        {/*Logo*/}
        <View style={{ width: "100%", marginBottom: 30, display:"flex", flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
          <Image
            tintColor={"#00E567"}
            source={require("@/assets/icons/company/tire.svg")}
            placeholder={"tire"}
            style={{ width: 25, height: 25}}
            contentFit="contain"
          />
          
          <Text style={[globalStyles.funnelSemiBold, {textAlign:"center", fontSize: 24, color:"#00E567"}]}>
            autoquest
          </Text>
          
        </View>
        
        {
          pages[currentPage]
        }
        
      </SafeAreaView>
      
        

    </View>
  );
}



export const styles = StyleSheet.create({

})

export const onboardingStyles = StyleSheet.create({
  
  onboardingPage: {
    width: "100%",
    height: "100%",
    
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    
    padding: 20

    
  },
  
  footer: {
    width: "100%",
    height: 150,
    
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems:"center"
  },
  
  nextButton: {
    width: "100%",
    height: 58,
    
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    
    backgroundColor: "#00E567",
    borderRadius: 12
  },
  
  previewWindow: {
    width: "100%",
    
    borderRadius: 25,
    backgroundColor: "#CFE4FF",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    
    overflow:"hidden"
  }
  
})