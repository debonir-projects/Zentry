import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';

// Define the transaction type
interface Transaction {
  id: string;
  text: string;
  amount: number;
  category: string;
  date: string; // ISO string
  time: string;
  icon: string;
  iconType: 'MaterialIcons' | 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome5';
  note?: string;
}

// Categories with icons
const CATEGORIES = [
  { name: 'All', icon: 'view-list', type: 'MaterialIcons' },
  { name: 'Food', icon: 'restaurant', type: 'MaterialIcons' },
  { name: 'Transport', icon: 'directions-car', type: 'MaterialIcons' },
  { name: 'Shopping', icon: 'shopping-bag', type: 'MaterialIcons' },
  { name: 'Entertainment', icon: 'movie', type: 'MaterialIcons' },
  { name: 'Bills', icon: 'receipt-long', type: 'MaterialIcons' },
  { name: 'Health', icon: 'medical-services', type: 'MaterialIcons' },
  { name: 'Income', icon: 'attach-money', type: 'MaterialIcons' },
  { name: 'Travel', icon: 'flight', type: 'MaterialIcons' },
  { name: 'Other', icon: 'more-horiz', type: 'MaterialIcons' },
];

// Mock transaction data
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    text: 'Salary Deposit',
    amount: 48000,
    category: 'Income',
    date: '2025-06-01',
    time: '09:15',
    icon: 'attach-money',
    iconType: 'MaterialIcons',
    note: 'Monthly salary from XYZ Corp'
  },
  {
    id: '2',
    text: 'Dinner at Spice Kitchen',
    amount: -1850,
    category: 'Food',
    date: '2025-06-20',
    time: '20:45',
    icon: 'restaurant',
    iconType: 'MaterialIcons',
  },
  {
    id: '3',
    text: 'Uber to Airport',
    amount: -620,
    category: 'Transport',
    date: '2025-06-19',
    time: '14:30',
    icon: 'local-taxi',
    iconType: 'MaterialIcons',
  },
  {
    id: '4',
    text: 'Movie Tickets',
    amount: -600,
    category: 'Entertainment',
    date: '2025-06-18',
    time: '18:20',
    icon: 'local-movies',
    iconType: 'MaterialIcons',
    note: 'Barbie with friends'
  },
  {
    id: '5',
    text: 'Nike Shoes',
    amount: -4500,
    category: 'Shopping',
    date: '2025-06-17',
    time: '13:45',
    icon: 'shopping-bag',
    iconType: 'MaterialIcons',
  },
  {
    id: '6',
    text: 'Electricity Bill',
    amount: -2200,
    category: 'Bills',
    date: '2025-06-15',
    time: '09:30',
    icon: 'bolt',
    iconType: 'MaterialIcons',
  },
  {
    id: '7',
    text: 'Doctor Appointment',
    amount: -1500,
    category: 'Health',
    date: '2025-06-14',
    time: '11:20',
    icon: 'medical-services',
    iconType: 'MaterialIcons',
    note: 'Annual checkup'
  },
  {
    id: '8',
    text: 'Grocery Shopping',
    amount: -3200,
    category: 'Food',
    date: '2025-06-12',
    time: '17:40',
    icon: 'shopping-cart',
    iconType: 'MaterialIcons',
  },
  {
    id: '9',
    text: 'Refund from Amazon',
    amount: 1200,
    category: 'Shopping',
    date: '2025-06-10',
    time: '14:15',
    icon: 'money',
    iconType: 'MaterialIcons',
  },
  {
    id: '10',
    text: 'Coffee at Starbucks',
    amount: -420,
    category: 'Food',
    date: '2025-06-10',
    time: '09:50',
    icon: 'coffee',
    iconType: 'MaterialIcons',
  },
  {
    id: '11',
    text: 'Gym Membership',
    amount: -2500,
    category: 'Health',
    date: '2025-06-05',
    time: '18:30',
    icon: 'fitness-center',
    iconType: 'MaterialIcons',
  },
  {
    id: '12',
    text: 'Internet Bill',
    amount: -1100,
    category: 'Bills',
    date: '2025-06-05',
    time: '12:10',
    icon: 'wifi',
    iconType: 'MaterialIcons',
  },
  {
    id: '13',
    text: 'Weekend Trip',
    amount: -8500,
    category: 'Travel',
    date: '2025-06-03',
    time: '07:45',
    icon: 'flight',
    iconType: 'MaterialIcons',
    note: 'Weekend getaway to the mountains'
  },
  {
    id: '14',
    text: 'Freelance Project',
    amount: 15000,
    category: 'Income',
    date: '2025-06-02',
    time: '15:30',
    icon: 'work',
    iconType: 'MaterialIcons',
    note: 'Website redesign for client'
  },
];

