import { Stack } from 'expo-router';
import AuthProvider from './providers/clerkproviders';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  );
}