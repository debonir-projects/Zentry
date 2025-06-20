// app/_layout.tsx or app/providers/_layout.tsx (in your case)
import { Stack, useRouter } from "expo-router";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import Config from "@/constants/Config";

// Clerk token caching
const tokenCache = {
  async getToken(key){
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key, value) {
    return SecureStore.setItemAsync(key, value);
  },
};

// Component to handle redirection for signed-in users
function AuthenticatedRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to root instead of tabs
    router.replace("/(root)");
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0a7ea4" />
    </View>
  );
}

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Short delay to allow Clerk to initialize
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={Config.CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <SignedIn>
        <AuthenticatedRedirect />
      </SignedIn>
      <SignedOut>
        <Stack>
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        </Stack>
      </SignedOut>
    </ClerkProvider>
  );
}
