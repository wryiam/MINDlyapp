import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';

const AuthScreen = () => {
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login' or 'signup'
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    console.log('✅ User logged in:', userData);
    setUser(userData);
    // Here you could navigate to a home screen or main app
    // For now, we'll just log it
  };

  const handleSignupSuccess = (userData) => {
    console.log('✅ User signed up:', userData);
    // Automatically switch to login after successful signup
    setCurrentScreen('login');
  };

  const switchToLogin = () => {
    setCurrentScreen('login');
  };

  const switchToSignup = () => {
    setCurrentScreen('signup');
  };

  // If user is logged in, you could show a different screen
  if (user) {
    return (
      <View style={styles.loggedInContainer}>
        <Text style={styles.welcomeText}>
          Welcome, {user.username}!
        </Text>
        <Text style={styles.infoText}>
          You are successfully logged in.
        </Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => setUser(null)}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentScreen === 'login' ? (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={switchToSignup}
        />
      ) : (
        <SignupScreen
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AuthScreen;