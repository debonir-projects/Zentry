import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { budgetstyles } from "@/constants/budget.styles"; // import the stylesheet

export default function MonthlyBudget() {
  const categories = [
    { name: "Food", budget: 10000, spent: 8200 },
    { name: "Shopping", budget: 15000, spent: 13500 },
    { name: "Utilities", budget: 8000, spent: 6700 },
  ];

  const totalBudget = 50000;
  const totalSpent = 37200;
  const remaining = totalBudget - totalSpent;

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
              <View style={[budgetstyles.progressBarFill, { width: `${percentage}%` }]} />
            </View>
            <Text style={budgetstyles.categoryPercentage}>{percentage}%</Text>
          </View>
        );
      })}

      {/* Edit Button */}
      <TouchableOpacity style={budgetstyles.editButton}>
        <Text style={budgetstyles.editButtonText}>Edit Budget</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={budgetstyles.footer}>
        <Text style={budgetstyles.footerText}>
          Stay ahead. Spend within. Conquer your month{"\n"}with Zentry.
        </Text>
      </View>
    </ScrollView>
  );
}
