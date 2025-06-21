import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React, { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {
  const { isSignedIn, isLoaded, signOut } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  // Handle authentication flow
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Optional: Auto-redirect to login
      // router.replace('/auth/login')
    }
  }, [isLoaded, isSignedIn])

  // Log the user object when loaded, signed in, and user data is available
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      console.log("User object:", JSON.stringify(user, null, 2));
    }
  }, [isLoaded, isSignedIn, user])

  // Handle login button press
  const handleLogin = () => {
    router.push('/auth/login')
  }

  // Handle sign out
  const handleSignOut = async () => {
    await signOut()
  }

  // Loading state
  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Zentry</Text>
      </View>

      {isSignedIn ? (
        // Signed-in state
        <View style={styles.profileContainer}>
          <View style={styles.profileHeader}>
            {user?.hasImage ? (
              <Image 
                source={{ uri: user.imageUrl }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {user?.firstName?.charAt(0) || user?.fullName?.charAt(0) || user?.primaryEmailAddress?.emailAddress?.charAt(0) || '?'}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.fullName || user?.firstName || user?.username || 'User'}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || 'No email'}
              </Text>
            </View>
          </View>

          <Text style={styles.sessionInfo}>
            Session ID: {user?.id.substring(0, 10)}...
          </Text>

          <TouchableOpacity 
            style={styles.signOutButton} 
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={18} color="white" />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Signed-out state
        <View style={styles.signInContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#FF3D5A" />
          <Text style={styles.signInText}>
            Sign in to view your profile and access your data
          </Text>
          <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
            <Ionicons name="log-in-outline" size={18} color="white" />
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3D5A',
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  signInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signInText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3D5A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  profileContainer: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF3D5A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: 20,
  },
  profileName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileEmail: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 5,
  },
  sessionInfo: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 20,
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3D5A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default Home