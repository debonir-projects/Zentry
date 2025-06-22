import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView,
  TextInput,
  Animated,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as SpeechRecognition from 'expo-speech-recognition';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your Gemini API key
const GEMINI_API_KEY = "AIzaSyBFFWcBbKD_YLt9u3ZOBvIUINsbt7gjKTc";

// Predefined user data for the hackathon demo
const MOCK_USERS = {
  anirban: {
    name: "Anirban",
    budget: 50000,
    spent: 37200,
    categories: [
      { name: "Food", budget: 10000, spent: 8200 },
      { name: "Shopping", budget: 15000, spent: 13500 },
      { name: "Utilities", budget: 8000, spent: 6700 },
      { name: "Entertainment", budget: 7000, spent: 5000 },
    ],
    transactions: [
      { item: "Groceries", category: "Food", price: 1200, date: "Today" },
      { item: "Netflix", category: "Entertainment", price: 499, date: "Yesterday" },
      { item: "New Shoes", category: "Shopping", price: 3500, date: "3 days ago" },
    ]
  },
  debopriya: {
    name: "Debopriya",
    budget: 45000,
    spent: 28000,
    categories: [
      { name: "Food", budget: 8000, spent: 5200 },
      { name: "Shopping", budget: 12000, spent: 10500 },
      { name: "Utilities", budget: 6000, spent: 4700 },
      { name: "Entertainment", budget: 5000, spent: 3800 },
    ],
    transactions: [
      { item: "Dinner", category: "Food", price: 850, date: "Today" },
      { item: "Phone Bill", category: "Utilities", price: 1200, date: "2 days ago" },
      { item: "Headphones", category: "Shopping", price: 2800, date: "5 days ago" },
    ]
  }
};

// Available categories for expense logging
const CATEGORIES = ['Food', 'Shopping', 'Utilities', 'Entertainment', 'Transport', 'Health', 'Education', 'Other'];

// Define different assistant modes
const MODES = {
  INTRODUCTION: 'introduction',
  MODE_SELECTION: 'mode_selection',
  BUDGET_COUNSELLOR: 'budget_counsellor',
  EXPENSE_LOGGER: 'expense_logger',
  NAME_VALIDATION: 'name_validation',
  COUNSELLING: 'counselling',
  EXPENSE_DETAILS: 'expense_details',
  CONFIRMATION: 'confirmation'
};

