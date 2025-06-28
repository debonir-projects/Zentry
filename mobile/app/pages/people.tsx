import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your actual API key
const GEMINI_API_KEY = "AIzaSyBFFWcBbKD_YLt9u3ZOBvIUINsbt7gjKTc";

// Predefined users
const USERS = [
  {
    id: 'user1',
    name: 'Anirban',
    avatar: 'https://res.cloudinary.com/daipbrnuc/image/upload/v1750014048/hez9qcxnfduhtpaimjoo.jpg',
    email: 'anirban@example.com',
  },
  {
    id: 'user2',
    name: 'Debopriya',
    avatar: 'https://avatars.githubusercontent.com/u/178933981?v=4',
    email: 'debopriya@example.com',
  }
];

export default function PeoplePage() {
  const router = useRouter();
  const [totalAmount, setTotalAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState(USERS.map(user => ({
    ...user,
    selected: false,
    amount: '0',
  })));
  const [splits, setSplits] = useState<any[]>([]);
  const [scannerModalVisible, setScannerModalVisible] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitType, setSplitType] = useState('equal'); // 'equal', 'custom'

  useEffect(() => {
    // Load existing splits (in a real app, this would come from an API)
    const existingSplits = [
      {
        id: 'split1',
        description: 'Dinner at Restaurant',
        totalAmount: 1200,
        date: '2025-06-20',
        createdBy: 'Anirban',
        participants: [
          { userId: 'user1', name: 'Anirban', amount: 600 },
          { userId: 'user2', name: 'Debopriya', amount: 600 }
        ]
      },
      {
        id: 'split2',
        description: 'Movie Tickets',
        totalAmount: 800,
        date: '2025-06-18',
        createdBy: 'Debopriya',
        participants: [
          { userId: 'user1', name: 'Anirban', amount: 400 },
          { userId: 'user2', name: 'Debopriya', amount: 400 }
        ]
      }
    ];
    
    setSplits(existingSplits);
  }, []);

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(
      selectedUsers.map(user => {
        if (user.id === userId) {
          return { ...user, selected: !user.selected };
        }
        return user;
      })
    );
  };

  // Update a user's split amount
  const updateUserAmount = (userId: string, amount: string) => {
    setSelectedUsers(
      selectedUsers.map(user => {
        if (user.id === userId) {
          return { ...user, amount };
        }
        return user;
      })
    );
  };

  // Calculate equal splits
  const calculateEqualSplits = () => {
    const selectedCount = selectedUsers.filter(user => user.selected).length;
    if (selectedCount === 0 || !totalAmount) return;
    
    const amountPerPerson = (parseFloat(totalAmount) / selectedCount).toFixed(2);
    
    setSelectedUsers(
      selectedUsers.map(user => {
        if (user.selected) {
          return { ...user, amount: amountPerPerson };
        }
        return user;
      })
    );
  };

  // Create a new split
  const createSplit = () => {
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    const selectedCount = selectedUsers.filter(user => user.selected).length;
    if (selectedCount < 2) {
      Alert.alert('Error', 'Please select at least 2 people for the split');
      return;
    }
    
    // Validate that all amounts are valid and sum up to the total
    let sum = 0;
    const participants = selectedUsers
      .filter(user => user.selected)
      .map(user => {
        const amount = parseFloat(user.amount);
        sum += amount;
        return {
          userId: user.id,
          name: user.name,
          amount
        };
      });
    
    // Round to 2 decimal places to avoid floating point issues
    const roundedSum = Math.round(sum * 100) / 100;
    const roundedTotal = Math.round(parseFloat(totalAmount) * 100) / 100;
    
    if (roundedSum !== roundedTotal) {
      Alert.alert('Error', `The split amounts (₹${roundedSum}) don't match the total amount (₹${roundedTotal})`);
      return;
    }
    
    const newSplit = {
      id: `split${Date.now()}`,
      description: description || 'Unnamed Split',
      totalAmount: parseFloat(totalAmount),
      date: new Date().toISOString().split('T')[0],
      createdBy: 'Anirban', // Current user
      participants
    };
    
    setSplits([newSplit, ...splits]);
    
    // Reset form
    setTotalAmount('');
    setDescription('');
    setSelectedUsers(USERS.map(user => ({
      ...user,
      selected: false,
      amount: '0',
    })));
    
    setShowSplitModal(false);
    Alert.alert('Success', 'Split created successfully!');
  };

  // Convert image to base64
  const getBase64 = async (uri: string) => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  };

  // Scan bill with Gemini
  const scanBillWithGemini = async (imageUri: string) => {
    setScanning(true);
    setScannedData(null);

    try {
      const base64 = await getBase64(imageUri);

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
Analyze this receipt or bill image carefully and extract the following information:

1. Total amount paid (number only, without currency symbol)
2. Name of the restaurant, store, or business
3. Date of transaction (if visible)
4. Time of transaction (if visible)
5. List of items purchased with their individual prices (up to 5 main items)
6. Tax amount (if visible)
7. Tip/service charge (if visible)

If any information is not visible or unclear, return null for that field.

Return the data in this specific JSON format:
{
  "totalAmount": number,
  "description": "string",
  "date": "YYYY-MM-DD" or null,
  "time": "HH:MM" or null,
  "items": [
    {"name": "string", "price": number}
  ],
  "tax": number or null,
  "serviceCharge": number or null
}

Be very precise with the total amount - it's usually at the bottom of the receipt and labeled as "Total" or "Grand Total".
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
      
      try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedData = JSON.parse(jsonMatch[0]);
          setScannedData(extractedData);
          
          // Auto-fill the form with extracted data
          if (extractedData.totalAmount) {
            setTotalAmount(extractedData.totalAmount.toString());
          }
          if (extractedData.description) {
            setDescription(extractedData.description);
          }
        } else {
          setScannedData({ error: "Could not extract structured data from the receipt." });
        }
      } catch (err) {
        console.error("Error parsing Gemini response:", err);
        setScannedData({ error: "Failed to parse the receipt data." });
      }
    } catch (err) {
      console.error("Error scanning receipt:", err);
      setScannedData({ error: "Failed to scan bill. Please try again or enter details manually." });
    } finally {
      setScanning(false);
    }
  };

  // Handle bill scanning
  const handleScanBill = async () => {
    setScannedImage(null);
    setScannedData(null);
    setScannerModalVisible(true);

    // Ask for permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Error", "Camera permission is required!");
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

  // Add this new function alongside other split calculation functions
  const calculatePercentageSplits = () => {
    const selectedCount = selectedUsers.filter(user => user.selected).length;
    if (selectedCount === 0 || !totalAmount) return;
    
    // Default to equal percentages
    const percentPerPerson = 100 / selectedCount;
    
    setSelectedUsers(
      selectedUsers.map(user => {
        if (user.selected) {
          const amount = (parseFloat(totalAmount) * (percentPerPerson / 100)).toFixed(2);
          return { ...user, amount, percentage: percentPerPerson };
        }
        return user;
      })
    );
  };

  // Add this function to update percentages when amounts change
  const updateUserPercentage = (userId: string, amount: string) => {
    if (!totalAmount || parseFloat(totalAmount) <= 0) return;
    
    const newAmount = parseFloat(amount) || 0;
    const newPercentage = (newAmount / parseFloat(totalAmount)) * 100;
    
    setSelectedUsers(
      selectedUsers.map(user => {
        if (user.id === userId) {
          return { ...user, amount, percentage: newPercentage };
        }
        return user;
      })
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FF3D3D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Split Expenses</Text>
        <TouchableOpacity onPress={() => setShowSplitModal(true)}>
          <Ionicons name="add-circle" size={28} color="#FF3D3D" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {splits.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Your Splits</Text>
            {splits.map((split) => (
              <View key={split.id} style={styles.splitCard}>
                <View style={styles.splitCardHeader}>
                  <Text style={styles.splitCardTitle}>{split.description}</Text>
                  <Text style={styles.splitCardDate}>{split.date}</Text>
                </View>
                
                <Text style={styles.splitCardAmount}>₹{split.totalAmount.toLocaleString()}</Text>
                
                <View style={styles.separator} />
                
                <Text style={styles.participantsLabel}>Split between:</Text>
                
                {split.participants.map((participant: any, index: number) => (
                  <View key={index} style={styles.participantRow}>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>{participant.name}</Text>
                      {participant.name === 'Anirban' && (
                        <Text style={styles.youLabel}>(You)</Text>
                      )}
                    </View>
                    <Text style={styles.participantAmount}>₹{participant.amount.toLocaleString()}</Text>
                  </View>
                ))}
                
                <View style={styles.splitCardFooter}>
                  <Text style={styles.splitCardCreator}>Created by {split.createdBy}</Text>
                  
                  <View style={styles.splitCardActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Remind</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Settle Up</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#333" />
            <Text style={styles.emptyStateText}>No splits yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the + button to create your first split
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Split Modal */}
      <Modal
        visible={showSplitModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSplitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Split</Text>
              <TouchableOpacity onPress={() => setShowSplitModal(false)}>
                <Ionicons name="close" size={24} color="#FF3D3D" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What's this split for?"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Total Amount (₹)</Text>
                <View style={styles.amountInputContainer}>
                  <TextInput
                    style={[styles.input, styles.amountInput]}
                    value={totalAmount}
                    onChangeText={setTotalAmount}
                    placeholder="0.00"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity 
                    style={styles.scanButton}
                    onPress={handleScanBill}
                  >
                    <Ionicons name="scan" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Split With</Text>
                {selectedUsers.map(user => (
                  <TouchableOpacity 
                    key={user.id}
                    style={[styles.userCard, user.selected && styles.selectedUserCard]}
                    onPress={() => toggleUserSelection(user.id)}
                  >
                    <View style={styles.userInfo}>
                      <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                      <Text style={styles.userName}>{user.name}</Text>
                      {user.name === 'Anirban' && (
                        <Text style={styles.youLabel}>(You)</Text>
                      )}
                    </View>
                    <View style={styles.checkbox}>
                      {user.selected && <Ionicons name="checkmark" size={20} color="#FF3D3D" />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Split Method</Text>
                <View style={styles.splitTypeContainer}>
                  <TouchableOpacity 
                    style={[styles.splitTypeButton, splitType === 'equal' && styles.selectedSplitType]}
                    onPress={() => {
                      setSplitType('equal');
                      calculateEqualSplits();
                    }}
                  >
                    <Ionicons name="people" size={18} color={splitType === 'equal' ? '#fff' : '#FF3D3D'} />
                    <Text style={[styles.splitTypeText, splitType === 'equal' && styles.selectedSplitTypeText]}>
                      Equal
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.splitTypeButton, splitType === 'percentage' && styles.selectedSplitType]}
                    onPress={() => {
                      setSplitType('percentage');
                      calculatePercentageSplits();
                    }}
                  >
                    <MaterialIcons name="pie-chart" size={18} color={splitType === 'percentage' ? '#fff' : '#FF3D3D'} />
                    <Text style={[styles.splitTypeText, splitType === 'percentage' && styles.selectedSplitTypeText]}>
                      Percentage
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.splitTypeButton, splitType === 'custom' && styles.selectedSplitType]}
                    onPress={() => setSplitType('custom')}
                  >
                    <MaterialIcons name="tune" size={18} color={splitType === 'custom' ? '#fff' : '#FF3D3D'} />
                    <Text style={[styles.splitTypeText, splitType === 'custom' && styles.selectedSplitTypeText]}>
                      Custom
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Replace the existing split details section with this enhanced version */}
              <View style={styles.formGroup}>
                <View style={styles.splitHeaderRow}>
                  <Text style={styles.label}>Split Details</Text>
                  <Text style={styles.splitSummary}>
                    Total: ₹{totalAmount || '0'}
                  </Text>
                </View>
                
                {/* Visualization of the split (only for percentage mode) */}
                {splitType === 'percentage' && (
                  <View style={styles.splitVisualizer}>
                    {selectedUsers.filter(user => user.selected).map((user, index) => {
                      const percentage = user.percentage || 0;
                      return (
                        <View 
                          key={user.id} 
                          style={[
                            styles.splitBar,
                            { 
                              width: `${percentage}%`,
                              backgroundColor: index % 2 === 0 ? '#FF3D3D' : '#FF7777'
                            }
                          ]}
                        >
                          {percentage >= 10 && (
                            <Text style={styles.splitBarText}>{user.name}</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
                
                {/* List of users with input fields */}
                {selectedUsers
                  .filter(user => user.selected)
                  .map(user => (
                    <View key={user.id} style={styles.splitRow}>
                      <View style={styles.userInfo}>
                        <Image source={{ uri: user.avatar }} style={styles.userAvatarSmall} />
                        <View>
                          <Text style={styles.userName}>{user.name}</Text>
                          {user.name === 'Anirban' && (
                            <Text style={styles.youLabel}>(You)</Text>
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.splitInputContainer}>
                        {splitType === 'percentage' && (
                          <Text style={styles.percentageText}>
                            {((user.percentage || 0).toFixed(1))}%
                          </Text>
                        )}
                        
                        <View style={styles.amountInputWrapper}>
                          <Text style={styles.currencySymbol}>₹</Text>
                          <TextInput
                            style={[styles.amountInput, { textAlign: 'right' }]}
                            value={user.amount.toString()}
                            onChangeText={(text) => {
                              updateUserAmount(user.id, text);
                              if (splitType === 'percentage') {
                                updateUserPercentage(user.id, text);
                              }
                            }}
                            placeholder="0.00"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            editable={splitType !== 'equal'}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                
                {/* Show difference warning if amounts don't add up */}
                {(() => {
                  const selectedCount = selectedUsers.filter(user => user.selected).length;
                  if (selectedCount >= 2 && totalAmount) {
                    const sum = selectedUsers
                      .filter(user => user.selected)
                      .reduce((acc, user) => acc + (parseFloat(user.amount) || 0), 0);
                    
                    const diff = parseFloat(totalAmount) - sum;
                    
                    if (Math.abs(diff) > 0.01) {
                      return (
                        <View style={styles.splitWarning}>
                          <MaterialIcons name="warning" size={16} color="#FFA000" />
                          <Text style={styles.splitWarningText}>
                            {diff > 0 
                              ? `₹${diff.toFixed(2)} remaining to be assigned` 
                              : `₹${Math.abs(diff).toFixed(2)} over the total amount`}
                          </Text>
                        </View>
                      );
                    }
                  }
                  return null;
                })()}
                
                {/* Quick Actions */}
                {splitType === 'custom' && (
                  <View style={styles.quickActionsContainer}>
                    <TouchableOpacity 
                      style={styles.quickActionButton}
                      onPress={calculateEqualSplits}
                    >
                      <Text style={styles.quickActionText}>Reset to Equal</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.quickActionButton}
                      onPress={() => {
                        // Set "I'll pay" (current user pays everything)
                        setSelectedUsers(
                          selectedUsers.map(user => {
                            if (user.name === 'Anirban' && user.selected) {
                              return { ...user, amount: totalAmount };
                            } else if (user.selected) {
                              return { ...user, amount: '0' };
                            }
                            return user;
                          })
                        );
                      }}
                    >
                      <Text style={styles.quickActionText}>I'll Pay</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowSplitModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.createButton}
                onPress={createSplit}
              >
                <Text style={styles.createButtonText}>Create Split</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Scanner Modal */}
      <Modal
        visible={scannerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setScannerModalVisible(false)}
      >
        {/* Replace the existing scanner modal content */}
        <View style={styles.scannerModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scan Receipt</Text>
            <TouchableOpacity onPress={() => setScannerModalVisible(false)}>
              <Ionicons name="close" size={24} color="#FF3D3D" />
            </TouchableOpacity>
          </View>
          
          {scannedImage && (
            <Image
              source={{ uri: scannedImage }}
              style={styles.scannedImage}
              resizeMode="contain"
            />
          )}
          
          {scanning && (
            <View style={styles.scanningContainer}>
              <ActivityIndicator size="large" color="#FF3D3D" />
              <Text style={styles.scanningText}>Analyzing receipt...</Text>
            </View>
          )}
          
          {scannedData && !scannedData.error && (
            <ScrollView style={styles.scannedDataContainer}>
              <Text style={styles.scannedDataTitle}>Extracted Information</Text>
              
              {scannedData.totalAmount && (
                <View style={styles.scannedDataRow}>
                  <Text style={styles.scannedDataLabel}>Total Amount:</Text>
                  <View style={styles.scannedDataValueContainer}>
                    <Text style={styles.scannedDataValue}>₹{scannedData.totalAmount}</Text>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        Alert.prompt(
                          "Edit Total Amount",
                          "Enter the correct amount:",
                          [
                            {
                              text: "Cancel",
                              style: "cancel"
                            },
                            {
                              text: "Update",
                              onPress: (text) => {
                                if (text) {
                                  const newData = {...scannedData, totalAmount: parseFloat(text)};
                                  setScannedData(newData);
                                  setTotalAmount(text);
                                }
                              }
                            }
                          ],
                          "plain-text",
                          scannedData.totalAmount.toString()
                        );
                      }}
                    >
                      <MaterialIcons name="edit" size={16} color="#FF3D3D" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              {scannedData.description && (
                <View style={styles.scannedDataRow}>
                  <Text style={styles.scannedDataLabel}>Description:</Text>
                  <View style={styles.scannedDataValueContainer}>
                    <Text style={styles.scannedDataValue}>{scannedData.description}</Text>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        Alert.prompt(
                          "Edit Description",
                          "Enter the correct name:",
                          [
                            {
                              text: "Cancel",
                              style: "cancel"
                            },
                            {
                              text: "Update",
                              onPress: (text) => {
                                if (text) {
                                  const newData = {...scannedData, description: text};
                                  setScannedData(newData);
                                  setDescription(text);
                                }
                              }
                            }
                          ],
                          "plain-text",
                          scannedData.description
                        );
                      }}
                    >
                      <MaterialIcons name="edit" size={16} color="#FF3D3D" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              {scannedData.date && (
                <View style={styles.scannedDataRow}>
                  <Text style={styles.scannedDataLabel}>Date:</Text>
                  <Text style={styles.scannedDataValue}>{scannedData.date}</Text>
                </View>
              )}
              
              {scannedData.items && scannedData.items.length > 0 && (
                <View style={styles.itemsContainer}>
                  <Text style={styles.itemsHeader}>Items:</Text>
                  {scannedData.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.itemPrice}>₹{item.price}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {scannedData.tax && (
                <View style={styles.scannedDataRow}>
                  <Text style={styles.scannedDataLabel}>Tax:</Text>
                  <Text style={styles.scannedDataValue}>₹{scannedData.tax}</Text>
                </View>
              )}
              
              {scannedData.serviceCharge && (
                <View style={styles.scannedDataRow}>
                  <Text style={styles.scannedDataLabel}>Service Charge:</Text>
                  <Text style={styles.scannedDataValue}>₹{scannedData.serviceCharge}</Text>
                </View>
              )}
            </ScrollView>
          )}
          
          {scannedData?.error && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={32} color="#FF3D3D" />
              <Text style={styles.errorText}>{scannedData.error}</Text>
              <Text style={styles.errorHint}>Try taking a clearer photo or enter details manually</Text>
            </View>
          )}
          
          <View style={styles.scannerModalFooter}>
            {!scannedImage ? (
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={() => {
                  ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 1,
                  }).then(result => {
                    if (!result.canceled && result.assets && result.assets.length > 0) {
                      setScannedImage(result.assets[0].uri);
                      scanBillWithGemini(result.assets[0].uri);
                    }
                  });
                }}
              >
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.cameraButtonText}>Take Photo</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.scannerButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setScannerModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.useDataButton}
                  onPress={() => {
                    setScannerModalVisible(false);
                  }}
                  disabled={!scannedData || scanning || scannedData.error}
                >
                  <Text style={styles.useDataButtonText}>Use Data</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#111',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  splitCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  splitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  splitCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  splitCardDate: {
    color: '#888',
    fontSize: 12,
  },
  splitCardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3D3D',
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 12,
  },
  participantsLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantName: {
    color: '#fff',
    fontSize: 14,
  },
  youLabel: {
    color: '#FF3D3D',
    fontSize: 12,
    marginLeft: 4,
  },
  participantAmount: {
    color: '#fff',
    fontWeight: 'bold',
  },
  splitCardFooter: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  splitCardCreator: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  splitCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF3D3D',
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#FF3D3D',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#111',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#FF3D3D',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3D3D',
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
  },
  scanButton: {
    backgroundColor: '#FF3D3D',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  selectedUserCard: {
    borderColor: '#FF3D3D',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userAvatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3D3D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  splitTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#222',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#444',
  },
  selectedSplitType: {
    backgroundColor: '#FF3D3D',
    borderColor: '#FF3D3D',
  },
  splitTypeText: {
    color: '#fff',
  },
  selectedSplitTypeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF3D3D',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#FF3D3D',
    fontWeight: 'bold',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#FF3D3D',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scannerModalContent: {
    backgroundColor: '#111',
    borderRadius: 16,
    width: '90%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF3D3D',
  },
  scannedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 16,
  },
  scanningContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scanningText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  scannedDataContainer: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  scannedDataTitle: {
    color: '#FF3D3D',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scannedDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  scannedDataLabel: {
    color: '#888',
  },
  scannedDataValue: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#FF3D3D',
    marginBottom: 8,
  },
  errorHint: {
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  scannerModalFooter: {
    flexDirection: 'row',
    marginTop: 16,
  },
  useDataButton: {
    flex: 1,
    backgroundColor: '#00FFAA',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  useDataButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  splitHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  splitSummary: {
    color: '#FF3D3D',
    fontSize: 14,
    fontWeight: '600',
  },
  splitVisualizer: {
    height: 24,
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  splitBar: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitBarText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  splitInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageText: {
    color: '#888',
    width: 50,
    textAlign: 'right',
    marginRight: 8,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    paddingHorizontal: 8,
    width: 120,
  },
  currencySymbol: {
    color: '#888',
    fontSize: 16,
  },
  splitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 160, 0, 0.1)',
    padding: 8,
    borderRadius: 4,
    marginTop: 12,
  },
  splitWarningText: {
    color: '#FFA000',
    fontSize: 12,
    marginLeft: 6,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  quickActionButton: {
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  quickActionText: {
    color: '#FF3D3D',
    fontSize: 12,
  },
  cameraButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3D3D',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  cameraButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scannerButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  editButton: {
    padding: 4,
    marginLeft: 8,
  },
  scannedDataValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsContainer: {
    marginVertical: 12,
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
  },
  itemsHeader: {
    color: '#FF3D3D',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  itemName: {
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    color: '#fff',
    fontWeight: '500',
  },
});