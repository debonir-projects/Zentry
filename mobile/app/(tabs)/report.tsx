import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Image,
  ActivityIndicator,
  TextInput,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { reportstyles } from "@/constants/report.styles";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your Gemini API key
const GEMINI_API_KEY = "AIzaSyBFFWcBbKD_YLt9u3ZOBvIUINsbt7gjKTc";

// Filter options
const FILTER_OPTIONS = {
  TODAY: "Today",
  LAST_WEEK: "Last Week",
  LAST_MONTH: "Last Month",
  LAST_3_MONTHS: "Last 3 Months",
};

export default function TransactionScreen() {
  const [scannerModalVisible, setScannerModalVisible] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [editableData, setEditableData] = useState<any>(null);
  const [savedBills, setSavedBills] = useState<any[]>([]);
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(FILTER_OPTIONS.TODAY);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);

  // Enhanced transactions with actual dates
  const transactions = [
    {
      icon: <FontAwesome5 name="hamburger" size={20} color="#FF2D2D" />,
      category: "Food",
      place: "Pizza Place",
      amount: -18.5,
      time: "10:45 AM",
      date: new Date(), // Today
    },
    {
      icon: <FontAwesome5 name="car" size={20} color="#FF2D2D" />,
      category: "Transport",
      place: "RideShare",
      amount: -12.0,
      time: "9:30 AM",
      date: new Date(), // Today
    },
    {
      icon: <MaterialIcons name="shopping-bag" size={20} color="#FF2D2D" />,
      category: "Shopping",
      place: "Market",
      amount: -45.2,
      time: "Yesterday",
      date: new Date(Date.now() - 86400000), // Yesterday
    },
    {
      icon: <MaterialIcons name="sports-esports" size={20} color="#FF2D2D" />,
      category: "Entertainment",
      place: "Game Store",
      amount: -25.99,
      time: "Yesterday",
      date: new Date(Date.now() - 86400000), // Yesterday
    },
    {
      icon: <Ionicons name="medkit" size={20} color="#FF2D2D" />,
      category: "Health",
      place: "Pharmacy",
      amount: -30.0,
      time: "Apr 22",
      date: new Date(2025, 3, 22), // April 22, 2025
    },
    {
      icon: <MaterialIcons name="subscriptions" size={20} color="#FF2D2D" />,
      category: "Subscriptions",
      place: "Streaming Service",
      amount: 12.99,
      time: "Apr 20",
      date: new Date(2025, 3, 20), // April 20, 2025
    },
    {
      icon: <Ionicons name="briefcase" size={20} color="#00FFAA" />,
      category: "Work Income",
      place: "Employer",
      amount: 1200.0,
      time: "Apr 20",
      date: new Date(2025, 3, 20), // April 20, 2025
    },
    {
      icon: <FontAwesome5 name="tshirt" size={20} color="#FF2D2D" />,
      category: "Clothing",
      place: "Fashion Store",
      amount: -89.95,
      time: "Mar 15",
      date: new Date(2025, 2, 15), // March 15, 2025
    },
    {
      icon: <MaterialIcons name="school" size={20} color="#FF2D2D" />,
      category: "Education",
      place: "Online Course",
      amount: -199.99,
      time: "Feb 28",
      date: new Date(2025, 1, 28), // February 28, 2025
    },
    {
      icon: <FontAwesome5 name="plane" size={20} color="#FF2D2D" />,
      category: "Travel",
      place: "Airline Tickets",
      amount: -450.0,
      time: "Jan 10",
      date: new Date(2025, 0, 10), // January 10, 2025
    }
  ];

  // Format date for display
  const formatDisplayDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Filter transactions based on selected time period
  const filterTransactions = () => {
    const today = new Date();
    let startDate = new Date();
    
    switch(selectedFilter) {
      case FILTER_OPTIONS.TODAY:
        startDate = new Date(today.setHours(0, 0, 0, 0));
        break;
      case FILTER_OPTIONS.LAST_WEEK:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case FILTER_OPTIONS.LAST_MONTH:
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case FILTER_OPTIONS.LAST_3_MONTHS:
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        break;
      default:
        startDate = new Date(today.setHours(0, 0, 0, 0));
    }
    
    const filtered = transactions.filter(transaction => transaction.date >= startDate);
    setFilteredTransactions(filtered);
  };

  // Update filtered transactions whenever the filter changes
  useEffect(() => {
    filterTransactions();
  }, [selectedFilter]);

  // Helper: Convert image to base64
  const getBase64 = async (uri: string) => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  };

  // Scan bill using Gemini API
  const scanBillWithGemini = async (imageUri: string) => {
    setScanning(true);
    setScannedData(null);

    try {
      const base64 = await getBase64(imageUri);

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
Vendor name (e.g., the store or company name at the top)

Date of purchase (preferably in YYYY-MM-DD format)

List of purchased items, where each item includes:

name: the product or service name

qty: quantity purchased

price: price in INR format (e.g., "₹120.00")

Total amount paid in INR format
{
  "vendor": "string or null",
  "date": "YYYY-MM-DD or null",
  "items": [
    {
      "name": "string or null",
      "qty": "number or null",
      "price": "₹amount as string or null"
    }
  ],
  "total": "₹amount as string or null"
}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64,
          },
        },
      ]);

      const text = result.response.text();
      // Attempt to parse JSON from Gemini's response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setScannedData(JSON.parse(jsonMatch[0]));
      } else {
        setScannedData({ error: "Could not extract structured data." });
      }
    } catch (err) {
      setScannedData({ error: "Failed to scan bill." });
    } finally {
      setScanning(false);
    }
  };

  // Function to pick image from camera or gallery
  const handleScanBill = async () => {
    setScannedImage(null);
    setScannedData(null);
    setScannerModalVisible(true);

    // Ask for permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required!");
      setScannerModalVisible(false);
      return;
    }

    // Pick image
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setScannedImage(result.assets[0].uri);
      scanBillWithGemini(result.assets[0].uri);
    } else {
      setScannerModalVisible(false);
    }
  };

  // When scannedData is set, also set editableData
  React.useEffect(() => {
    if (scannedData && !scannedData.error) {
      setEditableData(scannedData);
    }
  }, [scannedData]);

  // Handler for updating editable fields
  const handleEditField = (field: string, value: any) => {
    setEditableData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditItem = (idx: number, key: string, value: any) => {
    setEditableData((prev: any) => {
      const items = [...(prev.items || [])];
      items[idx] = { ...items[idx], [key]: value };
      return { ...prev, items };
    });
  };

  // Get summary for the selected period
  const getSummary = () => {
    let income = 0;
    let expenses = 0;
    
    filteredTransactions.forEach(item => {
      if (item.amount > 0) {
        income += item.amount;
      } else {
        expenses += Math.abs(item.amount);
      }
    });
    
    return { income, expenses, net: income - expenses };
  };

  const summary = getSummary();

  return (
    <View style={reportstyles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={reportstyles.headerLogo}>ZENTRY</Text>

      {/* Filter Dropdown */}
      <TouchableOpacity 
        style={reportstyles.dropdown}
        onPress={() => setFilterDropdownVisible(!filterDropdownVisible)}
      >
        <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
          {selectedFilter} <Ionicons name="chevron-down" size={14} color="#fff" />
        </Text>
      </TouchableOpacity>

      {/* Filter Options Dropdown */}
      {filterDropdownVisible && (
        <View style={reportstyles.filterDropdown}>
          {Object.values(FILTER_OPTIONS).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                reportstyles.filterOption,
                selectedFilter === option && reportstyles.selectedFilterOption
              ]}
              onPress={() => {
                setSelectedFilter(option);
                setFilterDropdownVisible(false);
              }}
            >
              <Text style={[
                reportstyles.filterOptionText,
                selectedFilter === option && reportstyles.selectedFilterOptionText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Summary Card */}
      <View style={reportstyles.summaryCard}>
        <View style={reportstyles.summaryRow}>
          <View style={reportstyles.summaryItem}>
            <Text style={reportstyles.summaryLabel}>Income</Text>
            <Text style={[reportstyles.summaryAmount, {color: '#00FFAA'}]}>
              ${summary.income.toFixed(2)}
            </Text>
          </View>
          <View style={reportstyles.summaryItem}>
            <Text style={reportstyles.summaryLabel}>Expenses</Text>
            <Text style={[reportstyles.summaryAmount, {color: '#FF2D2D'}]}>
              ${summary.expenses.toFixed(2)}
            </Text>
          </View>
          <View style={reportstyles.summaryItem}>
            <Text style={reportstyles.summaryLabel}>Net</Text>
            <Text style={[
              reportstyles.summaryAmount, 
              {color: summary.net >= 0 ? '#00FFAA' : '#FF2D2D'}
            ]}>
              ${Math.abs(summary.net).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((item, index) => (
            <View key={index} style={reportstyles.transactionCard}>
              <View style={reportstyles.transactionRow}>
                <View style={{ marginRight: 12 }}>{item.icon}</View>
                <View style={reportstyles.transactionLeft}>
                  <Text style={reportstyles.categoryText}>{item.category}</Text>
                  <Text style={reportstyles.subtext}>{item.place}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={
                      item.amount >= 0
                        ? reportstyles.amountTextPositive
                        : reportstyles.amountText
                    }
                  >
                    {item.amount >= 0
                      ? `+ ₹${item.amount.toFixed(2)}`
                      : `- ₹${Math.abs(item.amount).toFixed(2)}`}
                  </Text>
                  <Text style={reportstyles.timestamp}>{formatDisplayDate(item.date)}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={reportstyles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#333" />
            <Text style={reportstyles.emptyStateText}>
              No transactions found for this period
            </Text>
          </View>
        )}

        {savedBills.map((bill, idx) => (
          <View
            key={idx}
            style={[reportstyles.transactionCard, { borderColor: "#00FFAA" }]}
          >
            <Text style={[reportstyles.categoryText, { color: "#00FFAA" }]}>
              {bill.vendor || "Vendor"}
            </Text>
            <Text style={reportstyles.subtext}>{bill.date || "Date"}</Text>
            <View style={{ marginTop: 8 }}>
              {bill.items?.map((item: any, i: number) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 2,
                  }}
                >
                  <Text style={{ color: "#fff" }}>{item.name || "Item"}</Text>
                  <Text style={{ color: "#fff" }}>x{item.qty || 1}</Text>
                  <Text style={{ color: "#fff" }}>{item.price || ""}</Text>
                </View>
              ))}
            </View>
            <Text style={[reportstyles.amountTextPositive, { marginTop: 6 }]}>
              Total: {bill.total || ""}
            </Text>
          </View>
        ))}

        <View style={reportstyles.footer}>
          <Text style={reportstyles.footerText}>
            Track smarter. Spend better.{"\n"}Live fully.
          </Text>
        </View>
      </ScrollView>

      {/* Scanner Button */}
      <TouchableOpacity
        style={[
          reportstyles.floatingAddButton,
          { right: 24, bottom: 100, backgroundColor: "#FF2D2D" },
        ]}
        onPress={handleScanBill}
      >
        <Ionicons name="scan" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Scanner Modal */}
      <Modal
        visible={scannerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setScannerModalVisible(false)}
      >
        <View style={reportstyles.modalOverlay}>
          <View style={reportstyles.modalContent}>
            <Text style={reportstyles.modalTitle}>Scanned Bill</Text>
            {scannedImage && (
              <Image
                source={{ uri: scannedImage }}
                style={{
                  width: 220,
                  height: 180,
                  borderRadius: 12,
                  alignSelf: "center",
                  marginBottom: 16,
                }}
                resizeMode="contain"
              />
            )}
            {scanning && (
              <ActivityIndicator
                size="large"
                color="#FF2D2D"
                style={{ marginVertical: 16 }}
              />
            )}
            {editableData && !scannedData?.error && (
              <View>
                <Text style={reportstyles.modalLabel}>Vendor:</Text>
                <TextInput
                  style={{
                    color: "#fff",
                    backgroundColor: "#222",
                    borderRadius: 6,
                    padding: 6,
                    marginBottom: 6,
                  }}
                  value={editableData.vendor ?? ""}
                  onChangeText={(text) => handleEditField("vendor", text)}
                  placeholder="Vendor"
                  placeholderTextColor="#888"
                />

                <Text style={reportstyles.modalLabel}>Date:</Text>
                <TextInput
                  style={{
                    color: "#fff",
                    backgroundColor: "#222",
                    borderRadius: 6,
                    padding: 6,
                    marginBottom: 6,
                  }}
                  value={editableData.date ?? ""}
                  onChangeText={(text) => handleEditField("date", text)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#888"
                />

                <Text style={reportstyles.modalLabel}>Items:</Text>
                {editableData.items?.map((item: any, idx: number) => (
                  <View key={idx} style={{ marginBottom: 8, marginLeft: 8 }}>
                    <TextInput
                      style={{
                        color: "#fff",
                        backgroundColor: "#222",
                        borderRadius: 6,
                        padding: 6,
                        marginBottom: 2,
                      }}
                      value={item.name ?? ""}
                      onChangeText={(text) => handleEditItem(idx, "name", text)}
                      placeholder="Product Name"
                      placeholderTextColor="#888"
                    />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TextInput
                        style={{
                          color: "#fff",
                          backgroundColor: "#222",
                          borderRadius: 6,
                          padding: 6,
                          flex: 1,
                        }}
                        value={item.qty?.toString() ?? ""}
                        onChangeText={(text) =>
                          handleEditItem(
                            idx,
                            "qty",
                            text.replace(/[^0-9]/g, "")
                          )
                        }
                        placeholder="Qty"
                        placeholderTextColor="#888"
                        keyboardType="numeric"
                      />
                      <TextInput
                        style={{
                          color: "#fff",
                          backgroundColor: "#222",
                          borderRadius: 6,
                          padding: 6,
                          flex: 2,
                        }}
                        value={item.price ?? ""}
                        onChangeText={(text) => handleEditItem(idx, "price", text)}
                        placeholder="Price (₹ or $)"
                        placeholderTextColor="#888"
                      />
                    </View>
                  </View>
                ))}

                <Text style={reportstyles.modalLabel}>Total:</Text>
                <TextInput
                  style={{
                    color: "#fff",
                    backgroundColor: "#222",
                    borderRadius: 6,
                    padding: 6,
                    marginBottom: 6,
                  }}
                  value={editableData.total ?? ""}
                  onChangeText={(text) => handleEditField("total", text)}
                  placeholder="Total (₹ or $)"
                  placeholderTextColor="#888"
                />
              </View>
            )}
            {scannedData?.error && (
              <Text style={{ color: "#FF2D2D", marginTop: 12 }}>
                {scannedData.error}
              </Text>
            )}
            <TouchableOpacity
              style={[
                reportstyles.floatingAddButton,
                {
                  alignSelf: "center",
                  marginTop: 18,
                  backgroundColor: "#00FFAA",
                },
              ]}
              onPress={() => {
                if (editableData) {
                  setSavedBills((prev) => [...prev, editableData]);
                }
                setScannerModalVisible(false);
              }}
            >
              <Text style={reportstyles.plusIcon}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
