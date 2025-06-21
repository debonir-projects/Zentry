import { StyleSheet } from "react-native";

export const reportstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D", // Pure black
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  headerLogo: {
    color: "#FF2D2D",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 20,
  },

  dropdown: {
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#2D2D2D",
    color: "#FFF",
    marginBottom: 16,
  },

  transactionCard: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#FF2D2D",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },

  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  transactionLeft: {
    flex: 1,
  },

  categoryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },

  subtext: {
    color: "#B0B0B0",
    fontSize: 13,
  },

  amountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF4C4C",
  },

  amountTextPositive: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00FFAA",
  },

  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textAlign: "right",
  },

  footer: {
    marginTop: 24,
    alignItems: "center",
  },

  footerText: {
    color: "#AAAAAA",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },

  floatingAddButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#FF2D2D",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },

  plusIcon: {
    fontSize: 28,
    color: "#FFF",
    fontWeight: "800",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#181818",
    borderRadius: 18,
    padding: 24,
    width: 320,
    alignItems: "stretch",
  },

  modalTitle: {
    color: "#FF2D2D",
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 12,
  },

  modalLabel: {
    color: "#FF2D2D",
    fontWeight: "600",
    marginTop: 8,
  },
});
