// filepath: e:\hackathon projects\Zentry\mobile\app\auth\login.tsx
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { useSignIn } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TextInput } from "@/components/ui/TextInput";

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
      // Create a sign-in session
      const result = await signIn.create({
        identifier: email,
        password,
      });

      // Set the session as active
      await setActive({ session: result.createdSessionId });
      
      // Navigate to the home screen
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
      <ThemedView style={styles.container}>
     
        
        <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
        
        <View style={styles.form}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          {error ? (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          ) : null}
          
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onSignInPress}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? "Signing in..." : "Sign In"}
            </ThemedText>
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <ThemedText>Don't have an account? </ThemedText>
            <TouchableOpacity onPress={() => router.push("./signup")}>
              <ThemedText style={styles.link}>Sign Up</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logo: {
    height: 100,
    width: "100%",
    marginBottom: 40,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  button: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  link: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
});