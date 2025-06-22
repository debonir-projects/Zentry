import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { budgetstyles } from "@/constants/budget.styles";
import { MaterialIcons } from '@expo/vector-icons';

export default function MonthlyBudget() {
  // Convert hardcoded values to state variables
  const [totalBudget, setTotalBudget] = useState(50000);
  const [categories, setCategories] = useState([
    { name: "Food", budget: 10000, spent: 8200 },
    { name: "Shopping", budget: 15000, spent: 13500 },
    { name: "Utilities", budget: 8000, spent: 6700 },
  ]);
  
  // Calculate derived values
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalBudget - totalSpent;
  
  // State for edit budget modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTotal, setEditingTotal] = useState(totalBudget.toString());
  const [editingCategories, setEditingCategories] = useState([...categories]);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  
  // Animation value for the modal slide-in effect
  const slideAnim = useState(new Animated.Value(0))[0];
  
  // Function to open the edit modal
  const openEditModal = () => {
    setEditingTotal(totalBudget.toString());
    setEditingCategories([...categories]);
    setModalVisible(true);
    
    // Start animation
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };
  
  // Function to close the edit modal
  const closeEditModal = () => {
    // Start animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.in(Easing.ease),
    }).start(() => {
      setModalVisible(false);
    });
  };
  
  // Update a category's budget
  const updateCategoryBudget = (index: number, value: string) => {
    const newCategories = [...editingCategories];
    newCategories[index] = {
      ...newCategories[index],
      budget: isNaN(parseInt(value)) ? 0 : parseInt(value),
    };
    setEditingCategories(newCategories);
  };
  
  // Toggle category expansion
  const toggleCategory = (index: number) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };
  
  // Save budget changes
  const saveBudgetChanges = () => {
    // Validate total budget
    const newTotalBudget = parseInt(editingTotal);
    if (isNaN(newTotalBudget) || newTotalBudget <= 0) {
      Alert.alert("Invalid Budget", "Please enter a valid total budget amount.");
      return;
    }
    
    // Validate category budgets
    const categoryTotal = editingCategories.reduce((sum, cat) => sum + cat.budget, 0);
    if (categoryTotal > newTotalBudget) {
      Alert.alert(
        "Budget Exceeded", 
        `Your category budgets (₹${categoryTotal.toLocaleString()}) exceed your total budget (₹${newTotalBudget.toLocaleString()}).`
      );
      return;
    }
    
    // Update state with new values
    setTotalBudget(newTotalBudget);
    setCategories(editingCategories);
    
    // Close modal
    closeEditModal();
    
    // Show confirmation
    Alert.alert("Success", "Your budget has been updated successfully!");
  };
  
  // Calculate remaining budget for categories
  const calculateUnallocated = () => {
    const totalAllocated = editingCategories.reduce((sum, cat) => sum + cat.budget, 0);
    return parseInt(editingTotal) - totalAllocated;
  };

  return (
    <ScrollView style={budgetstyles.container}>
      {/* Header */}
      <View style={budgetstyles.header}>
        <Text style={budgetstyles.logo}>ZENTRY</Text>
        <Text style={budgetstyles.heading}>Monthly Budget</Text>
        <Text style={budgetstyles.subheading}>JUNE 2025</Text>
      </View>

      {/* Summary */}
      <View style={budgetstyles.budgetSummaryCard}>
        <View style={budgetstyles.summaryTextContainer}>
          <Text style={budgetstyles.summaryLabel}>Total Monthly Budget</Text>
          <Text style={budgetstyles.summaryAmount}>₹ {totalBudget.toLocaleString()}</Text>
          <Text style={budgetstyles.summaryLabel}>Total Spent</Text>
          <Text style={budgetstyles.summaryAmount}>₹ {totalSpent.toLocaleString()}</Text>
        </View>
        <View style={budgetstyles.circularProgressPlaceholder}>
          <Text style={budgetstyles.circularText}>{remaining.toLocaleString()}</Text>
        </View>
      </View>

      {/* Categories */}
      {categories.map((cat, index) => {
        const percentage = Math.round((cat.spent / cat.budget) * 100);
        return (
          <View key={index} style={budgetstyles.categoryCard}>
            <View style={budgetstyles.categoryRow}>
              <Text style={budgetstyles.categoryLabel}>{cat.name}</Text>
              <Text style={budgetstyles.categoryAmount}>
                {cat.budget.toLocaleString()} / {cat.spent.toLocaleString()}
              </Text>
            </View>
            <View style={budgetstyles.progressBarBackground}>
              <View 
                style={[
                  budgetstyles.progressBarFill, 
                  { width: `${percentage}%` },
                  percentage > 90 ? styles.dangerProgress : {}
                ]} 
              />
            </View>
            <Text 
              style={[
                budgetstyles.categoryPercentage,
                percentage > 90 ? styles.dangerText : {}
              ]}
            >
              {percentage}%
            </Text>
          </View>
        );
      })}

      {/* Edit Button */}
      <TouchableOpacity 
        style={budgetstyles.editButton}
        onPress={openEditModal}
      >
        <Text style={budgetstyles.editButtonText}>Edit Budget</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={budgetstyles.footer}>
        <Text style={budgetstyles.footerText}>
          Stay ahead. Spend within. Conquer your month{"\n"}with Zentry.
        </Text>
      </View>
      
      {/* Edit Budget Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Budget</Text>
              <TouchableOpacity onPress={closeEditModal}>
                <MaterialIcons name="close" size={24} color="#FF3D3D" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* Total Budget Section */}
              <View style={styles.budgetSection}>
                <Text style={styles.sectionTitle}>Total Monthly Budget</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.input}
                    value={editingTotal}
                    onChangeText={setEditingTotal}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#666"
                  />
                </View>
              </View>
              
              {/* Unallocated Amount */}
              <View style={styles.unallocatedContainer}>
                <Text style={styles.unallocatedLabel}>Unallocated Budget:</Text>
                <Text 
                  style={[
                    styles.unallocatedAmount,
                    calculateUnallocated() < 0 ? styles.negativeAmount : {}
                  ]}
                >
                  ₹ {calculateUnallocated().toLocaleString()}
                </Text>
              </View>
              
              {/* Category Budgets */}
              <Text style={styles.sectionTitle}>Category Budgets</Text>
              {editingCategories.map((cat, index) => (
                <View key={index} style={styles.categoryEditCard}>
                  <TouchableOpacity 
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(index)}
                  >
                    <View style={styles.categoryNameContainer}>
                      <MaterialIcons 
                        name={getCategoryIcon(cat.name)} 
                        size={20} 
                        color="#FF3D3D" 
                      />
                      <Text style={styles.categoryName}>{cat.name}</Text>
                    </View>
                    <View style={styles.categoryHeaderRight}>
                      <Text style={styles.categoryBudgetSummary}>
                        ₹ {cat.budget.toLocaleString()}
                      </Text>
                      <MaterialIcons 
                        name={expandedCategory === index ? "expand-less" : "expand-more"} 
                        size={24} 
                        color="#FF3D3D" 
                      />
                    </View>
                  </TouchableOpacity>
                  
                  {expandedCategory === index && (
                    <View style={styles.categoryExpandedContent}>
                      <View style={styles.categoryStats}>
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>Spent</Text>
                          <Text style={styles.statValue}>₹ {cat.spent.toLocaleString()}</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>Remaining</Text>
                          <Text 
                            style={[
                              styles.statValue,
                              cat.budget - cat.spent < 0 ? styles.negativeAmount : {}
                            ]}
                          >
                            ₹ {(cat.budget - cat.spent).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={styles.budgetInputLabel}>New Budget Amount</Text>
                      <View style={styles.inputContainer}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                          style={styles.input}
                          value={cat.budget.toString()}
                          onChangeText={(value) => updateCategoryBudget(index, value)}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#666"
                        />
                      </View>
                      
                      {/* Progress visualization */}
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBarBackground}>
                          <View 
                            style={[
                              styles.progressBarFill, 
                              { width: `${Math.min(Math.round((cat.spent / cat.budget) * 100), 100)}%` },
                              (cat.spent / cat.budget) > 0.9 ? styles.dangerProgress : {}
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressLabel}>
                          {Math.round((cat.spent / cat.budget) * 100)}% of budget used
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={closeEditModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  calculateUnallocated() < 0 ? styles.disabledButton : {}
                ]}
                onPress={saveBudgetChanges}
                disabled={calculateUnallocated() < 0}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

// Get icon name based on category
function getCategoryIcon(category: string) {
  switch(category.toLowerCase()) {
    case 'food': return 'restaurant';
    case 'shopping': return 'shopping-bag';
    case 'utilities': return 'build';
    case 'entertainment': return 'movie';
    case 'transport': return 'directions-car';
    case 'health': return 'favorite';
    case 'education': return 'school';
    default: return 'category';
  }
}

// Additional styles for the modal and new components
const styles = {
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: '#FF3D3D',
    fontWeight: 'bold',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 10,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  currencySymbol: {
    color: '#999',
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    color: '#FFF',
    fontSize: 18,
    padding: 12,
    flex: 1,
  },
  unallocatedContainer: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unallocatedLabel: {
    color: '#999',
    fontSize: 14,
  },
  unallocatedAmount: {
    color: '#00BFA5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  negativeAmount: {
    color: '#FF3D3D',
  },
  categoryEditCard: {
    backgroundColor: '#222',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: '#FF3D3D',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  categoryNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 8,
  },
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBudgetSummary: {
    color: '#FFF',
    marginRight: 8,
  },
  categoryExpandedContent: {
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  categoryStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  budgetInputLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00BFA5',
  },
  progressLabel: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  dangerProgress: {
    backgroundColor: '#FF3D3D',
  },
  dangerText: {
    color: '#FF3D3D',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF3D3D',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#555',
  },
};
