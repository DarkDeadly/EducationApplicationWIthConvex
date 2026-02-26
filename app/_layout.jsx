// app/_layout.tsx
import { api } from "@/convex/_generated/api";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ConvexReactClient, useConvexAuth, useQuery } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
function Root() {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const user = useQuery(api.users.getUserByClerkId);

    if (isLoading || (isAuthenticated && user === undefined)) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* 1. We ALWAYS keep these screens defined so the Router doesn't get lost */}
            <Stack.Screen name="(auth)" redirect={isAuthenticated} />
            
            {/* 2. We protect the internal groups by only rendering them if the role matches */}
            {isAuthenticated && user?.role === "pupil" && (
                <Stack.Screen name="(pupil)" options={{ title: 'Pupil Dashboard' }} />
            )}
            
            {isAuthenticated && user?.role === "teacher" && (
                <Stack.Screen name="(teacher)" options={{ title: 'Teacher Dashboard' }} />
            )}

            {isAuthenticated && user?.role === "admin" && (
                <Stack.Screen name="(admin)" options={{ title: 'Admin Dashboard' }} />
            )}

            {/* 3. Safety Check: If logged in but role is missing, we could show a 'Complete Profile' screen */}
        </Stack>
    );
}
export default function RootLayout() {
  const convex  = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL)
  return (
    
      <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <Root />
        </ConvexProviderWithClerk>
      </ClerkProvider>
   
  );
}