export default function TransactionScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Animation values
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Format date to more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Group transactions by date
  const groupedTransactions = () => {
    const filtered = transactions.filter(transaction => {
      // Filter by category
      const categoryMatch = selectedCategory === 'All' || transaction.category === selectedCategory;
      
      // Filter by search query
      const searchMatch = searchQuery === '' || 
        transaction.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by selected date
      const dateMatch = !selectedDate || transaction.date === selectedDate;
      
      return categoryMatch && searchMatch && dateMatch;
    });
    
    // Sort transactions by date (newest first)
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Group by date
    const grouped: { [key: string]: Transaction[] } = {};
    sorted.forEach(transaction => {
      if (!grouped[transaction.date]) {
        grouped[transaction.date] = [];
      }
      grouped[transaction.date].push(transaction);
    });
    
    // Convert to array for FlatList
    return Object.entries(grouped).map(([date, items]) => ({
      date,
      items,
    }));
  };
  
  // Toggle search bar
  const toggleSearch = () => {
    if (showSearch) {
      // Hide search bar
      Animated.timing(searchBarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setSearchQuery('');
    } else {
      // Show search bar
      Animated.timing(searchBarAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    setShowSearch(!showSearch);
  };
  
  // Animation for category change
  useEffect(() => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
    
    // Slide animation
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.cubic),
      }),
    ]).start();
  }, [selectedCategory, selectedDate]);
  
  // Clear date filter
  const clearDateFilter = () => {
    setSelectedDate(null);
    setShowDatePicker(false);
  };
  
  // Get category icon
  const getCategoryIcon = (iconName: string, iconType: string, size = 24, color = '#fff') => {
    switch (iconType) {
      case 'MaterialIcons':
        return <MaterialIcons name={iconName as any} size={size} color={color} />;
      case 'Ionicons':
        return <Ionicons name={iconName as any} size={size} color={color} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName as any} size={size} color={color} />;
      default:
        return <MaterialIcons name="help" size={size} color={color} />;
    }
  };
  
  // Get total income, expenses, and balance
  const financialSummary = () => {
    const allTransactions = transactions;
    const income = allTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = allTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const balance = income - expenses;
    
    return { income, expenses, balance };
  };
  
  const summary = financialSummary();
  
  // Render item separator
  const renderSeparator = () => (
    <View style={styles.separator} />
  );
  
  // Animation for list items
  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const animatedStyle = {
      opacity: fadeAnim,
      transform: [{ translateX: slideAnim }],
    };
    
    return (
      <Animated.View style={animatedStyle}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          <View style={styles.dateLine} />
        </View>
        
        {item.items.map((transaction: Transaction) => (
          <TouchableOpacity 
            key={transaction.id}
            style={styles.transactionCard}
            onPress={() => {
              // Navigate to transaction details in a real app
              console.log('View transaction details:', transaction.id);
            }}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              { backgroundColor: transaction.amount >= 0 ? '#00BFA5' : '#FF3D3D' }
            ]}>
              {getCategoryIcon(transaction.icon, transaction.iconType)}
            </View>
            
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionText}>{transaction.text}</Text>
              <View style={styles.transactionMeta}>
                <Text style={styles.timeText}>{transaction.time}</Text>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{transaction.category}</Text>
                </View>
              </View>
              {transaction.note && (
                <Text style={styles.noteText}>{transaction.note}</Text>
              )}
            </View>
            
            <View style={styles.amountContainer}>
              <Text style={[
                styles.amountText,
                transaction.amount >= 0 ? styles.incomeText : styles.expenseText
              ]}>
                {transaction.amount >= 0 ? '+' : ''}
                ₹{Math.abs(transaction.amount).toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header with stats slider */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>TRANSACTIONS</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialIcons name="date-range" size={24} color="#FF3D3D" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={toggleSearch}
            >
              <MaterialIcons 
                name={showSearch ? "close" : "search"} 
                size={24} 
                color="#FF3D3D" 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Financial summary slider */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onMomentumScrollEnd={(e) => {
            const newPage = Math.round(
              e.nativeEvent.contentOffset.x / (Dimensions.get('window').width - 40)
            );
            setCurrentPage(newPage);
          }}
          style={styles.summarySlider}
        >
          {/* Balance Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>BALANCE</Text>
            <Text style={styles.summaryAmount}>₹{summary.balance.toLocaleString()}</Text>
            <View style={styles.summaryFooter}>
              <Text style={styles.summaryLabel}>Current Month</Text>
            </View>
          </View>
          
          {/* Income Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>INCOME</Text>
            <Text style={[styles.summaryAmount, styles.incomeText]}>
              ₹{summary.income.toLocaleString()}
            </Text>
            <View style={styles.summaryFooter}>
              <Text style={styles.summaryLabel}>Current Month</Text>
            </View>
          </View>
          
          {/* Expenses Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>EXPENSES</Text>
            <Text style={[styles.summaryAmount, styles.expenseText]}>
              ₹{summary.expenses.toLocaleString()}
            </Text>
            <View style={styles.summaryFooter}>
              <Text style={styles.summaryLabel}>Current Month</Text>
            </View>
          </View>
        </ScrollView>
        
        {/* Slider pagination dots */}
        <View style={styles.pagination}>
          {[0, 1, 2].map((index) => (
            <View 
              key={index}
              style={[
                styles.paginationDot,
                currentPage === index && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
        
        {/* Animated Search Bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              maxHeight: searchBarAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 60]
              }),
              opacity: searchBarAnim,
              transform: [
                {
                  translateY: searchBarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0]
                  })
                }
              ]
            }
          ]}
        >
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={showSearch}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
        
        {/* Date filter chip */}
        {selectedDate && (
          <View style={styles.dateFilterContainer}>
            <View style={styles.dateChip}>
              <MaterialIcons name="event" size={16} color="#FF3D3D" />
              <Text style={styles.dateChipText}>{formatDate(selectedDate)}</Text>
              <TouchableOpacity onPress={clearDateFilter}>
                <MaterialIcons name="close" size={16} color="#FF3D3D" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
      {/* Category Selector */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.name}
              onPress={() => setSelectedCategory(category.name)}
              style={[
                styles.categoryChip,
                selectedCategory === category.name && styles.categoryChipSelected,
              ]}
            >
              {getCategoryIcon(category.icon, category.type, 18, 
                selectedCategory === category.name ? '#fff' : '#FF3D3D')}
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.name && styles.categoryChipTextSelected,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Transaction List */}
      <FlatList
        data={groupedTransactions()}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Image
              source={{ uri: 'https://i.imgur.com/oeQELRO.png' }}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory !== 'All' || selectedDate
                ? 'Try changing your filters'
                : 'Add your first transaction to get started'}
            </Text>
          </View>
        )}
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('./addTransaction')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      
      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <MaterialIcons name="close" size={24} color="#FF3D3D" />
              </TouchableOpacity>
            </View>
            
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setShowDatePicker(false);
              }}
              markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#FF3D3D' } } : {}}
              theme={{
                backgroundColor: '#111',
                calendarBackground: '#111',
                textSectionTitleColor: '#fff',
                selectedDayBackgroundColor: '#FF3D3D',
                selectedDayTextColor: '#fff',
                todayTextColor: '#FF3D3D',
                dayTextColor: '#fff',
                textDisabledColor: '#444',
                dotColor: '#FF3D3D',
                monthTextColor: '#fff',
                indicatorColor: '#FF3D3D',
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '500',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 14
              }}
            />
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={clearDateFilter}
              >
                <Text style={styles.modalButtonText}>Clear</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalPrimaryButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Custom Date Picker */}
      <View style={styles.customDatePicker}>
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => {}}>
            <MaterialIcons name="chevron-left" size={28} color="#FF3D3D" />
          </TouchableOpacity>
          
          <Text style={styles.monthText}>June 2025</Text>
          
          <TouchableOpacity onPress={() => {}}>
            <MaterialIcons name="chevron-right" size={28} color="#FF3D3D" />
          </TouchableOpacity>
        </View>
        
        {/* Days Header */}
        <View style={styles.daysHeader}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text key={index} style={styles.dayLabel}>{day}</Text>
          ))}
        </View>
        
        {/* Days Grid */}
        <View style={styles.daysGrid}>
          {/* Render day buttons here */}
          {Array.from({ length: 30 }).map((_, index) => {
            const day = index + 1;
            const isSelected = selectedDate && new Date(selectedDate).getDate() === day;
            
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  isSelected && styles.selectedDay,
                ]}
                onPress={() => {
                  const date = new Date(2025, 5, day);
                  setSelectedDate(date.toISOString().split('T')[0]);
                }}
              >
                <Text style={[
                  styles.dayText,
                  isSelected && styles.selectedDayText,
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#111',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 20,
    shadowColor: '#FF3D3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  summarySlider: {
    marginBottom: 15,
  },
  summaryCard: {
    width: Dimensions.get('window').width - 40,
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#444',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FF3D3D',
    width: 16,
  },
  searchContainer: {
    overflow: 'hidden',
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 61, 61, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FF3D3D',
  },
  dateChipText: {
    color: '#FF3D3D',
    marginHorizontal: 6,
    fontSize: 14,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
  },
  categoryList: {
    paddingBottom: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF3D3D',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  categoryChipSelected: {
    backgroundColor: '#FF3D3D',
  },
  categoryChipText: {
    color: '#FF3D3D',
    marginLeft: 6,
    fontSize: 14,
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  dateText: {
    color: '#FF3D3D',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 10,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3D3D',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  timeText: {
    color: '#999',
    fontSize: 12,
    marginRight: 8,
  },
  categoryTag: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: {
    color: '#ccc',
    fontSize: 11,
  },
  noteText: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
  },
  amountContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#00BFA5',
  },
  expenseText: {
    color: '#FF3D3D',
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3D3D',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FF3D3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#111',
    borderRadius: 20,
    width: '90%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  modalPrimaryButton: {
    backgroundColor: '#FF3D3D',
    borderColor: '#FF3D3D',
  },
  modalPrimaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  customDatePicker: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 10,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayLabel: {
    color: '#999',
    fontSize: 12,
    width: 30,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayButton: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  selectedDay: {
    backgroundColor: '#FF3D3D',
    borderRadius: 20,
  },
  dayText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

