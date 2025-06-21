import { StyleSheet } from "react-native";

export const homestyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#0D0D0D", // deep black background
  },
  sidebar: {
    width: 120,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 12,
    backgroundColor: "#121212",
    borderRightWidth: 1,
    borderColor: "#1C1C1C",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  profileName: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  menuIcon: {
    width: 18,
    height: 18,
    tintColor: "#FF3D3D",
  },
  menuText: {
    color: "#E0E0E0",
    fontSize: 13,
    fontWeight: "500",
  },
  activeMenuItem: {
    backgroundColor: "#1A1A1A",
    borderColor: "#FF3D3D",
    borderWidth: 1,
  },

  content: {
    flex: 1,
    padding: 24,
  },
  welcomeText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: "#FF3D3D",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: "#B0B0B0",
    fontSize: 14,
    marginBottom: 6,
  },
  cardValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  transactionList: {
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  transactionAmount: {
    color: "#FF3D3D",
    fontWeight: "600",
    fontSize: 14,
  },
  transactionTime: {
    color: "#A0A0A0",
    fontSize: 12,
  },
  addButton: {
    backgroundColor: "#FF3D3D",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 12,
  },
  footerText: {
    color: "#FF3D3D",
    fontWeight: "700",
    fontSize: 12,
  },
  footerSubtext: {
    color: "#888",
    fontSize: 11,
  },
});
