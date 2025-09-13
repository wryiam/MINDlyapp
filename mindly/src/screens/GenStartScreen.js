import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Animated,
} from 'react-native';
import * as Font from 'expo-font';
import Logo from '../../assets/images/mindlylogo.png';

const LoginScreen = ({ onSwitchToLogin, onSwitchToSignup }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current; // start slightly below

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Hooey': require('../../assets/fonts/HooeyDEMO-Regular.otf'),
          'Vietnam': require('../../assets/fonts/BeVietnam-Regular.ttf'),
          'VietMed' : require('../../assets/fonts/BeVietnam-Medium.ttf'),
          'VietItal' : require('../../assets/fonts/BeVietnam-LightItalic.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Font loading error:', error);
        setFontsLoaded(true);
      }
    };
    loadFonts();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      // Start animation once fonts are loaded
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Image source={Logo} style={styles.image} resizeMode="contain" />
      </Animated.View>

      {/* Buttons */}
      <Animated.View
        style={[
          styles.buttonsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity style={styles.signInButton} onPress={onSwitchToLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpButton} onPress={onSwitchToSignup}>
          <Text style={styles.buttonText}>Sign Up with Google</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Privacy Text */}
      <Text style={styles.privacyText}>Mindsy 2025 | Beta Version 1.0.13</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 40,
    paddingTop: 120,
    alignItems: 'center',
  },
  logoContainer: {
    flex: 0,
    marginBottom: 200,
    alignItems: 'center',
    marginLeft: 25,
  },
  buttonsContainer: {
    flex: 0,
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: 360,
    height: 220,
    borderRadius: 10,
  },
  signInButton: {
    backgroundColor: '#FFDCDC',
    paddingVertical: 13,
    borderRadius: 18,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 330,
    borderWidth: 2,
    borderColor: '#eec7c7a1',
  },
  signUpButton: {
    backgroundColor: '#FFDCDC',
    paddingVertical: 13,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: 330,
    borderWidth: 2,
    borderColor: '#eec7c7a1',
  },
  buttonText: {
    color: '#333',
    fontSize: 18,
    fontFamily: 'Vietnam',
    fontWeight: '600',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: '#888',
    fontFamily: 'Vietnam',
  },
});

export default LoginScreen;