export default function AgenticVoiceAssistant() {
  // Existing states
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [schema, setSchema] = useState<null | { items: string[]; prices: number[] }>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // New states for enhanced functionality
  const [mode, setMode] = useState(MODES.INTRODUCTION);
  const [conversations, setConversations] = useState<{role: string, content: string}[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [expenseCard, setExpenseCard] = useState<any>(null);
  const [expenseForm, setExpenseForm] = useState({
    item: '',
    category: 'Food',
    price: ''
  });
  const [savedExpenses, setSavedExpenses] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Speak text function
  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      await Speech.speak(text, {
        language: 'en-IN',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (err) {
      console.error('Text-to-speech error', err);
      setIsSpeaking(false);
    }
  };

  // Get Gemini response
  const getGeminiResponse = async (prompt: string) => {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Error getting Gemini response:", error);
      return "I'm sorry, I encountered an error. Please try again.";
    }
  };

  // Update conversation and speak response
  const updateConversation = async (userMessage: string, assistantMessage: string) => {
    const updatedConversations = [
      ...conversations,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage }
    ];
    
    setConversations(updatedConversations);
    await speakText(assistantMessage);
  };

  // Start introduction on component mount
  useEffect(() => {
    const introduction = async () => {
      const introMessage = "Hello! I'm Zentry, your personal financial assistant. I can help you manage your finances in two ways.";
      setConversations([{ role: 'assistant', content: introMessage }]);
      await speakText(introMessage);
      
      setTimeout(async () => {
        const modeSelectionMessage = "Would you like me to be your budget counsellor or help you log new expenses?";
        setConversations(prev => [...prev, { role: 'assistant', content: modeSelectionMessage }]);
        await speakText(modeSelectionMessage);
        setMode(MODES.MODE_SELECTION);
      }, 3000);
    };
    
    introduction();
    
    // Cleanup function
    return () => {
      if (isSpeaking) {
        Speech.stop();
      }
    };
  }, []);

  // Pulse animation for the voice button
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isListening]);

  // Fade in animation for new content
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [mode, expenseCard]);

  // Handle voice input based on current mode
  const handleVoiceInput = async () => {
    // Stop speaking if currently speaking
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsListening(true);
    setLoading(true);

    // Simulate voice recognition with predefined responses based on current mode
    setTimeout(async () => {
      setIsListening(false);
      setLoading(false);
      
      let simulatedUserInput = "";
      let assistantResponse = "";
      
      // Different responses based on current mode
      switch(mode) {
        case MODES.MODE_SELECTION:
          // Randomly select either "budget counsellor" or "expense logger"
          simulatedUserInput = Math.random() > 0.5 ? "Budget counsellor" : "Expense logger";
          
          if (simulatedUserInput === "Budget counsellor") {
            assistantResponse = "Great! I'll be your budget counsellor. May I know your name? I'm currently set up for Anirban or Debopriya.";
            setMode(MODES.NAME_VALIDATION);
          } else {
            assistantResponse = "I'll help you log a new expense. Please tell me what you purchased, the category, and how much it cost.";
            setMode(MODES.EXPENSE_LOGGER);
          }
          break;
          
        case MODES.NAME_VALIDATION:
          // Randomly select either "Anirban" or "Debopriya"
          simulatedUserInput = Math.random() > 0.5 ? "Anirban" : "Debopriya";
          
          if (simulatedUserInput.toLowerCase() === "anirban") {
            setCurrentUser(MOCK_USERS.anirban);
            assistantResponse = `Hello Anirban! I can see you have a total budget of ₹50,000 with ₹37,200 already spent. How can I help you with your budget today?`;
            setMode(MODES.COUNSELLING);
          } else if (simulatedUserInput.toLowerCase() === "debopriya") {
            setCurrentUser(MOCK_USERS.debopriya);
            assistantResponse = `Hello Debopriya! I can see you have a total budget of ₹45,000 with ₹28,000 already spent. How can I help you with your budget today?`;
            setMode(MODES.COUNSELLING);
          } else {
            assistantResponse = "I'm sorry, I can only recognize Anirban or Debopriya for this demo. Please try again.";
          }
          break;
          
        case MODES.COUNSELLING:
          // Instead of simulating with hardcoded questions, use actual user input
          // We'll get the transcript from speech recognition in a real app
          simulatedUserInput = transcript || "Can I afford a new laptop?";
          setTranscript(''); // Clear transcript after using it
          
          // Get personalized response from Gemini based on the current user's data
          const user = currentUser;
          const counsellingPrompt = `
You are a helpful financial assistant named Zentry. Provide personalized financial advice for ${user.name}.

User's financial data:
- Total budget: ₹${user.budget}
- Total spent: ₹${user.spent}
- Remaining: ₹${user.budget - user.spent}

Budget categories:
${user.categories.map(cat => `- ${cat.name}: Budget ₹${cat.budget}, Spent ₹${cat.spent}, Remaining ₹${cat.budget - cat.spent}`).join('\n')}

Recent transactions:
${user.transactions.map(t => `- ${t.item}: ₹${t.price} (${t.category}) - ${t.date}`).join('\n')}

The user asks: "${simulatedUserInput}"

Provide a helpful, personalized response addressing their specific question. Be concise but helpful. Include specific numbers and recommendations based on their actual budget situation.

After your main response, suggest 2 follow-up questions the user might want to ask based on the context of the conversation. Format them with "FOLLOW_UP_1:" and "FOLLOW_UP_2:" prefixes on separate lines at the end of your response.
`;

          try {
            const fullResponse = await getGeminiResponse(counsellingPrompt);
            
            // Extract main response and follow-up questions
            const followUpRegex = /FOLLOW_UP_\d+:(.*?)(?=FOLLOW_UP_\d+:|$)/gs;
            const mainResponseEnd = fullResponse.indexOf('FOLLOW_UP_1:');
            
            const mainResponse = mainResponseEnd > 0 
              ? fullResponse.substring(0, mainResponseEnd).trim() 
              : fullResponse.trim();
              
            // Extract follow-up questions
            const followUpMatches = [...fullResponse.matchAll(followUpRegex)];
            const followUpQuestions = followUpMatches.map(match => match[1].trim());
            
            // Set the main response
            assistantResponse = mainResponse;
            
            // Store follow-up questions for later use
            if (followUpQuestions.length > 0) {
              setFollowUpQuestions(followUpQuestions);
            }
            
            // Update schema with relevant financial data based on the question
            if (simulatedUserInput.toLowerCase().includes("afford") || 
                simulatedUserInput.toLowerCase().includes("buy") || 
                simulatedUserInput.toLowerCase().includes("purchase")) {
              // Try to extract the price from the question
              const priceMatch = simulatedUserInput.match(/₹([0-9,]+)/);
              const itemPrice = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 60000;
              
              setSchema({
                items: ['Total Budget', 'Already Spent', 'Remaining', 'Item Cost'],
                prices: [user.budget, user.spent, user.budget - user.spent, itemPrice]
              });
            } else if (simulatedUserInput.toLowerCase().includes("shopping")) {
              const shoppingCat = user.categories.find(c => c.name === "Shopping");
              if (shoppingCat) {
                setSchema({
                  items: ['Shopping Budget', 'Already Spent', 'Remaining'],
                  prices: [shoppingCat.budget, shoppingCat.spent, shoppingCat.budget - shoppingCat.spent]
                });
              }
            } else if (simulatedUserInput.toLowerCase().includes("biggest") || 
                      simulatedUserInput.toLowerCase().includes("largest") ||
                      simulatedUserInput.toLowerCase().includes("most")) {
              const sortedCats = [...user.categories].sort((a, b) => b.spent - a.spent);
              setSchema({
                items: sortedCats.map(c => c.name),
                prices: sortedCats.map(c => c.spent)
              });
            } else {
              // Default view
              setSchema({
                items: ['Total Budget', 'Total Spent', 'Remaining'],
                prices: [user.budget, user.spent, user.budget - user.spent]
              });
            }
          } catch (error) {
            console.error("Gemini API error:", error);
            assistantResponse = "I'm having trouble analyzing your budget right now. Please try again later.";
          }
          break;
          
        case MODES.EXPENSE_LOGGER:
          simulatedUserInput = "I bought groceries for ₹1,800 in the Food category";
          
          // Extract expense details using Gemini
          const expensePrompt = `
Extract expense details from the following text: "${simulatedUserInput}"

Return ONLY a JSON object with these fields:
{
  "item": "the item or service purchased",
  "category": "closest match to one of: Food, Shopping, Utilities, Entertainment, Transport, Health, Education, Other",
  "price": number without currency symbol
}
`;

          try {
            const jsonResponse = await getGeminiResponse(expensePrompt);
            const extractedData = JSON.parse(jsonResponse);
            
            setExpenseForm({
              item: extractedData.item || '',
              category: extractedData.category || 'Other',
              price: extractedData.price?.toString() || ''
            });
            
            assistantResponse = `I've logged your expense: ${extractedData.item} for ₹${extractedData.price} in the ${extractedData.category} category. Is this correct?`;
            
            // Create an expense card
            setExpenseCard({
              item: extractedData.item,
              category: extractedData.category,
              price: extractedData.price,
              date: new Date().toLocaleDateString()
            });
            
            setMode(MODES.CONFIRMATION);
          } catch (error) {
            console.error("Error extracting expense details:", error);
            assistantResponse = "I couldn't understand the expense details. Please try again with the item name, category, and price.";
          }
          break;
          
        case MODES.CONFIRMATION:
          simulatedUserInput = Math.random() > 0.3 ? "Yes, that's correct" : "No, let me edit it";
          
          if (simulatedUserInput.toLowerCase().includes("yes")) {
            // Save the expense
            setSavedExpenses(prev => [expenseCard, ...prev]);
            assistantResponse = `Great! I've saved your expense for ${expenseCard.item}. Would you like to add another expense or switch to budget counsellor mode?`;
            setExpenseCard(null);
            setMode(MODES.MODE_SELECTION);
          } else {
            assistantResponse = "No problem. You can edit the expense details manually using the form below.";
            setMode(MODES.EXPENSE_DETAILS);
          }
          break;
          
        default:
          simulatedUserInput = "Hi";
          assistantResponse = "Hello! How can I help you with your finances today?";
      }
      
      // Update conversation with the new exchange
      await updateConversation(simulatedUserInput, assistantResponse);
      
    }, 2000);
  };

  // Handle quick action buttons
  const handleQuickAction = async (action: string) => {
    let assistantResponse = "";
    
    switch(action) {
      case 'budget_counsellor':
        assistantResponse = "Great! I'll be your budget counsellor. May I know your name? I'm currently set up for Anirban or Debopriya.";
        setMode(MODES.NAME_VALIDATION);
        break;
        
      case 'expense_logger':
        assistantResponse = "I'll help you log a new expense. Please tell me what you purchased, the category, and how much it cost.";
        setMode(MODES.EXPENSE_LOGGER);
        break;
        
      case 'anirban':
        setCurrentUser(MOCK_USERS.anirban);
        assistantResponse = `Hello Anirban! I can see you have a total budget of ₹50,000 with ₹37,200 already spent. How can I help you with your budget today?`;
        setMode(MODES.COUNSELLING);
        break;
        
      case 'debopriya':
        setCurrentUser(MOCK_USERS.debopriya);
        assistantResponse = `Hello Debopriya! I can see you have a total budget of ₹45,000 with ₹28,000 already spent. How can I help you with your budget today?`;
        setMode(MODES.COUNSELLING);
        break;
        
      case 'confirm_expense':
        if (expenseCard) {
          setSavedExpenses(prev => [expenseCard, ...prev]);
          assistantResponse = `Great! I've saved your expense for ${expenseCard.item}. Would you like to add another expense or switch to budget counsellor mode?`;
          setExpenseCard(null);
          setMode(MODES.MODE_SELECTION);
        }
        break;
        
      case 'edit_expense':
        assistantResponse = "No problem. You can edit the expense details manually using the form below.";
        setMode(MODES.EXPENSE_DETAILS);
        break;
    }
    
    if (assistantResponse) {
      await speakText(assistantResponse);
      setConversations(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
    }
  };

  // Handle manual expense form submission
  const handleExpenseSubmit = async () => {
    if (!expenseForm.item || !expenseForm.price) {
      await speakText("Please fill in all the expense details.");
      return;
    }
    
    const newExpense = {
      ...expenseForm,
      price: parseFloat(expenseForm.price),
      date: new Date().toLocaleDateString()
    };
    
    setSavedExpenses(prev => [newExpense, ...prev]);
    setExpenseCard(null);
    
    const message = `I've saved your expense for ${newExpense.item}. Would you like to add another expense or switch to budget counsellor mode?`;
    await speakText(message);
    setConversations(prev => [...prev, { role: 'assistant', content: message }]);
    
    setExpenseForm({
      item: '',
      category: 'Food',
      price: ''
    });
    
    setMode(MODES.MODE_SELECTION);
  };

  // Render mode-specific content
  const renderModeContent = () => {
    switch(mode) {
      case MODES.MODE_SELECTION:
        return (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Choose a Mode</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.modeButton}
                onPress={() => handleQuickAction('budget_counsellor')}
              >
                <MaterialIcons name="account-balance-wallet" size={24} color="#FF3C3C" />
                <Text style={styles.modeButtonText}>Budget Counsellor</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modeButton}
                onPress={() => handleQuickAction('expense_logger')}
              >
                <MaterialIcons name="add-shopping-cart" size={24} color="#FF3C3C" />
                <Text style={styles.modeButtonText}>Expense Logger</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
        
      case MODES.NAME_VALIDATION:
        return (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Select Your Profile</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => handleQuickAction('anirban')}
              >
                <Text style={styles.profileButtonText}>Anirban</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => handleQuickAction('debopriya')}
              >
                <Text style={styles.profileButtonText}>Debopriya</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
        
      case MODES.COUNSELLING:
        if (currentUser) {
          return (
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>Budget Overview</Text>
              <View style={styles.budgetCard}>
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>Total Budget:</Text>
                  <Text style={styles.budgetValue}>₹{currentUser.budget.toLocaleString()}</Text>
                </View>
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>Spent:</Text>
                  <Text style={styles.budgetValue}>₹{currentUser.spent.toLocaleString()}</Text>
                </View>
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>Remaining:</Text>
                  <Text style={[styles.budgetValue, styles.remainingValue]}>
                    ₹{(currentUser.budget - currentUser.spent).toLocaleString()}
                  </Text>
                </View>
                
                <Text style={styles.categoriesTitle}>Categories</Text>
                {currentUser.categories.map((cat: any, index: number) => (
                  <View key={index} style={styles.categoryRow}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{cat.name}</Text>
                      <View style={styles.progressContainer}>
                        <View 
                          style={[
                            styles.progressBar, 
                            { width: `${Math.min(100, (cat.spent / cat.budget) * 100)}%` }
                          ]} 
                        />
                      </View>
                    </View>
                    <View style={styles.categoryValues}>
                      <Text style={styles.categorySpent}>₹{cat.spent.toLocaleString()}</Text>
                      <Text style={styles.categoryBudget}>/ ₹{cat.budget.toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
              </View>
              
              <Text style={styles.quickActionsTitle}>Ask About:</Text>
              <View style={styles.quickButtonsRow}>
                <TouchableOpacity style={styles.quickButton}>
                  <Text style={styles.quickButtonText}>New Purchase</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickButton}>
                  <Text style={styles.quickButtonText}>Spending Analysis</Text>
                </TouchableOpacity>
              </View>

              {followUpQuestions.length > 0 && (
                <View style={styles.followUpContainer}>
                  <Text style={styles.followUpTitle}>You might also want to ask:</Text>
                  {followUpQuestions.map((question, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.followUpButton}
                      onPress={() => {
                        setTranscript(question);
                        handleVoiceInput();
                      }}
                    >
                      <Text style={styles.followUpButtonText}>{question}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#FF3C3C" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Animated.View>
          );
        }
        return null;
        
      case MODES.EXPENSE_LOGGER:
      case MODES.EXPENSE_DETAILS:
        return (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Log New Expense</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Item</Text>
              <TextInput
                style={styles.input}
                value={expenseForm.item}
                onChangeText={(text) => setExpenseForm({...expenseForm, item: text})}
                placeholder="What did you purchase?"
                placeholderTextColor="#666"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity 
                style={styles.categorySelector}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.categoryText}>{expenseForm.category}</Text>
                <Ionicons name="chevron-down" size={20} color="#FF3C3C" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Price (₹)</Text>
              <TextInput
                style={styles.input}
                value={expenseForm.price}
                onChangeText={(text) => setExpenseForm({...expenseForm, price: text.replace(/[^0-9]/g, '')})}
                placeholder="Enter amount"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleExpenseSubmit}
            >
              <Text style={styles.submitButtonText}>Save Expense</Text>
            </TouchableOpacity>
          </Animated.View>
        );
        
      case MODES.CONFIRMATION:
        if (expenseCard) {
          return (
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>Confirm Expense</Text>
              <View style={styles.expenseCardContainer}>
                <View style={styles.expenseCard}>
                  <View style={styles.expenseCardHeader}>
                    <Text style={styles.expenseCardCategory}>{expenseCard.category}</Text>
                    <Text style={styles.expenseCardDate}>{expenseCard.date}</Text>
                  </View>
                  <Text style={styles.expenseCardItem}>{expenseCard.item}</Text>
                  <Text style={styles.expenseCardPrice}>₹{expenseCard.price.toLocaleString()}</Text>
                </View>
              </View>
              
              <View style={styles.confirmationButtons}>
                <TouchableOpacity 
                  style={[styles.confirmButton, styles.editButton]}
                  onPress={() => handleQuickAction('edit_expense')}
                >
                  <Ionicons name="pencil" size={18} color="#FFF" />
                  <Text style={styles.confirmButtonText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.confirmButton, styles.saveButton]}
                  onPress={() => handleQuickAction('confirm_expense')}
                >
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        }
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Zentry Financial Assistant</Text>
        <Text style={styles.subtitle}>
          Your AI-powered financial companion
        </Text>

        {isSpeaking && (
          <View style={styles.speakingIndicator}>
            <Text style={styles.speakingText}>Speaking...</Text>
            <ActivityIndicator size="small" color="#FF3C3C" style={{ marginLeft: 8 }} />
          </View>
        )}

        <Animated.View
          style={[
            styles.micButtonContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.micButton, 
              isListening && styles.micButtonActive,
              isSpeaking && styles.micButtonSpeaking
            ]}
            onPress={handleVoiceInput}
            disabled={isListening && !isSpeaking}
          >
            <FontAwesome 
              name={isSpeaking ? "volume-up" : isListening ? "microphone" : "microphone"} 
              size={36} 
              color="#fff" 
            />
            <Text style={styles.micText}>
              {isSpeaking ? 'Tap to Stop' : isListening ? 'Listening...' : 'Tap to Speak'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {loading && (
          <ActivityIndicator size="large" color="#FF3C3C" style={{ marginVertical: 24 }} />
        )}

        {/* Conversation History */}
        {conversations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conversation</Text>
            <ScrollView style={styles.conversationContainer}>
              {conversations.map((message, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.messageBubble, 
                    message.role === 'user' ? styles.userBubble : styles.assistantBubble
                  ]}
                >
                  <Text style={styles.messageText}>{message.content}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Mode-specific content */}
        {renderModeContent()}

        {/* Financial Analysis */}
        {schema && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financial Analysis</Text>
            {schema.items.map((item, idx) => (
              <View key={item} style={styles.schemaRow}>
                <Text style={styles.schemaItem}>{item}</Text>
                <Text style={styles.schemaPrice}>₹{schema.prices[idx].toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Saved Expenses */}
        {savedExpenses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            {savedExpenses.slice(0, 3).map((expense, index) => (
              <View key={index} style={styles.savedExpenseCard}>
                <View>
                  <Text style={styles.savedExpenseItem}>{expense.item}</Text>
                  <Text style={styles.savedExpenseCategory}>{expense.category}</Text>
                </View>
                <View>
                  <Text style={styles.savedExpensePrice}>₹{expense.price.toLocaleString()}</Text>
                  <Text style={styles.savedExpenseDate}>{expense.date}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by Gemini AI. Your voice data is processed securely.
          </Text>
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryOption,
                  expenseForm.category === category && styles.selectedCategoryOption
                ]}
                onPress={() => {
                  setExpenseForm({...expenseForm, category});
                  setShowCategoryModal(false);
                }}
              >
                <Text 
                  style={[
                    styles.categoryOptionText,
                    expenseForm.category === category && styles.selectedCategoryText
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF3C3C',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
  },
  speakingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  speakingText: {
    color: '#FF3C3C',
    fontSize: 16,
    fontWeight: '600',
  },
  micButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  micButton: {
    backgroundColor: '#FF3C3C',
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3C3C',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: '#B22222',
  },
  micButtonSpeaking: {
    backgroundColor: '#2E8B57',
  },
  micText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 10,
  },
  section: {
    backgroundColor: '#181818',
    borderRadius: 14,
    padding: 18,
    marginVertical: 12,
  },
  sectionTitle: {
    color: '#FF3C3C',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  conversationContainer: {
    maxHeight: 200,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#333',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FF3C3C',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 22,
  },
  schemaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  schemaItem: {
    color: '#fff',
    fontSize: 15,
  },
  schemaPrice: {
    color: '#FF3C3C',
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modeButton: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modeButtonText: {
    color: '#FF3C3C',
    fontWeight: '600',
    marginTop: 8,
  },
  profileButton: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 14,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  profileButtonText: {
    color: '#FF3C3C',
    fontWeight: '600',
    fontSize: 16,
  },
  budgetCard: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetLabel: {
    color: '#AAA',
    fontSize: 15,
  },
  budgetValue: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  remainingValue: {
    color: '#00FFAA',
  },
  categoriesTitle: {
    color: '#FF3C3C',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 8,
  },
  categoryName: {
    color: '#FFF',
    marginBottom: 4,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF3C3C',
  },
  categoryValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categorySpent: {
    color: '#FF3C3C',
    fontWeight: 'bold',
  },
  categoryBudget: {
    color: '#666',
    marginLeft: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#AAA',
    marginBottom: 8,
    fontSize: 15,
  },
  input: {
    backgroundColor: '#222',
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    color: '#FFF',
    padding: 12,
    fontSize: 16,
  },
  categorySelector: {
    backgroundColor: '#222',
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    color: '#FFF',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#FF3C3C',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  expenseCardContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  expenseCard: {
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    shadowColor: '#FF3C3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  expenseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  expenseCardCategory: {
    color: '#FF3C3C',
    fontWeight: '600',
  },
  expenseCardDate: {
    color: '#AAA',
    fontSize: 12,
  },
  expenseCardItem: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  expenseCardPrice: {
    color: '#00FFAA',
    fontSize: 22,
    fontWeight: 'bold',
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  confirmButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#444',
  },
  saveButton: {
    backgroundColor: '#00FFAA',
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  savedExpenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  savedExpenseItem: {
    color: '#FFF',
    fontWeight: '600',
  },
  savedExpenseCategory: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 4,
  },
  savedExpensePrice: {
    color: '#FF3C3C',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  savedExpenseDate: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3C3C',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedCategoryOption: {
    backgroundColor: '#33333340',
  },
  categoryOptionText: {
    color: '#FFF',
    fontSize: 16,
  },
  selectedCategoryText: {
    color: '#FF3C3C',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  quickActionsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 12,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickButton: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  quickButtonText: {
    color: '#FF3C3C',
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    padding: 12,
  },
  footerText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
  },
  followUpContainer: {
    marginTop: 16,
  },
  followUpTitle: {
    color: '#FF3C3C',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  followUpButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  followUpButtonText: {
    color: '#FF3C3C',
    fontWeight: '600',
    fontSize: 15,
  },
});