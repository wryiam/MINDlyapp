import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const genres = ['health', 'environment', 'wholesome', 'education', 'feel-good', 'charity', 'dogs', 'aid', 'cats'];

const OnboardingScreen = ({ route, navigation, username: usernameProp, onNext }) => {
  const username =
    usernameProp ??
    route?.params?.username ??
    route?.params?.user?.username ??
    route?.params?.name ??
    'there';

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(false); 
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const steps = [
    {
      key: '1',
      backgroundColor: '#FFF2EB',
      content: (
        <>
        <Text style={styles.title}>{`hey, ${username}!`}</Text>
          <Image
            source={require('../../assets/images/lilguy.png')}
            style={styles.image}
            resizeMode="contain"
          />
          
        </>
      ),
    },
    {
      key: '2',
      backgroundColor: '#FFF2EB',
      content: (
        <>
        <Text style={styles.title2}>we got some questions ...</Text>
          <Image
            source={require('../../assets/images/questiony.png')}
            style={styles.image2}
            resizeMode="contain"
          />
          
        </>
      ),
    },
    {
      key: '3',
      backgroundColor: '#FFF2EB',
      content: (
        <>
        <Text style={styles.title3}>what are you into ?</Text>
          <Image
            source={require('../../assets/images/nerd.png')}
            style={styles.image3}
            resizeMode="contain"
          />
          
          <View style={styles.genresContainer}>
            {genres.map((genre) => {
              const selected = selectedGenres.includes(genre);
              return (
                <TouchableOpacity
                  key={genre}
                  style={[styles.genreButton, selected && styles.genreSelected]}
                  onPress={() =>
                    setSelectedGenres((prev) =>
                      prev.includes(genre)
                        ? prev.filter((g) => g !== genre)
                        : [...prev, genre]
                    )
                  }
                >
                  <Text
                    style={[
                      styles.genreText,
                      selected && styles.genreTextSelected,
                    ]}
                  >
                    {genre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      ),
    },
  ];

  const handleDone = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onNext) {
        onNext(selectedGenres);
      } else {
        navigation?.navigate('Home', { selectedGenres });
      }
    }, 2000); 
  };

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>curating your feel-good feed...</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: steps[currentIndex]?.backgroundColor || '#FFF' },
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={steps}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            {item.content}
          </View>
        )}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleScroll}
      />

      {currentIndex === steps.length - 1 && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          activeOpacity={0.9}
        >
          <Text style={styles.doneText}>continue</Text>
        </TouchableOpacity>
      )}

      <View style={styles.dotsContainer}>
        {steps.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <View
              key={index}
              style={[styles.dot, isActive && styles.dotActive]}
            />
          );
        })}
      </View>

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  image: { width: SCREEN_WIDTH * 0.7, height: 180, marginBottom: 195 },
  image2: { width: SCREEN_WIDTH * 0.7, height: 200, marginBottom: 190 },
  image3: { width: SCREEN_WIDTH * 0.7, height: 180, marginBottom: 10, marginTop: 10, },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 50,
    color: '#000',
    fontFamily: 'Vietnam',
    textAlign: 'center',
  },
  title2: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 40,
    color: '#000',
    fontFamily: 'Vietnam',
    textAlign: 'center',
  },
  title3: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 50,
    color: '#000',
    fontFamily: 'Vietnam',
    textAlign: 'center',
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: -40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#AC9292',
    marginHorizontal: 5,
    marginBottom: 100,
  },
  dotActive: { backgroundColor: '#000000' },

  doneButton: {
    backgroundColor: '#FFDCDC',
    borderWidth: 2,
    borderColor: '#eec7c7a1',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 32,
    marginBottom: 60,
  },
  doneText: { color: '#020202ff', fontSize: 18, fontWeight: '600' },

  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 45,
    justifyContent: 'center',
  },
  genreButton: {
    
    borderWidth: 1,
    borderColor: '#000000ff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    margin: 6,
  },
  genreSelected: { backgroundColor: '#FFDCDC' },
  genreText: { color: '#000000ff', fontWeight: '500' },
  genreTextSelected: { color: '#000000ff' },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF2EB',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '600',
    color: '#8b5cf6',
    textAlign: 'center',
  },
});

export default OnboardingScreen;
