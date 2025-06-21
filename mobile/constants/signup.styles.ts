// styles/authStyles.ts
import { StyleSheet } from "react-native";

export const signupStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    padding: 24,
    justifyContent: "flex-start",
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: 24,
  },
  form: {
    gap: 10,
    marginBottom: 20,
    paddingBottom: 20,
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderColor: "#FF3C3C",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#FF3C3C",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "#FF3C3C",
    fontSize: 14,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  link: {
    color: "#FF3C3C",
    fontWeight: "600",
  },
});
