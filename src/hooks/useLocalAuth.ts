import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface LocalUser {
  id: string;
  email: string;
  display_name: string;
}

export function useLocalAuth() {
  const [storedUser, setStoredUser] = useLocalStorage<LocalUser | null>('deadliner-user', null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial auth check
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    // Simple local signup - just create a user
    const newUser: LocalUser = {
      id: crypto.randomUUID(),
      email,
      display_name: displayName || email.split('@')[0],
    };
    setStoredUser(newUser);
    return { data: { user: newUser }, error: null };
  };

  const signIn = async (email: string, _password: string) => {
    // Simple local signin - just set the user
    const user: LocalUser = {
      id: crypto.randomUUID(),
      email,
      display_name: email.split('@')[0],
    };
    setStoredUser(user);
    return { data: { user }, error: null };
  };

  const signOut = async () => {
    setStoredUser(null);
    return { error: null };
  };

  // Convert to format compatible with existing code
  const user = storedUser ? {
    id: storedUser.id,
    email: storedUser.email,
    user_metadata: {
      display_name: storedUser.display_name,
    },
  } : null;

  return {
    user,
    session: storedUser ? { user } : null,
    loading,
    signUp,
    signIn,
    signOut,
  };
}
