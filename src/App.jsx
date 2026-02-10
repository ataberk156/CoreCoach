import React, { useState, useEffect } from 'react';
import { useUser } from './context/UserContext';
import AuthScreen from './components/Auth/AuthScreen';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import Sidebar from './components/Dashboard/Sidebar';
import OverviewPage from './components/Dashboard/OverviewPage';
import WorkoutPage from './components/Workout/WorkoutPage';
import NutritionPage from './components/Nutrition/NutritionPage';
import ProgressPage from './components/Progress/ProgressPage';
import ChatView from './components/Dashboard/ChatView';
import SettingsView from './components/Dashboard/SettingsView';
import { generateWorkoutPlan, generateNutritionPlan } from './services/ai';

function App() {
  const { session, authLoading, onboardingStep, user, plans, updatePlans } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [plansLoading, setPlansLoading] = useState(false);

  // Generate plans when user first reaches dashboard without plans
  useEffect(() => {
    const fetchPlans = async () => {
      if (onboardingStep === 'dashboard' && !plans && user && !plansLoading) {
        setPlansLoading(true);
        try {
          const [workout, nutrition] = await Promise.all([
            generateWorkoutPlan(user),
            generateNutritionPlan(user),
          ]);
          await updatePlans({ workout, nutrition });
        } catch (err) {
          console.error('Plan generation failed:', err);
        } finally {
          setPlansLoading(false);
        }
      }
    };
    fetchPlans();
  }, [onboardingStep, plans, user]);

  // Auth loading
  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-dots"><span></span><span></span><span></span></div>
        <p>Bağlanıyor...</p>
      </div>
    );
  }

  // Not logged in
  if (!session) return <AuthScreen />;

  // Onboarding
  if (onboardingStep === 'onboarding' || onboardingStep === 'welcome') {
    return <OnboardingFlow />;
  }

  // Plans loading
  if (plansLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-dots"><span></span><span></span><span></span></div>
        <p>AI Koçun planlarını hazırlıyor...</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'overview': return <OverviewPage onNavigate={setActiveTab} />;
      case 'workout': return <WorkoutPage />;
      case 'nutrition': return <NutritionPage />;
      case 'progress': return <ProgressPage />;
      case 'chat': return <ChatView />;
      case 'settings': return <SettingsView />;
      default: return <OverviewPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content fade-in-up">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
