import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { homestyles } from "@/constants/home.styles"; // adjust the path as needed
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function ZentryDashboard() {
  return (
    <SafeAreaView style={homestyles.container}>
      {/* Sidebar */}
      <View style={homestyles.sidebar}>
        <View style={homestyles.profileSection}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={homestyles.profileImage}
          />
          <Text style={homestyles.profileName}>Emma</Text>
        </View>

        {/* Menu Items */}
        <View>
          <MenuItem icon="color-palette" label="Theme" />
          
          <MenuItem icon="account-balance-wallet" label="Bank Accounts" />
          <MenuItem icon="pie-chart" label="Budget" />
          <MenuItem icon="person" label="Persons" />
          <MenuItem icon="feedback" label="Feedback" />
          <MenuItem icon="logout" label="Logout" />
        </View>

        {/* Footer */}
        <View style={homestyles.footer}>
          <Text style={homestyles.footerText}>ZENTRY</Text>
          <Text style={homestyles.footerSubtext}>Finances in Con.</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={homestyles.content}>
        <Text style={homestyles.welcomeText}>Welcome, Emma</Text>

        {/* Balance Card */}
        <View style={homestyles.card}>
          <Text style={homestyles.cardTitle}>Balance</Text>
          <Text style={homestyles.cardValue}>$8,750</Text>
        </View>

        {/* Transactions Card */}
        <View style={[homestyles.card, homestyles.transactionList]}>
          <Text style={homestyles.cardTitle}>Recent Transactions</Text>
          <View style={homestyles.transactionItem}>
            <Text style={homestyles.transactionAmount}>- $20.00</Text>
            <Text style={homestyles.transactionTime}>0:20</Text>
          </View>
          <View style={homestyles.transactionItem}>
            <Text style={homestyles.transactionAmount}>+ $58.00</Text>
            <Text style={homestyles.transactionTime}>00:00</Text>
          </View>
        </View>

        {/* Monthly Budget Card */}
        <View style={homestyles.card}>
          <Text style={homestyles.cardTitle}>Monthly Budget</Text>
          <Text style={homestyles.cardValue}>$2,500</Text>
        </View>

        {/* Add Transaction */}
        <TouchableOpacity style={homestyles.addButton}>
          <Text style={homestyles.addButtonText}>Add Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sidebar Menu Item Component
function MenuItem({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  const isActive = label === "Theme"; // you can make this dynamic

  return (
    <TouchableOpacity
      style={[homestyles.menuItem, isActive && homestyles.activeMenuItem]}
    >
      <MaterialIcons
        name={icon as any}
        size={18}
        color="#FF3D3D"
        style={homestyles.menuIcon}
      />
      <Text style={homestyles.menuText}>{label}</Text>
    </TouchableOpacity>
  );
}

