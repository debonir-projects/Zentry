import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import transactionstyles from '@/constants/transactions';
import { useSafeAuth } from '@/hooks/useSafeAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

// Define the transaction type based on your backend model
interface Transaction {
  id: string;
  text: string;
  amount: number;
  category?: string;
  createdAt: string;
  memories: any[];
}

const categories = ['All', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Travel', 'Other'];

export default function TransactionScreen() {
  const router = useRouter();
  // Use the safe auth hook for consistent auth state
  const { getToken, userId, isSignedIn, isLoaded } = useSafeAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Function to fetch transactions from backend
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get auth token from Clerk
      const token = await getToken();
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      // Use correct endpoint that matches your backend route
      const response = await fetch('https://zentry-14tu.onrender.com/api/transactions/getUserTransactions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load transactions when component mounts or when auth state changes
  useEffect(() => {
    if (isSignedIn) {
      fetchTransactions();
    }
  }, [isSignedIn]);

  // Redirect to sign in when not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Delay navigation slightly to avoid race conditions
      const timer = setTimeout(() => {
        router.replace('/auth/login');
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn]);

  // Filter transactions by category
  const filteredTransactions = 
    selectedCategory === 'All'
      ? transactions
      : transactions.filter(item => item.category === selectedCategory);

  // Show loading spinner while auth is initializing
  if (!isLoaded) {
    return <LoadingSpinner message="Initializing..." />;
  }

  // Show loading indicator while fetching transactions
  if (loading) {
    return (
      <SafeAreaView style={transactionstyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF3D5A" />
          <Text style={{ color: 'white', marginTop: 10 }}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <SafeAreaView style={transactionstyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3D5A" />
          <Text style={{ color: 'white', marginTop: 10, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#FF3D5A', 
              padding: 12, 
              borderRadius: 8, 
              marginTop: 20 
            }}
            onPress={fetchTransactions}
          >
            <Text style={{ color: 'white' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main transactions view
  return (
    <SafeAreaView style={transactionstyles.container}>
      {/* Header */}
      <View style={transactionstyles.header}>
        <Text style={transactionstyles.title}>TRANSACTIONS</Text>
        <Ionicons name="search" size={24} color="#FF3D5A" />
      </View>

      {/* Category Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={transactionstyles.categoryScroll}
        contentContainerStyle={transactionstyles.categoryList}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              transactionstyles.categoryChip,
              selectedCategory === cat && transactionstyles.categoryChipSelected,
            ]}
          >
            <Text
              style={[
                transactionstyles.categoryChipText,
                selectedCategory === cat && transactionstyles.categoryChipTextSelected,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Empty state */}
      {transactions.length === 0 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="receipt-outline" size={64} color="#666" />
          <Text style={{ color: 'white', marginTop: 16, textAlign: 'center' }}>
            No transactions found. Add your first transaction!
          </Text>
        </View>
      )}

      {/* Transaction List */}
      {transactions.length > 0 && (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={transactionstyles.list}
          renderItem={({ item }) => (
            <View style={transactionstyles.card}>
              <Ionicons name="ellipse-outline" size={32} color="#FF3D5A" style={transactionstyles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={transactionstyles.cardTitle}>{item.text}</Text>
                <Text style={transactionstyles.cardDate}>{formatDate(item.createdAt)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[transactionstyles.cardAmount, { color: item.amount < 0 ? '#FF3D5A' : '#00FF8C' }]}>
                  {item.amount > 0 ? `+${item.amount.toFixed(2)}` : item.amount.toFixed(2)}
                </Text>
                {item.category && (
                  <View style={transactionstyles.categoryBadge}>
                    <Text style={transactionstyles.categoryText}>{item.category}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          refreshing={loading}
          onRefresh={fetchTransactions}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={transactionstyles.fab}
        onPress={() => {
          router.push('./../components/AddTransaction'); // Adjust path as needed
        }}
      >
        <Text style={transactionstyles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
