import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WORLDWIDE_CITIES = [
  // North America
  { name: 'New York, USA', country: 'USA', region: 'North America' },
  { name: 'Los Angeles, USA', country: 'USA', region: 'North America' },
  { name: 'Chicago, USA', country: 'USA', region: 'North America' },
  { name: 'Toronto, Canada', country: 'Canada', region: 'North America' },
  { name: 'Mexico City, Mexico', country: 'Mexico', region: 'North America' },
  
  // Europe
  { name: 'London, UK', country: 'UK', region: 'Europe' },
  { name: 'Paris, France', country: 'France', region: 'Europe' },
  { name: 'Berlin, Germany', country: 'Germany', region: 'Europe' },
  { name: 'Madrid, Spain', country: 'Spain', region: 'Europe' },
  { name: 'Rome, Italy', country: 'Italy', region: 'Europe' },
  { name: 'Amsterdam, Netherlands', country: 'Netherlands', region: 'Europe' },
  { name: 'Stockholm, Sweden', country: 'Sweden', region: 'Europe' },
  { name: 'Vienna, Austria', country: 'Austria', region: 'Europe' },
  
  // Asia
  { name: 'Tokyo, Japan', country: 'Japan', region: 'Asia' },
  { name: 'Seoul, South Korea', country: 'South Korea', region: 'Asia' },
  { name: 'Singapore', country: 'Singapore', region: 'Asia' },
  { name: 'Hong Kong', country: 'Hong Kong', region: 'Asia' },
  { name: 'Shanghai, China', country: 'China', region: 'Asia' },
  { name: 'Mumbai, India', country: 'India', region: 'Asia' },
  { name: 'Bangkok, Thailand', country: 'Thailand', region: 'Asia' },
  { name: 'Manila, Philippines', country: 'Philippines', region: 'Asia' },
  
  // Australia & Oceania
  { name: 'Sydney, Australia', country: 'Australia', region: 'Oceania' },
  { name: 'Melbourne, Australia', country: 'Australia', region: 'Oceania' },
  { name: 'Auckland, New Zealand', country: 'New Zealand', region: 'Oceania' },
  
  // South America
  { name: 'São Paulo, Brazil', country: 'Brazil', region: 'South America' },
  { name: 'Buenos Aires, Argentina', country: 'Argentina', region: 'South America' },
  { name: 'Lima, Peru', country: 'Peru', region: 'South America' },
  { name: 'Santiago, Chile', country: 'Chile', region: 'South America' },
  
  // Africa
  { name: 'Cairo, Egypt', country: 'Egypt', region: 'Africa' },
  { name: 'Lagos, Nigeria', country: 'Nigeria', region: 'Africa' },
  { name: 'Cape Town, South Africa', country: 'South Africa', region: 'Africa' },
  { name: 'Nairobi, Kenya', country: 'Kenya', region: 'Africa' },
  
  // Middle East
  { name: 'Dubai, UAE', country: 'UAE', region: 'Middle East' },
  { name: 'Tel Aviv, Israel', country: 'Israel', region: 'Middle East' },
  { name: 'Istanbul, Turkey', country: 'Turkey', region: 'Middle East' },
];

