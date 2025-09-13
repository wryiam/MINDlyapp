import React, { useState } from 'react';
import SwipeableNewsScreen from './LandingPage';
import SavedArticlesScreen from './SavedArticlesScreen';

const AppNavigationWrapper = ({ user, onLogout }) => {
  const [currentScreen, setCurrentScreen] = useState('news'); // 'news' or 'saved'

  const navigateToSaved = () => {
    console.log("Navigating to SavedArticlesScreen...");
    setCurrentScreen('saved');
  };

  const navigateToNews = () => {
    console.log("Navigating back to SwipeableNewsScreen...");
    setCurrentScreen('news');
  };

  if (currentScreen === 'saved') {
    return (
      <SavedArticlesScreen
        user={user}
        onGoBack={navigateToNews}
      />
    );
  }

  return (
    <SwipeableNewsScreen
        user={user}
        onLogout={onLogout}
        navigateToSaved={navigateToSaved} // ✅ match prop name
        />
  );
};

export default AppNavigationWrapper;
