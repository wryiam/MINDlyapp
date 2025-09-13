import React, { useState, useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import mindsy from '../../assets/images/MiNDsy.png';
import BMactive from '../../assets/images/bookmarkactive.png';
import BM from '../../assets/images/bookmark.png';
import BMs from '../../assets/images/saved-items.png';
import leave from '../../assets/images/leave.png'
import settings from '../../assets/images/settings.png'

import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Image,
  Dimensions,
  Alert,
  Animated,
  StatusBar,
  Modal,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SwipeableNewsScreen = ({ onLogout, user, navigateToSaved }) => {
  console.log('User object in SwipeableNewsScreen:', user);
  console.log('User ID:', user?.id);
  console.log('User keys:', user ? Object.keys(user) : 'User is null/undefined');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLocalNews, setIsLocalNews] = useState(true);
  const [savedArticles, setSavedArticles] = useState(new Set()); // Track saved articles
  const [isSaving, setIsSaving] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  const translateX = useRef(new Animated.Value(0)).current;
  const panRef = useRef(null);

  useEffect(() => {
    fetchNews();
  }, [isLocalNews]);

  useEffect(() => {
    if (user && articles.length > 0) {
      checkSavedStatus();
    }
  }, [articles, user]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = isLocalNews ? 'feel-good' : 'world-news';
      const response = await fetch(`http://192.168.1.115:5000/api/news/${endpoint}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setArticles(data.articles || []);
        setCurrentIndex(0);
      } else {
        setError(data.error || 'Failed to fetch news');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Unable to connect to news service');
    } finally {
      setLoading(false);
    }
  };

  const checkSavedStatus = async () => {
    if (!user || !user.username) {
      console.log('User or username is missing:', user);
      return;
    }

    try {
      const savedSet = new Set();
      
      // Check each article's saved status
      for (const article of articles) {
        const response = await fetch(`http://192.168.1.115:5000/api/users/${user.username}/saved-articles/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: article.url })
        });
        
        const data = await response.json();
        if (data.is_saved) {
          savedSet.add(article.url);
        }
      }
      
      setSavedArticles(savedSet);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveArticle = async () => {
    if (!user || !user.username) {
      Alert.alert('Login Required', 'Please log in to save articles');
      return;
    }

    const currentArticle = articles[currentIndex];
    if (!currentArticle) return;

    setIsSaving(true);

    try {
      const isSaved = savedArticles.has(currentArticle.url);
      
      if (isSaved) {
        // Unsave the article - we need to find the saved article ID first
        const checkResponse = await fetch(`http://192.168.1.115:5000/api/users/${user.username}/saved-articles/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: currentArticle.url })
        });
        
        const checkData = await checkResponse.json();
        
        if (checkData.is_saved && checkData.saved_article_id) {
          const response = await fetch(`http://192.168.1.115:5000/api/users/${user.username}/saved-articles/${checkData.saved_article_id}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            setSavedArticles(prev => {
              const newSet = new Set(prev);
              newSet.delete(currentArticle.url);
              return newSet;
            });
          } else {
            throw new Error('Failed to remove article');
          }
        }
      } else {
        // Save the article
        const response = await fetch(`http://192.168.1.115:5000/api/users/${user.username}/saved-articles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: currentArticle.title,
            description: currentArticle.description,
            url: currentArticle.url,
            urlToImage: currentArticle.urlToImage,
            source: currentArticle.source,
            publishedAt: currentArticle.publishedAt
          })
        });

        if (response.ok) {
          setSavedArticles(prev => new Set([...prev, currentArticle.url]));
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save article');
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving article:', error);
      Alert.alert('Error', error.message || 'Failed to save article');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = () => {
    setIsLocalNews(!isLocalNews);
  };

  const handleLogout = () => {
    setDropdownVisible(false);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            if (onLogout) {
              onLogout();
            }
          },
        },
      ]
    );
  };

  const handleSavedPress = () => {
    setDropdownVisible(false);
    console.log("Saved button pressed!");
    if (navigateToSaved) {
      navigateToSaved();
    } else {
      console.warn("NavigateToSaved is not defined!");
    }
  };

  const handleSettingsPress = () => {
    setDropdownVisible(false);
    // Add your settings navigation logic here
    console.log("Settings pressed!");
  };

  const openArticle = async (url) => {
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.log('Could not open URL');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 48) return 'Yesterday';
      
      return date.toLocaleDateString();
    } catch (error) {
      return '';
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, velocityX } = event.nativeEvent;
      
      let shouldSwipe = false;
      let direction = 0;
      
      if (Math.abs(translationX) > screenWidth * 0.3 || Math.abs(velocityX) > 500) {
        shouldSwipe = true;
        direction = translationX > 0 ? 1 : -1;
      }
      
      if (shouldSwipe) {
        if (direction === -1 && currentIndex < articles.length - 1) {
          setCurrentIndex(currentIndex + 1);
          Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
          });
        } else if (direction === 1 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
          Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const goToNext = () => {
    if (currentIndex < articles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>
          Loading {isLocalNews ? 'local feel-good' : 'world'} news...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (articles.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No articles available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentArticle = articles[currentIndex];
  const isCurrentSaved = savedArticles.has(currentArticle?.url);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF2EB" />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.topRow}>
            <View style={styles.spacer} />
            
            <Image source={mindsy} style={styles.image} resizeMode="contain" />
            
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={() => setDropdownVisible(true)}
            >
              <Text style={styles.menuDots}>…</Text>
            </TouchableOpacity>
          </View>
          
          {/* Toggle Switch */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => !isLocalNews && handleToggle()}
            >
              <Text
                style={[
                  styles.toggleText,
                  isLocalNews && styles.toggleTextActive,
                ]}
              >
                local
              </Text>
              {isLocalNews && <View style={styles.underline} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => isLocalNews && handleToggle()}
            >
              <Text
                style={[
                  styles.toggleText,
                  !isLocalNews && styles.toggleTextActive,
                ]}
              >
                world
              </Text>
              {!isLocalNews && <View style={styles.underline} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Dropdown Menu */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <TouchableOpacity style={styles.dropdownItem} onPress={handleSavedPress}>
              <Image source={BMs} style={styles.dropdownIcon} resizeMode="contain" />
              <Text style={styles.dropdownText}>Saved Articles</Text>
            </TouchableOpacity>
            
            <View style={styles.dropdownDivider} />
            
            <TouchableOpacity style={styles.dropdownItem} onPress={handleSettingsPress}>
              <Image source={settings} style={styles.dropdownIcon} resizeMode="contain" />
              <Text style={styles.dropdownText}>Settings</Text>
            </TouchableOpacity>
            
            <View style={styles.dropdownDivider} />
            
            <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
              <Image source={leave} style={styles.dropdownIcon} resizeMode="contain" />
              <Text style={[styles.dropdownText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Article Card */}
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-20, 20]}
      >
        <Animated.View 
          style={[
            styles.cardContainer,
            {
              transform: [{ translateX }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.articleCard}
            onPress={() => openArticle(currentArticle.url)}
            activeOpacity={0.95}
          >
            {/* Article Image */}
            {currentArticle.urlToImage && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: currentArticle.urlToImage }}
                  style={styles.articleImage}
                  resizeMode="cover"
                />
              </View>
            )}
            
            <View style={styles.articleContent}>
              {/* Article Title */}
              <Text 
                style={styles.title} 
                numberOfLines={2} 
                ellipsizeMode="tail"
              >
                {currentArticle.title}
              </Text>
              <View style={styles.divider} />
              
              {/* Article Description */}
              {currentArticle.description && (
                <Text 
                  style={styles.description} 
                  numberOfLines={3} 
                  ellipsizeMode="tail"
                >
                  {currentArticle.description}
                </Text>
              )}
              
              {/* Article Footer */}
              <View style={styles.articleFooter}>
                <Text 
                  style={styles.source} 
                  numberOfLines={1} 
                  ellipsizeMode="tail"
                >
                  {currentArticle.source?.name || 'Unknown Source'}
                </Text>
                {currentArticle.publishedAt && (
                  <Text style={styles.timestamp}>
                    {formatDate(currentArticle.publishedAt)}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navIconButton, currentIndex === 0 && styles.navIconButtonDisabled]}
          onPress={goToPrevious}
          disabled={currentIndex === 0}
        >
          <Text style={[styles.navIcon, currentIndex === 0 && styles.navIconDisabled]}>
            ←
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.saveIconButton,
            isCurrentSaved && styles.saveIconButtonSaved,
            isSaving && styles.saveIconButtonDisabled,
          ]}
          onPress={handleSaveArticle}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#020202ff" />
          ) : (
            <Image
              source={isCurrentSaved ? BMactive : BM}
              style={{ width: 50, height: 50 }}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navIconButton, currentIndex === articles.length - 1 && styles.navIconButtonDisabled]}
          onPress={goToNext}
          disabled={currentIndex === articles.length - 1}
        >
          <Text style={[styles.navIcon, currentIndex === articles.length - 1 && styles.navIconDisabled]}>
            →
          </Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2EB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF2EB',
  },
  headerContainer: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF2EB',
  },
  headerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  spacer: {
    width: 50, // Same width as menu button to center the logo
  },
  image: {
    width: 180,
    height: 50,
    marginTop: 30,
  },
  menuButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  menuDots: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#020202a4',
    lineHeight: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 180,
    paddingVertical: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#020202ff',
    fontWeight: '500',
    fontFamily: 'Vietnam',
  },
  logoutText: {
    color: '#D32F2F',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
    marginVertical: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  toggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#937878',
    paddingBottom: 6,
    fontFamily: 'Vietnam',
  },
  toggleTextActive: {
    color: '#000',
  },
  underline: {
    height: 3,
    backgroundColor: '#EEC7C7',
    width: '100%',
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 30,
    marginVertical: 0,
    maxHeight: screenHeight * 0.56,
    minHeight: screenHeight * 0.3,
  },
  articleCard: {
    flex: 1,
    backgroundColor: '#F3D9C9',
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#eec7c7a1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: screenHeight * 0.25,
    alignItems: 'center',
    paddingTop: 10,
  },
  articleImage: {
    width: '95%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
  },
  articleContent: {
    flex: 1,
    padding: 20,
    height: screenHeight * 0.45,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000ff',
    lineHeight: 32,
    fontFamily: 'VietMed',
    textAlignVertical: 'top',
  },
  description: {
    fontSize: 17,
    color: '#333',
    marginBottom: 10,
    lineHeight: 25,
    fontWeight: '400',
    fontFamily: 'Vietnam',
    marginBottom: 30,
    textAlignVertical: 'top',
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    height: 40,
  },
  source: {
    fontSize: 15,
    color: '#000000ff',
    fontWeight: '200',
    flex: 1,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
    fontFamily: 'Vietnam',
  },
  timestamp: {
    fontSize: 14,
    color: '#000000ff',
    fontWeight: '100',
    fontFamily: 'Vietnam',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 70,
    paddingVertical: 20,
    paddingBottom: 30,
    marginTop: 15,
  },
  navIconButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navIconButtonDisabled: {
    // Styles for disabled state
  },
  navIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#020202ff',
  },
  navIconDisabled: {
    color: '#999',
  },
  saveIconButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  saveIconButtonSaved: {
   
  },
  saveIconButtonDisabled: {
    opacity: 0.7,
  },
  saveIcon: {
    fontSize: 28,
    color: '#020202ff',
    fontWeight: 'normal',
  },
  saveIconSaved: {
    color: '#D32F2F',
  },
  divider: {
    height: 1,
    backgroundColor: '#937878',
    alignSelf: 'stretch',
    marginVertical: 8,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
    fontFamily: 'Vietnam',
  },
  errorText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: '600',
    fontFamily: 'Vietnam',
  },
  retryButton: {
    backgroundColor: '#FFDCDC',
    borderWidth: 2,
    borderColor: '#eec7c7a1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#020202ff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SwipeableNewsScreen;