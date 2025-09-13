import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import WelcomeLogo from '../../assets/images/lilguy.png';

const useVietnamFont = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      'Vietnam': require('../../assets/fonts/BeVietnam-Regular.ttf'),
    }).then(() => setLoaded(true));
  }, []);

  return loaded;
};

const FormInput = React.memo(({ placeholder, value, onChangeText, iconName, secureTextEntry = false, onIconPress, showToggle = false, error }) => (
  <View style={styles.inputContainer}>
    <View style={styles.inputWrapper}>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="rgba(105, 93, 93, 0.6)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
      />
      <TouchableOpacity onPress={showToggle ? onIconPress : undefined} activeOpacity={showToggle ? 0.7 : 1}>
        {iconName && <Ionicons name={iconName} size={20} color="rgba(105, 93, 93, 0.6)" />}
      </TouchableOpacity>
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
));

const LoginScreen = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const fontsLoaded = useVietnamFont();

  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  const handleLogin = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = '';
    if (!formData.password) newErrors.password = '';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onLoginSuccess) onLoginSuccess({ username: formData.username });
    }, 1000);
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      behavior={null}

      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
          <Image source={WelcomeLogo} style={styles.image} resizeMode="contain" />
          <Text style={styles.title}>hey, welcome back !</Text>

          <FormInput
            placeholder="Username or Email"
            value={formData.username}
            onChangeText={text => handleInputChange('username', text)}
            iconName="person-outline"
            error={errors.username}
          />

          <FormInput
            placeholder="Password"
            value={formData.password}
            onChangeText={text => handleInputChange('password', text)}
            iconName={showPassword ? 'eye-off-outline' : 'eye-outline'}
            secureTextEntry={!showPassword}
            onIconPress={() => setShowPassword(!showPassword)}
            showToggle
            error={errors.password}
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Login</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={onSwitchToSignup}>
            <Text style={styles.switchButtonText}>don't have an account? sign up !</Text>
          </TouchableOpacity>

          <Text style={styles.privtext}>mindsy 2025 | beta version 1.0.13</Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: -120,

  },
  image: {
    width: 210,
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
    color: '#000000ff',
    fontFamily: 'Vietnam',
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
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'Vietnam',
  },
  loginButton: {
    backgroundColor: '#FFDCDC',
    paddingVertical: 13,
    borderRadius: 18,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 340,
    borderWidth: 2,
    borderColor: '#eec7c7a1',
  },
  loginButtonText: {
    color: '#000000ff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Vietnam',
  },
  switchButton: {
    marginTop: 15,
    marginBottom: 210,
  },
  switchButtonText: {
    color: '#8b8796ff',
    fontSize: 14,
    fontFamily: 'Vietnam',
  },
});

export default LoginScreen;
