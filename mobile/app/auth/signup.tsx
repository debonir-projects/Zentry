import { View, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TextInput } from "@/components/ui/TextInput";
import { signupStyles } from "@/constants/signup.styles"; // ✅ use updated styles here

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
      const result = await signUp.create({
        username,
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      try {
        await fetch("https://zentry-14tu.onrender.com/api/postUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        });
      } catch (err) {
        console.log("Backend user creation error (non-fatal):", err);
      }

      await setActive({ session: result.createdSessionId });
      router.replace("/home");
    } catch (err: any) {
      console.error("Error signing up:", err);
      setError(err.errors?.[0]?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ThemedView style={signupStyles.container}>
        <ThemedText type="title" style={signupStyles.title}>
          Create Account
        </ThemedText>

        {/* Logo below the title */}
        <Image
          source={require("../../assets/logo.png")}
          style={{ width: 300, height: 200, alignSelf: "center", marginVertical: 16 }}
          resizeMode="contain"
        />

        <View style={signupStyles.form}>
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
            <ThemedText style={signupStyles.button}>{error}</ThemedText>
          ) : null}

          <TouchableOpacity
            style={[signupStyles.button, loading && signupStyles.buttonDisabled]}
            onPress={onSignUpPress}
            disabled={loading}
          >
            <ThemedText style={signupStyles.buttonText}>
              {loading ? "Creating Account..." : "Sign Up"}
            </ThemedText>
          </TouchableOpacity>

          <View style={signupStyles.footer}>
            <ThemedText>Already have an account? </ThemedText>
            <TouchableOpacity onPress={() => router.push("./login")}>
              <ThemedText style={signupStyles.link}>Sign In</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </KeyboardAwareScrollView>
  );
}
