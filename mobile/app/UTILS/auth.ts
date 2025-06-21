// Create a new file: utils/auth.ts
import { useAuth } from "@clerk/clerk-expo";

export default async function getAuthorizationHeader() {
  const { getToken } = useAuth();
  const token = await getToken();
  
  if (!token) {
    throw new Error("No authentication token available");
  }
  
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};
