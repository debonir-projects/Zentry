import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TextInput } from "@/components/ui/TextInput";

export default function SignUpScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp, setActive } = useSignUp();

  const onSignUpPress = async () => {
    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (!signUp) {
      setError("Authentication is not initialized");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create a new user
      const result = await signUp.create({
        username,
        emailAddress: email,
        password,
      });

      // Verify the email address
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      
      // Create a backend user (optional, depending on your backend integration)
      try {
        await fetch('https://zentry-14tu.onrender.com/api/postUser/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        });
      } catch (err) {
        console.log('Backend user creation error (non-fatal):', err);
      }

      // Set the session as active
      await setActive({ session: result.createdSessionId });
      
      // Navigate to the home screen
      router.replace('../(tabs)');
    } catch (err: any) {
      console.error("Error signing up:", err);
      setError(err.errors?.[0]?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ThemedView style={styles.container}>
       
        
        <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
        
        <View style={styles.form}>
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          
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
            onPress={onSignUpPress}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? "Creating Account..." : "Sign Up"}
            </ThemedText>
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <ThemedText>Already have an account? </ThemedText>
            <TouchableOpacity onPress={() => router.push("./login")}>
              <ThemedText style={styles.link}>Sign In</ThemedText>
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