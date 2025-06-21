import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import transactionstyles from '@/constants/transactions';

const allTransactions = [
  { id: '1', title: 'McDonalds', amount: -12.5, date: 'Yesterday, 9:20 PM', category: 'Food' },
  { id: '2', title: 'Amazon', amount: -45.99, date: 'Apr 22, 2:15 PM', category: 'Shopping' },
  { id: '3', title: 'Freelance Work', amount: 500.0, date: 'Apr 20, 10:30 AM', category: 'Income' },
  { id: '4', title: 'Target', amount: 31.2, date: 'Apr 18, 4:52 PM', category: 'Shopping' },
];

const categories = ['All', 'Food', 'Shopping', 'Income'];

export default function TransactionScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTransactions =
    selectedCategory === 'All'
      ? allTransactions
      : allTransactions.filter((item) => item.category === selectedCategory);

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

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={transactionstyles.list}
        renderItem={({ item }) => (
          <View style={transactionstyles.card}>
            <Ionicons name="ellipse-outline" size={32} color="#FF3D5A" style={transactionstyles.cardIcon} />
            <View style={{ flex: 1 }}>
              <Text style={transactionstyles.cardTitle}>{item.title}</Text>
              <Text style={transactionstyles.cardDate}>{item.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[transactionstyles.cardAmount, { color: item.amount < 0 ? '#FF3D5A' : '#00FF8C' }]}>
                {item.amount > 0 ? `+${item.amount.toFixed(2)}` : item.amount.toFixed(2)}
              </Text>
              <View style={transactionstyles.categoryBadge}>
                <Text style={transactionstyles.categoryText}>{item.category}</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={transactionstyles.fab}>
        <Text style={transactionstyles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
