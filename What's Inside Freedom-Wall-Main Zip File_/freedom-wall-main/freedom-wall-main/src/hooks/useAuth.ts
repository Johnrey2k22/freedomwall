import { useState, useEffect } from 'react';
import { createClient, User } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      checkUserRole(session?.user?.id);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      checkUserRole(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true); // Indicate that an auth operation is in progress
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Clear user state and update role/loading status on error
        setUser(null);
        await checkUserRole(undefined); // This ensures loading is false and isAdmin is false
        throw error;
      }

      if (data.user) {
        setUser(data.user); // Update user state immediately
        await checkUserRole(data.user.id); // Await the role check to complete
                                          // checkUserRole will set loading to false
      } else {
        // This case should ideally not be reached if there's no error,
        // but handle it defensively.
        setUser(null);
        await checkUserRole(undefined); // Ensures loading is false and isAdmin is false
      }
      return data;
    } catch (error) {
      // If any error occurs (either from Supabase or during our state updates)
      // ensure auth state is reset and loading is false.
      // checkUserRole(undefined) handles this if not already called.
      // The primary throw is above, this catch is more for unforeseen issues.
      if (user !== null || isAdmin !== false) { // Avoid redundant call if already reset
        setUser(null);
        await checkUserRole(undefined);
      }
      throw error; // Re-throw the error to be caught by the calling component
    }
  };

  const signOut = async () => {
    setLoading(true); // Set loading true, onAuthStateChange will set it to false after processing.
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      setLoading(false); // If signOut itself fails, revert loading state.
      throw error;
    }
    // If successful, onAuthStateChange handles the rest (setUser, checkUserRole, setLoading(false)).
  };

  return {
    user,
    isAdmin,
    loading,
    signIn,
    signOut,
  };
};