import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function AgenticVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [schema, setSchema] = useState<null | { items: string[]; prices: number[] }>(null);
  const [loading, setLoading] = useState(false);

  // Placeholder for voice input logic
  const handleVoiceInput = async () => {
    setIsListening(true);
    setLoading(true);
    setTranscript('');
    setSchema(null);

    // Simulate voice recognition and schema creation
    setTimeout(() => {
      setIsListening(false);
      setLoading(false);
      setTranscript(
        "Add 10 bags of cement at $50 each, 20 steel rods at $30 each, and 5 cubic meters of sand at $15 each."
      );
      setSchema({
        items: ['Cement (10 bags)', 'Steel Rods (20)', 'Sand (5 m³)'],
        prices: [500, 600, 75],
      });
    }, 2500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Agentic Voice Assistant</Text>
      <Text style={styles.subtitle}>
        Speak your construction requirements. I’ll listen, extract items and prices, and create a schema for your project.
      </Text>

      <TouchableOpacity
        style={[styles.micButton, isListening && styles.micButtonActive]}
        onPress={handleVoiceInput}
        disabled={isListening || loading}
      >
        <FontAwesome name="microphone" size={36} color="#fff" />
        <Text style={styles.micText}>{isListening ? 'Listening...' : 'Tap to Speak'}</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#FF3C3C" style={{ marginVertical: 24 }} />
      )}

      {transcript ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transcript</Text>
          <Text style={styles.transcript}>{transcript}</Text>
        </View>
      ) : null}

      {schema ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Construction Schema</Text>
          {schema.items.map((item, idx) => (
            <View key={item} style={styles.schemaRow}>
              <Text style={styles.schemaItem}>{item}</Text>
              <Text style={styles.schemaPrice}>${schema.prices[idx]}</Text>
            </View>
          ))}
          <Text style={styles.schemaNote}>
            This schema will be stored securely for your account.
          </Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your voice data is processed securely. Each user’s construction schema is stored privately in our database.
        </Text>
      </View>
    </ScrollView>
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
  micButton: {
    backgroundColor: '#FF3C3C',
    borderRadius: 60,
    width: 120,
    height: 120,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 8,
    shadowColor: '#FF3C3C',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: '#B22222',
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
    marginBottom: 8,
  },
  transcript: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 4,
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
  schemaNote: {
    color: '#999',
    fontSize: 13,
    marginTop: 10,
    fontStyle: 'italic',
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
});