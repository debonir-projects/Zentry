import { useAuth } from '@clerk/clerk-expo';
import { useState, useEffect } from 'react';

export function useSafeAuth() {
  const [isReady, setIsReady] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    // Set ready state once auth is loaded
    if (auth.isLoaded) {
      setIsReady(true);
    }
  }, [auth.isLoaded]);

  return {
    ...auth,
    isReady
  };
}
