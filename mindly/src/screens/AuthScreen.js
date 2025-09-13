import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import GenStartScreen from './GenStartScreen';
import SignupScreen from './MultiStepSignup';
import TutorialScreen from './TutorialScreen';
import LandingPage from './LandingPage'; 
import LoginScreen from './LoginScreen';
import SavedArticlesScreen from './SavedArticlesScreen';

const AuthScreen = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    console.log('✅ User logged in:', userData);
    setUser(userData);
    setCurrentScreen('landing');
  };

  const handleSignupSuccess = (userData) => {
    console.log('✅ User signed up:', userData);
    setUser(userData);
    setCurrentScreen('tutorial');
  };

  const handleTutorialComplete = () => {
    console.log('✅ Tutorial completed');
    setCurrentScreen('landing');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('welcome');
    console.log('🔓 User logged out');
  };

  const switchToLogin = () => {
    console.log('🔄 Switching to login screen');
    setCurrentScreen('login');
  };

  const switchToSignup = () => {
    console.log('🔄 Switching to signup screen');
    setCurrentScreen('signup');
  };

  const navigateToSaved = () => {
    console.log('📂 Navigating to saved articles');
    setCurrentScreen('saved');
  };

  const navigateBackToNews = () => {
    console.log('📰 Back to news');
    setCurrentScreen('landing');
  };

  // For debugging
  console.log('Current screen:', currentScreen);

  // ---------------- RENDERING PURPOSES ----------------
  if (currentScreen === 'landing' && user) {
    return (
      <LandingPage 
        user={user}
        onLogout={handleLogout}
        navigateToSaved={() => setCurrentScreen("saved")} 
      />

    );
  }

  if (currentScreen === 'saved' && user) {
    return (
      <SavedArticlesScreen 
        user={user}
        onGoBack={navigateBackToNews}
      />
    );
  }

  if (currentScreen === 'tutorial' && user) {
    return (
      <TutorialScreen 
        user={user}
        onComplete={handleTutorialComplete}
      />
    );
  }

  if (currentScreen === 'welcome') {
    return (
      <GenStartScreen
        onSwitchToLogin={switchToLogin}
        onSwitchToSignup={switchToSignup}
      />
    );
  }

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={switchToSignup}
      />
    );
  }

  if (currentScreen === 'signup') {
    return (
      <SignupScreen
        onSignupSuccess={handleSignupSuccess}
        onSwitchToLogin={switchToLogin}
        onBack={() => setCurrentScreen('welcome')}
      />
    );
  }

  // fallback
  return (
    <GenStartScreen
      onSwitchToLogin={switchToLogin}
      onSwitchToSignup={switchToSignup}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AuthScreen;
