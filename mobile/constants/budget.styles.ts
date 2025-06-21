import { StyleSheet } from "react-native";

export const budgetstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    color: "#FF3D3D",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  heading: {
    color: "#FF3D3D",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  subheading: {
    color: "#FF3D3D",
    fontSize: 14,
    marginTop: 2,
    letterSpacing: 1,
  },
  budgetSummaryCard: {
    borderWidth: 1,
    borderColor: "#FF3D3D",
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    color: "#FF3D3D",
    fontSize: 14,
    marginBottom: 8,
  },
  summaryAmount: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  circularProgressPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    borderColor: "#FF3D3D",
    justifyContent: "center",
    alignItems: "center",
  },
  circularText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  categoryCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    borderColor: "#FF3D3D",
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryLabel: {
    color: "#FF3D3D",
    fontSize: 16,
    fontWeight: "600",
  },
  categoryAmount: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  progressBarBackground: {
    backgroundColor: "#2C2C2C",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    backgroundColor: "#FF3D3D",
    height: 8,
    borderRadius: 4,
  },
  categoryPercentage: {
    textAlign: "right",
    color: "#AAAAAA",
    fontSize: 12,
    marginTop: 4,
  },
  editButton: {
    backgroundColor: "#FF3D3D",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: 16,
    alignItems: "center",
  },
  footerText: {
    color: "#AAAAAA",
    fontSize: 12,
    textAlign: "center",
  },
});
