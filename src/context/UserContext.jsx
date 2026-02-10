import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  supabase, onAuthStateChange, getProfile, upsertProfile, profileToUser,
  getWorkoutPlan, saveWorkoutPlan, getNutritionPlan, saveNutritionPlan,
  getProgressEntries, addProgressEntryDB, getChatMessages, addChatMessageDB,
  signOut,
} from '../services/supabase';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState('welcome');
  const [plans, setPlans] = useState(null);
  const [progress, setProgress] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [userDataLoading, setUserDataLoading] = useState(true);

  // --- Auth listener ---
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setUser(null);
        setOnboardingStep('welcome');
        setPlans(null);
        setProgress([]);
        setChatHistory([]);
        setUserDataLoading(false);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (!session) setUserDataLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Load user data when session is available ---
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadUserData = async () => {
      setUserDataLoading(true);
      try {
        const profile = await getProfile(session.user.id);
        const userData = profileToUser(profile);

        if (userData && userData.name) {
          setUser(userData);
          setOnboardingStep('dashboard');

          // Load plans, progress, chat in parallel
          const [workout, nutrition, progressData, chatData] = await Promise.all([
            getWorkoutPlan(session.user.id).catch(() => null),
            getNutritionPlan(session.user.id).catch(() => null),
            getProgressEntries(session.user.id).catch(() => []),
            getChatMessages(session.user.id).catch(() => []),
          ]);

          if (workout || nutrition) {
            setPlans({ workout, nutrition });
          }
          setProgress(progressData);
          setChatHistory(chatData);
        } else {
          // Profile exists but not filled => show onboarding
          setOnboardingStep('onboarding');
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setOnboardingStep('onboarding');
      } finally {
        setUserDataLoading(false);
      }
    };

    loadUserData();
  }, [session?.user?.id]);

  // --- Update user info (save to Supabase) ---
  const updateUserInfo = useCallback(async (newData) => {
    const merged = { ...user, ...newData };
    setUser(merged);

    if (session?.user?.id) {
      try {
        await upsertProfile(session.user.id, merged);
      } catch (err) {
        console.error('Profile save error:', err);
      }
    }
  }, [user, session]);

  // --- Update plans (save to Supabase) ---
  const updatePlans = useCallback(async (newPlans) => {
    const merged = plans ? { ...plans, ...newPlans } : newPlans;
    setPlans(merged);

    if (session?.user?.id) {
      try {
        if (newPlans.workout) await saveWorkoutPlan(session.user.id, newPlans.workout);
        if (newPlans.nutrition) await saveNutritionPlan(session.user.id, newPlans.nutrition);
      } catch (err) {
        console.error('Plans save error:', err);
      }
    }
  }, [plans, session]);

  // --- Add progress entry (save to Supabase) ---
  const addProgressEntry = useCallback(async (entry) => {
    const newEntry = { ...entry, date: new Date().toISOString() };
    setProgress(prev => [...prev, newEntry]);

    if (session?.user?.id) {
      try {
        await addProgressEntryDB(session.user.id, entry);
      } catch (err) {
        console.error('Progress save error:', err);
      }
    }
  }, [session]);

  // --- Add chat message (save to Supabase) ---
  const addChatMessage = useCallback(async (message) => {
    const newMsg = { ...message, timestamp: new Date().toISOString() };
    setChatHistory(prev => [...prev, newMsg]);

    if (session?.user?.id) {
      try {
        await addChatMessageDB(session.user.id, message);
      } catch (err) {
        console.error('Chat save error:', err);
      }
    }
  }, [session]);

  // --- Reset / Logout ---
  // --- Reset / Logout ---
  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    setUser(null);
    setPlans(null);
    setProgress([]);
    setChatHistory([]);
    setOnboardingStep('welcome');
    setSession(null);
  }, []);

  return (
    <UserContext.Provider value={{
      session,
      authLoading,
      userDataLoading,
      user,
      updateUserInfo,
      onboardingStep,
      setOnboardingStep,
      plans,
      updatePlans,
      progress,
      addProgressEntry,
      chatHistory,
      addChatMessage,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
