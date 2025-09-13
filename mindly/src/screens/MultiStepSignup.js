import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import SignupScreen from './SignupScreen';
import OnboardingScreen from './GenreSelectionScreen';
import ProfilePictureScreen from './ProfilePictureScreen';
import { API_URL_DEV_WEB, API_URL_DEV_MOBILE, API_URL_PROD } from '@env';

const MultiStepSignup = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    genres: [],
    profilePicture: null,
  });

  const getApiUrl = () => {
    if (__DEV__) {
      if (Platform.OS === 'web') {
        return API_URL_DEV_WEB;
      } else {
        return API_URL_DEV_MOBILE;
      }
    } else {
      return API_URL_PROD;
    }
  };


  const API_BASE_URL = getApiUrl();

  console.log(`🌐 Using API URL: ${API_BASE_URL}`);
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`🔗 Making API call to: ${url}`);
    console.log(`🔗 Method: ${options.method || 'GET'}`);

    try {
      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        cache: 'no-cache',
        ...options,
      };

      console.log(`📤 Request config:`, {
        method: config.method,
        headers: config.headers,
        hasBody: !!config.body,
      });

      const response = await fetch(url, config);

      console.log(`📡 Response status: ${response.status}`);
      console.log(`📡 Response ok: ${response.ok}`);

      const responseText = await response.text();
      console.log(`📡 Response text: ${responseText}`);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.log('⚠️ Response is not valid JSON:', parseError.message);
        responseData = { error: responseText || `HTTP ${response.status}` };
      }

      if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || `HTTP ${response.status}: ${responseText}`;
        throw new Error(errorMessage);
      }

      return responseData;

    } catch (error) {
      console.error(`❌ API call failed for ${endpoint}:`, error);

      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('NetworkError'))) {
        throw new Error('Network connection failed. Please check:\n• Server is running\n• Correct IP address\n• Same WiFi network\n• No firewall blocking port 5000');
      } else if (error.message.includes('CORS')) {
        throw new Error('CORS configuration error. Server may not be properly configured.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Request timeout. Server may be slow or not responding.');
      } else {
        throw error;
      }
    }
  };
  useEffect(() => {
    testCORSConnection();
  }, []);

  const testCORSConnection = async () => {
    try {
      console.log('🧪 Testing CORS connection...');
      
      const data = await apiCall('/api/test-cors');
      
      console.log('✅ CORS test successful:', data);

      
    } catch (error) {
      console.log('❌ CORS test failed:', error.message);
      

      Alert.alert(
        'Server Connection Failed', 
        `Cannot connect to server at ${API_BASE_URL}\n\n${error.message}\n\nPlease check:\n• Flask server is running\n• Using correct IP address\n• Same network connection`,
        [
          { text: 'Retry', onPress: testCORSConnection },
          { text: 'Continue', style: 'cancel' }
        ]
      );
    }
  };

  const handleStepComplete = (stepData) => {
    console.log(`✅ Step ${currentStep} completed:`, stepData);
    setSignupData(prev => ({ ...prev, ...stepData }));
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onSwitchToLogin();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinalSignup = async (finalData) => {
    const completeSignupData = { ...signupData, ...finalData };
        
    console.log('🚀 Attempting signup with data:', {
      username: completeSignupData.username,
      email: completeSignupData.email,
      hasPassword: !!completeSignupData.password,
      genres: completeSignupData.genres,
      hasProfilePicture: !!completeSignupData.profilePicture
    });

    setIsLoading(true);

    try {
      const data = await apiCall('/api/signup', {
        method: 'POST',
        body: JSON.stringify(completeSignupData),
      });

      console.log('📡 Signup response:', data);

      if (data.user || data.message === 'User created successfully') {
        const user = data.user || {
          username: completeSignupData.username,
          email: completeSignupData.email,
        };

        console.log('✅ User created successfully:', user);

        setCurrentStep(1);
        setSignupData({
          username: '',
          email: '',
          password: '',
          genres: [],
          profilePicture: null,
        });

        Alert.alert(
          'Success!', 
          `Welcome ${user.username}! Your account has been created.`,
          [{ text: 'Continue', onPress: () => onSignupSuccess(user) }]
        );
      } else {
        throw new Error('Signup failed - no user data returned');
      }
    } catch (error) {
      console.error('❌ Signup error:', error);

      let errorMessage = 'Signup failed. Please try again.';
      let shouldRetry = true;

      if (error.message.includes('Username already exists')) {
        errorMessage = 'This username is already taken. Please choose a different username.';
        shouldRetry = false;
        setCurrentStep(1);
      } else if (error.message.includes('Email already registered')) {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
        shouldRetry = false;
        setCurrentStep(1);
      } else if (error.message.includes('Network connection failed')) {
        errorMessage = `Cannot connect to server.\n\n${error.message}`;
      } else if (error.message.includes('Invalid') || error.message.includes('required')) {
        errorMessage = error.message;
        shouldRetry = false;
        setCurrentStep(1);
      } else if (error.message) {
        errorMessage = error.message;
      }

      const alertButtons = shouldRetry ? [
        { text: 'Retry', onPress: () => handleFinalSignup(finalData) },
        { text: 'Back to Start', onPress: () => setCurrentStep(1), style: 'cancel' }
      ] : [
        { text: 'OK', onPress: () => setCurrentStep(1) }
      ];

      Alert.alert('Signup Failed', errorMessage, alertButtons);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setIsLoading(true);
      const data = await apiCall('/api/health');
      Alert.alert(
        'Server Status', 
        `✅ Server is running!\n\nStatus: ${data.status}\nMessage: ${data.message}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Connection Test Failed', 
        `❌ Cannot connect to server:\n\n${error.message}`,
        [
          { text: 'Retry', onPress: testConnection },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {currentStep === 1 && (
        <SignupScreen
          onSwitchToLogin={onSwitchToLogin}
          onNext={handleStepComplete}
          initialData={signupData}
          isLoading={isLoading}
          onTestConnection={testConnection}
          apiUrl={API_BASE_URL}
        />
      )}

      {currentStep === 2 && (
        <OnboardingScreen
          username={signupData.username || 'there'}
          onNext={(selectedGenres) => 
            handleStepComplete({ genres: selectedGenres })
          }
          onBack={handleBack}
        />
      )}

      {currentStep === 3 && (
        <ProfilePictureScreen
          onComplete={handleFinalSignup}
          onBack={handleBack}
          signupData={signupData}
          isLoading={isLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default MultiStepSignup;