import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { homestyles } from "@/constants/home.styles";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

export default function ZentryDashboard() {
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    note: '',
    category: 'Shopping',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([
    { 
      id: '1',
      text: 'The Ordinary Niacinamide Serum',
      amount: -799.00,
      category: 'Shopping',
      date: new Date(),
      time: '10:15'
    },
    { 
      id: '2',
      text: 'Coffee with friends',
      amount: -180.00,
      category: 'Food',
      date: new Date(),
      time: '12:30'
    },
    { 
      id: '3',
      text: 'Received UPI from Mom',
      amount: 2000.00,
      category: 'Income',
      date: new Date(),
      time: '09:00'
    },
    { 
      id: '4',
      text: 'Sunscreen SPF50',
      amount: -499.00,
      category: 'Shopping',
      date: new Date(),
      time: '16:45'
    },
    { 
      id: '5',
      text: 'Metro Card Recharge',
      amount: -300.00,
      category: 'Transport',
      date: new Date(),
      time: '08:20'
    },
    { 
      id: '6',
      text: 'Netflix Subscription',
      amount: -199.00,
      category: 'Entertainment',
      date: new Date(),
      time: '21:00'
    }
  ]);
  const [balance, setBalance] = useState(3500);
  const router = useRouter();

  const categories = ['Shopping', 'Food', 'Transport', 'Entertainment', 'Bills', 'Health', 'Education', 'Income', 'Other'];

  // Get category icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Food': return 'restaurant';
      case 'Transport': return 'directions-car';
      case 'Shopping': return 'shopping-bag';
      case 'Entertainment': return 'movie';
      case 'Bills': return 'receipt';
      case 'Health': return 'favorite';
      case 'Education': return 'school';
      case 'Income': return 'attach-money';
      default: return 'category';
    }
  };

  // Format current time
  const formatTime = () => {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  // Handle adding a new transaction locally
  const handleAddTransaction = () => {
    if (!formData.text || !formData.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    // Create new transaction object
    const newTransaction = {
      id: Date.now().toString(),
      text: formData.text,
      amount: parseFloat(formData.amount),
      category: formData.category,
      note: formData.note,
      date: new Date(),
      time: formatTime()
    };

    // Update transactions list and balance
    setTransactions([newTransaction, ...transactions]);
    setBalance(prevBalance => prevBalance + parseFloat(formData.amount));
    
    // Reset form and close modal
    setFormData({ text: '', note: '', category: 'Shopping', amount: '' });
    setLoading(false);
    setModalVisible(false);
    
    Alert.alert('Success', 'Transaction added successfully!');
  };

  return (
    <SafeAreaView style={homestyles.container}>
      {/* Sidebar */}
      <View style={homestyles.sidebar}>
        <View style={homestyles.profileSection}>
          <Image
            source={{
              uri: "https://avatars.githubusercontent.com/u/178933981?v=4",
            }}
            style={homestyles.profileImage}
          />
          <Text style={homestyles.profileName}>Debopriya Debnath</Text>
          <Text style={{color: "#FF3D3D", fontSize: 13, marginTop: 2}}>21 • Tech Engineer</Text>
          <Text style={{color: "#fff", fontSize: 12, marginTop: 2}}>Skincare | Coding | Coffee</Text>
        </View>

        {/* Menu Items */}
        <View>
          <MenuItem icon="account-balance-wallet" label="Bank Accounts" />
          <MenuItem icon="pie-chart" label="Budget" />
          <MenuItem 
            icon="person" 
            label="People" 
            onPress={() => router.push('../pages/people')}
          />
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
        <Text style={homestyles.welcomeText}>Welcome, Debopriya 👋</Text>
        <Text style={{color: "#FF3D3D", fontSize: 15, marginBottom: 10}}>Let's keep your glow & goals on track!</Text>

        {/* Balance Card */}
        <View style={homestyles.card}>
          <Text style={homestyles.cardTitle}>Balance</Text>
          <Text style={homestyles.cardValue}>₹{balance.toLocaleString()}</Text>
        </View>

        {/* Transactions Card */}
        <View style={[homestyles.card, homestyles.transactionList]}>
          <Text style={homestyles.cardTitle}>Recent Transactions</Text>
          
          {transactions.length > 0 ? (
            transactions.map(transaction => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.categoryIconContainer}>
                    <MaterialIcons 
                      name={getCategoryIcon(transaction.category)} 
                      size={20} 
                      color="#FFF" 
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionText}>{transaction.text}</Text>
                    <Text style={styles.transactionCategory}>{transaction.category}</Text>
                  </View>
                  <View style={styles.transactionAmountContainer}>
                    <Text style={[
                      styles.transactionAmount,
                      transaction.amount >= 0 ? styles.positiveAmount : styles.negativeAmount
                    ]}>
                      {transaction.amount >= 0 ? '+ ' : '- '}
                      ₹{Math.abs(transaction.amount).toFixed(2)}
                    </Text>
                    <Text style={styles.transactionTime}>{transaction.time}</Text>
                  </View>
                </View>
                
                {transaction.note && (
                  <Text style={styles.transactionNote}>{transaction.note}</Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyTransactions}>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          )}
          
          {transactions.length > 3 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/(tabs)/transactions')}
            >
              <Text style={styles.viewAllText}>View All Transactions</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Monthly Budget Card */}
        <View style={homestyles.card}>
          <Text style={homestyles.cardTitle}>Monthly Budget</Text>
          <Text style={homestyles.cardValue}>₹5,000</Text>
        </View>

        {/* Add Transaction Button */}
        <TouchableOpacity 
          style={homestyles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={homestyles.addButtonText}>Add Transaction</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{padding: 20, flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)'}}>
          <View style={{maxHeight: '90%', backgroundColor: '#000', borderRadius: 16, padding: 20, borderWidth: 2, borderColor: '#FF3D3D'}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
              <Text style={{color: '#FF3D3D', fontSize: 18, fontWeight: '600'}}>Add Transaction</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FF3D3D" />
              </TouchableOpacity>
            </View>

            <ScrollView style={modalStyles.form}>
              {/* Transaction Text */}
              <Text style={{color: '#FFFFFF', fontSize: 16, fontWeight: '600'}}>Transaction Description *</Text>
              <TextInput
                style={modalStyles.input}
                value={formData.text}
                onChangeText={(text) => setFormData({...formData, text})}
                placeholder="e.g. Laneige Lip Mask"
                placeholderTextColor="#666"
              />

              {/* Amount */}
              <Text style={{color: '#FFFFFF', fontSize: 16, fontWeight: '600'}}>Amount *</Text>
              <View style={styles.amountInputContainer}>
                <TouchableOpacity 
                  style={styles.amountTypeButton}
                  onPress={() => {
                    // Toggle between positive and negative by flipping the sign
                    if (formData.amount) {
                      const currentAmount = parseFloat(formData.amount);
                      setFormData({...formData, amount: (-currentAmount).toString()});
                    }
                  }}
                >
                  <Text style={styles.amountTypeText}>
                    {!formData.amount || parseFloat(formData.amount) >= 0 ? 'Income +' : 'Expense -'}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={[modalStyles.input, styles.amountInput]}
                  value={formData.amount ? Math.abs(parseFloat(formData.amount)).toString() : ''}
                  onChangeText={(amount) => {
                    // Preserve the sign when updating the amount
                    const isNegative = formData.amount && parseFloat(formData.amount) < 0;
                    const newAmount = amount ? parseFloat(amount) : 0;
                    setFormData({...formData, amount: (isNegative ? -newAmount : newAmount).toString()});
                  }}
                  placeholder="Enter amount"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>

              {/* Category */}
              <Text style={{color: '#FFFFFF', fontSize: 16, fontWeight: '600'}}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={modalStyles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      modalStyles.categoryChip,
                      formData.category === category && modalStyles.selectedCategory
                    ]}
                    onPress={() => setFormData({...formData, category})}
                  >
                    <MaterialIcons 
                      name={getCategoryIcon(category)} 
                      size={16} 
                      color={formData.category === category ? '#FFFFFF' : '#FF3D3D'} 
                      style={{marginRight: 4}}
                    />
                    <Text style={[
                      modalStyles.categoryText,
                      formData.category === category && modalStyles.selectedCategoryText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Note */}
              <Text style={{color: '#FFFFFF', fontSize: 16, fontWeight: '600'}}>Note (Optional)</Text>
              <TextInput
                style={[
                  modalStyles.input,
                  {
                    height: 80,
                    textAlignVertical: 'top',
                  }
                ]}
                value={formData.note}
                onChangeText={(note) => setFormData({...formData, note})}
                placeholder="Add a note..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            {/* Action Buttons */}
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12}}>
              <TouchableOpacity
                style={{
                  flex: 1, 
                  backgroundColor: 'transparent', 
                  borderWidth: 1, 
                  borderColor: '#FF3D3D', 
                  paddingVertical: 14, 
                  borderRadius: 8, 
                  alignItems: 'center'
                }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{color: '#FF3D3D', fontSize: 16, fontWeight: '600'}}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1, 
                  backgroundColor: '#FF3D3D', 
                  paddingVertical: 14, 
                  borderRadius: 8, 
                  alignItems: 'center',
                  opacity: loading ? 0.6 : 1
                }}
                onPress={handleAddTransaction}
                disabled={loading}
              >
                <Text style={{color: '#FFFFFF', fontSize: 16, fontWeight: '600'}}>
                  {loading ? 'Adding...' : 'Add Transaction'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Sidebar Menu Item Component
function MenuItem({
  icon,
  label,
  onPress,
}) {
  const isActive = label === "Theme";

  return (
    <TouchableOpacity
      style={[homestyles.menuItem, isActive && homestyles.activeMenuItem]}
      onPress={onPress}
    >
      <MaterialIcons
        name={icon }
        size={18}
        color="#FF3D3D"
        style={homestyles.menuIcon}
      />
      <Text style={homestyles.menuText}>{label}</Text>
    </TouchableOpacity>
  );
}

// Additional styles for the enhanced transaction cards
const styles = {
  transactionCard: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3D3D',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF3D3D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  transactionCategory: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: '#00FFAA',
  },
  negativeAmount: {
    color: '#FF3D3D',
  },
  transactionTime: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },
  transactionNote: {
    color: '#AAA',
    fontSize: 13,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  emptyTransactions: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#777',
    fontSize: 14,
  },
  viewAllButton: {
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
    marginTop: 8,
  },
  viewAllText: {
    color: '#FF3D3D',
    fontWeight: '500',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountTypeButton: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#FF3D3D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  amountTypeText: {
    color: '#FF3D3D',
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
  },
};

// Modal Styles
const modalStyles = {
  form: {
    maxHeight: 400,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderColor: '#FF3D3D',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF3D3D',
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  selectedCategory: {
    backgroundColor: '#FF3D3D',
  },
  categoryText: {
    color: '#FF3D3D',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
};

