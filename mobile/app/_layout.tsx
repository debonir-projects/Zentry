import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot } from 'expo-router'

export default function RootLayout() {
  return (
 <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <Slot />
    </ClerkProvider>
  )
}