import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { BlurView } from 'expo-blur';
import sulogo from '../../assets/images/signuplil.png';

const { width } = Dimensions.get('window');

// Custom FormInput component
const FormInput = React.memo(({ 
  placeholder, 
  value, 
  onChangeText, 
  iconName, 
  secureTextEntry = false, 
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  onIconPress,
  showToggle = false,
  error
}) => (
  <View style={styles.inputContainer}>
    <View style={styles.inputWrapper}>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="rgba(105, 93, 93, 0.6)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        textContentType="none"
        autoComplete="off"
      />
      {iconName && (
        <TouchableOpacity 
          onPress={showToggle ? onIconPress : undefined}
          activeOpacity={showToggle ? 0.7 : 1}
          style={styles.inputIcon}
        >
          <Ionicons name={iconName} size={20} color="rgba(105, 93, 93, 0.6)" />
        </TouchableOpacity>
      )}
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
));

const SignupScreen = ({ onSwitchToLogin, onNext }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load fonts
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Hooey': require('../../assets/fonts/HooeyDEMO-Regular.otf'),
        'Vietnam': require('../../assets/fonts/BeVietnam-Regular.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username || formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onNext(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView
        behavior={null}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
            <Image source={sulogo} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>welcome to mindly!</Text>

            <View style={styles.inputSection}>
              <FormInput
                placeholder="Username"
                value={formData.username}
                onChangeText={text => handleInputChange('username', text)}
                iconName="person-outline"
                autoCapitalize="none"
                error={errors.username}
              />
              <FormInput
                placeholder="Email"
                value={formData.email}
                onChangeText={text => handleInputChange('email', text)}
                iconName="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
              <FormInput
                placeholder="Password"
                value={formData.password}
                onChangeText={text => handleInputChange('password', text)}
                iconName={showPassword ? "eye-off-outline" : "eye-outline"}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onIconPress={() => setShowPassword(prev => !prev)}
                showToggle
                error={errors.password}
              />
            </View>

            <TouchableOpacity
              style={[styles.continueButton, loading && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>CONTINUE</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={onSwitchToLogin}>
              <Text style={styles.loginLinkText}>Already have an account? Log in</Text>
            </TouchableOpacity>
            <Text style={styles.privtext}>mindsy 2025 | beta version 1.0.13</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2EB',
  },
  privtext: {
    fontFamily: 'Vietnam',
    color: '#0000004b',
    fontSize: 12,
    fontWeight: '100',
    marginBottom: -100,

  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  image: {
    width: 210,
    height: 140,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
    color: '#000000ff',
    fontFamily: 'Vietnam',
    textAlign: 'center',
  },
  inputSection: {
    width: '100%',
    marginBottom: 0,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdcdc2c',
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#eec7c7a1',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000000ff',
    fontFamily: 'Vietnam',
    
  },
  inputIcon: {
    marginLeft: 10,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
    fontFamily: 'Vietnam',
  },
  continueButton: {
    backgroundColor: '#FFDCDC',
    paddingVertical: 13,
    borderRadius: 18,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 340,
    borderWidth: 2,
    borderColor: '#eec7c7a1',
    flexDirection: 'row',
  },
  continueButtonText: {
    color: '#000000ff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Vietnam',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 140,
  },
  loginLinkText: {
    color: '#8b8796ff',
    fontFamily: 'Vietnam',
  },
});

export default SignupScreen;
