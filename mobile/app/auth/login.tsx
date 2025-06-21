// filepath: e:\hackathon projects\Zentry\mobile\app\auth\login.tsx
import { View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useSignIn } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TextInput } from "@/components/ui/TextInput";
import { authStyles } from "@/constants/auth.styles";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, setActive } = useSignIn();

  const onSignInPress = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!signIn) {
        throw new Error("Sign in client not available");
      }

      const result = await signIn.create({
        identifier: email,
        password,
      });

      await setActive({ session: result.createdSessionId });
      router.replace("../(tabs)");
    } catch (err: any) {
      console.error("Error signing in:", err);
      setError(err.errors?.[0]?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ThemedView style={authStyles.container}>
        <ThemedText style={authStyles.logoText}>ZENTRY</ThemedText>

        <View style={authStyles.lockIconContainer}>
          {/* You can optionally add a lock icon here */}
        </View>

        <ThemedText style={authStyles.formTitle}>Sign In</ThemedText>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={authStyles.input}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={authStyles.input}
        />

        {error ? (
          <ThemedText >{error}</ThemedText>
        ) : null}

        <TouchableOpacity
          style={[authStyles.button, loading && { opacity: 0.6 }]}
          onPress={onSignInPress}
          disabled={loading}
        >
          <ThemedText style={authStyles.buttonText}>
            {loading ? "Signing in..." : "Sign In"}
          </ThemedText>
        </TouchableOpacity>

        <View style={authStyles.footerText}>
          <ThemedText style={authStyles.footerText}>
            Don’t have an account?{" "}
            <ThemedText
              onPress={() => router.push("./signup")}
              style={authStyles.footerLink}
            >
              Create one
            </ThemedText>
          </ThemedText>
        </View>
      </ThemedView>
    </KeyboardAwareScrollView>
  );
}