const LocationScreen = ({ navigation, route, onComplete, onBack }) => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = WORLDWIDE_CITIES.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleComplete = () => {
    if (!selectedCity) {
      Alert.alert('Location Required', 'Please select your city to continue.');
      return;
    }

    if (onComplete) {
      onComplete({ location: selectedCity.name, locationData: selectedCity });
    } else if (navigation?.navigate) {
      navigation.navigate('Home', { location: selectedCity.name, locationData: selectedCity });
    }
  };

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('Onboarding');
    }
  };

  const renderCityItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleCitySelect(item)}
    >
      <View style={styles.cityItemContent}>
        <Text style={styles.cityName}>{item.name}</Text>
        <Text style={styles.cityRegion}>{item.region}</Text>
      </View>
      <Ionicons name="location" size={16} color="#666" />
    </TouchableOpacity>
  );

  const groupedCities = WORLDWIDE_CITIES.reduce((acc, city) => {
    if (!acc[city.region]) {
      acc[city.region] = [];
    }
    acc[city.region].push(city);
    return acc;
  }, {});

  const popularCities = [
    WORLDWIDE_CITIES.find(c => c.name.includes('New York')),
    WORLDWIDE_CITIES.find(c => c.name.includes('London')),
    WORLDWIDE_CITIES.find(c => c.name.includes('Tokyo')),
    WORLDWIDE_CITIES.find(c => c.name.includes('Sydney')),
    WORLDWIDE_CITIES.find(c => c.name.includes('Paris')),
    WORLDWIDE_CITIES.find(c => c.name.includes('Dubai')),
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>where are you?</Text>
        <Text style={styles.subtitle}>select your city for local community news</Text>

        <View style={styles.locationCircle}>
          <Ionicons name="earth-outline" size={60} color="#666" />
        </View>

        <TouchableOpacity
          style={styles.selectorContainer}
          onPress={() => setShowDropdown(true)}
        >
          <Ionicons name="location-outline" size={20} color="#999" style={styles.selectorIcon} />
          <Text style={[
            styles.selectorText,
            !selectedCity && styles.placeholderText
          ]}>
            {selectedCity ? selectedCity.name : 'Select your city'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#999" />
        </TouchableOpacity>


        {selectedCity && (
          <View style={styles.selectedCityContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <View style={styles.selectedCityInfo}>
              <Text style={styles.selectedCityName}>{selectedCity.name}</Text>
              <Text style={styles.selectedCityRegion}>{selectedCity.region}</Text>
            </View>
          </View>
        )}
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#666" />
          <Text style={styles.privacyText}>
            we use your location to show relevant local community stories and news
          </Text>
        </View>
      </ScrollView>


      <Modal
        visible={showDropdown}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDropdown(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Your City</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cities..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <FlatList
            data={filteredCities}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            renderItem={renderCityItem}
            showsVerticalScrollIndicator={false}
            style={styles.citiesList}
          />
        </View>
      </Modal>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => onComplete?.({ location: null })}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedCity && styles.nextButtonDisabled
          ]}
          onPress={handleComplete}
          disabled={!selectedCity}
        >
          <Text style={[
            styles.nextText,
            !selectedCity && styles.nextTextDisabled
          ]}>
            Create
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF2EB' 
  },
  scrollContainer: { 
    alignItems: 'center', 
    padding: 20,
    paddingBottom: 40
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 40,
    marginBottom: 10,
    fontFamily: 'Vietnam',
    color: '#000',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#333',
    fontFamily: 'Vietnam',
    textAlign: 'center',
  },
  locationCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#eec7c7a1',
    backgroundColor: '#FFDCDC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eec7c7a1',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 25,
    width: '100%',
    maxWidth: 320,
  },
  selectorIcon: {
    marginRight: 10,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontFamily: 'Vietnam',
  },
  placeholderText: {
    color: '#999',
  },
  sectionText: {
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'Vietnam',
    color: '#333',
    alignSelf: 'flex-start',
  },
  popularContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  popularChip: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eec7c7a1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
  },
  popularText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Vietnam',
  },
  selectedCityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  selectedCityInfo: {
    marginLeft: 12,
  },
  selectedCityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D2E',
    fontFamily: 'Vietnam',
  },
  selectedCityRegion: {
    fontSize: 12,
    color: '#2E7D2E',
    fontFamily: 'Vietnam',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eec7c7a1',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
    maxWidth: 320,
  },
  privacyText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Vietnam',
    marginLeft: 8,
    flex: 1,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF2EB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eec7c7a1',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Vietnam',
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eec7c7a1',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontFamily: 'Vietnam',
  },
  citiesList: {
    flex: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  cityItemContent: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    fontFamily: 'Vietnam',
  },
  cityRegion: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Vietnam',
  },
  buttonsRow: {
    flexDirection: 'row',
    marginHorizontal: 32,
    marginBottom: 106,
    columnGap: 10,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eec7c7a1',
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#FFE7E7',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eec7c7a1',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#FFDCDC',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eec7c7a1',
  },
  nextButtonDisabled: {
    backgroundColor: '#F0F0F0',
    opacity: 0.6,
  },
  backText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333' 
  },
  skipText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333' 
  },
  nextText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#000' 
  },
  nextTextDisabled: {
    color: '#999',
  },
});

export default LocationScreen;