import React, { useState } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { reportstyles } from "@/constants/report.styles";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your Gemini API key
const GEMINI_API_KEY = "AIzaSyBFFWcBbKD_YLt9u3ZOBvIUINsbt7gjKTc";

export default function TransactionScreen() {
  const [scannerModalVisible, setScannerModalVisible] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [editableData, setEditableData] = useState<any>(null); // Add this state to manage editable data
  const [savedBills, setSavedBills] = useState<any[]>([]);

  const transactions = [
    {
      icon: <FontAwesome5 name="hamburger" size={20} color="#FF2D2D" />,
      category: "Food",
      place: "Pizza Place",
      amount: -18.5,
      time: "10:45 AM",
    },
    {
      icon: <FontAwesome5 name="car" size={20} color="#FF2D2D" />,
      category: "Transport",
      place: "RideShare",
      amount: -12.0,
      time: "9:30 AM",
    },
    {
      icon: <MaterialIcons name="shopping-bag" size={20} color="#FF2D2D" />,
      category: "Shopping",
      place: "Market",
      amount: -45.2,
      time: "Yesterday",
    },
    {
      icon: <MaterialIcons name="sports-esports" size={20} color="#FF2D2D" />,
      category: "Entertainment",
      place: "Game Store",
      amount: -25.99,
      time: "Yesterday",
    },
    {
      icon: <Ionicons name="medkit" size={20} color="#FF2D2D" />,
      category: "Health",
      place: "Pharmacy",
      amount: -30.0,
      time: "Apr 22",
    },
    {
      icon: <MaterialIcons name="subscriptions" size={20} color="#FF2D2D" />,
      category: "Subscriptions",
      place: "Streaming Service",
      amount: 12.99,
      time: "Apr 20",
    },
    {
      icon: <Ionicons name="briefcase" size={20} color="#00FFAA" />,
      category: "Work Income",
      place: "Employer",
      amount: 1200.0,
      time: "Apr 20",
    },
  ];

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
}

`;

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

  return (
    <View style={reportstyles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={reportstyles.headerLogo}>ZENTRY</Text>

      <View style={reportstyles.dropdown}>
        <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
          Today ⌄
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {transactions.map((item, index) => (
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
                    ? `+ $${item.amount}`
                    : `- $${Math.abs(item.amount)}`}
                </Text>
                <Text style={reportstyles.timestamp}>{item.time}</Text>
              </View>
            </View>
          </View>
        ))}

        {savedBills.map((bill, idx) => (
          <View
            key={idx}
            style={[reportstyles.transactionCard, { borderColor: "#00FFAA" }]}
          >
            <Text
              style={[reportstyles.categoryText, { color: "#00FFAA" }]}
            >
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

      {/* Existing Add Button */}
      <TouchableOpacity style={reportstyles.floatingAddButton}>
        <Text style={reportstyles.plusIcon}>＋</Text>
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
