import { View, Text } from 'react-native'
import React from 'react'
import { TextInput } from './ui/TextInput'
import { Button } from '@react-navigation/elements'
const AddTransaction = () => {
  return (
    <View>
      <Text>Add Transaction</Text>
      <TextInput placeholder="Transaction Text" />
      <TextInput placeholder="Amount" keyboardType="numeric" />
      
    </View>
  )
}

export default AddTransaction