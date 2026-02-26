import { api } from "@/convex/_generated/api"
import { useConvexAuth, useQuery } from "convex/react"
import { Redirect } from "expo-router"
import LottieView from "lottie-react-native"
import { View } from "react-native"

export default function RootApp() {
  const user = useQuery(api.users.getUserByClerkId)
  const { isAuthenticated, isLoading } = useConvexAuth()
  console.log("Authenticated user:", user)

  if (isLoading || (isAuthenticated && !user)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
         <LottieView
      autoPlay
      loop
      
      source={require('../assets/images/Online Learning.json')} // Ensure you have an animation file
    />
      </View>
    )
  }

  if (!isAuthenticated && !user) {
    return <Redirect href="/(auth)" />;
  }

}



