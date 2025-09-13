import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import mindsy from '../../assets/images/MiNDsy.png';

const { width: screenWidth } = Dimensions.get('window');

const SavedArticlesScreen = ({ user, onGoBack }) => {
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedArticles();
  }, []);

  const fetchSavedArticles = async (showRefreshIndicator = false) => {
    if (!user) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(`http://192.168.1.115:5000/api/users/${user.username}/saved-articles`);
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setSavedArticles(data.saved_articles || []);
      } else {
        setError(data.error || 'Failed to fetch saved articles');
      }
    } catch (err) {
      console.error('Error fetching saved articles:', err);
      setError('Unable to connect to the server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchSavedArticles(true);
  };

  const openArticle = async (url) => {
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (error) {
        Alert.alert('Error', 'Could not open article');
      }
    }
  };

  const removeFromSaved = async (article) => {
    Alert.alert(
      'Remove Article',
      'Are you sure you want to remove this article from your saved list?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://192.168.1.115:5000/api/users/${user.username}/saved-articles/${article.id}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                setSavedArticles(prev => prev.filter(item => item.id !== article.id));
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.error || 'Failed to remove article');
              }
            } catch (error) {
              console.error('Error removing article:', error);
              Alert.alert('Error', 'Failed to remove article');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  const formatSavedDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Saved today';
      if (diffInDays === 1) return 'Saved yesterday';
      if (diffInDays < 7) return `Saved ${diffInDays} days ago`;
      
      return `Saved on ${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })}`;
    } catch (error) {
      return 'Recently saved';
    }
  };

  const renderArticleItem = ({ item }) => (
    <View style={styles.articleContainer}>
      <TouchableOpacity 
        style={styles.articleCard}
        onPress={() => openArticle(item.url)}
        activeOpacity={0.8}
      >
        {/* Article Image */}
        {item.urlToImage ? (
          <Image
            source={{ uri: item.urlToImage }}
            style={styles.articleImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📰</Text>
          </View>
        )}

        {/* Article Content */}
        <View style={styles.articleInfo}>
          <Text 
            style={styles.articleTitle} 
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
          
          {item.description && (
            <Text 
              style={styles.articleDescription}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.description}
            </Text>
          )}
          
          <View style={styles.articleMeta}>
            <Text style={styles.sourceText}>
              {item.source?.name || 'Unknown Source'}
            </Text>
            <Text style={styles.dateText}>
              {formatDate(item.publishedAt)}
            </Text>
          </View>
          
          <Text style={styles.savedDateText}>
            {formatSavedDate(item.savedAt)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Remove Button */}
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeFromSaved(item)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyTitle}>No Saved Articles</Text>
      <Text style={styles.emptyMessage}>
        Articles you save will appear here. Tap the heart icon on any article to save it for later reading.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF2EB" />
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Image source={mindsy} style={styles.headerImage} resizeMode="contain" />
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading saved articles...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF2EB" />
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Image source={mindsy} style={styles.headerImage} resizeMode="contain" />
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchSavedArticles()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF2EB" />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Image source={mindsy} style={styles.headerImage} resizeMode="contain" />
        <View style={styles.headerSpacer} />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Saved Articles</Text>
        {savedArticles.length > 0 && (
          <Text style={styles.articleCount}>
            {savedArticles.length} article{savedArticles.length !== 1 ? 's' : ''} saved
          </Text>
        )}
      </View>

      {/* Articles List */}
      <FlatList
        data={savedArticles}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          savedArticles.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8b5cf6']}
            tintColor="#8b5cf6"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2EB',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFF2EB',
  },
  backButton: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#A7D4A7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 80,
  },
  backButtonText: {
    color: '#2D5F2D',
    fontSize: 14,
    fontWeight: '600',
  },
  headerImage: {
    width: 180,
    height: 50,
  },
  headerSpacer: {
    minWidth: 80,
  },
  titleContainer: {
    paddingHorizontal: 30,
    paddingBottom: 20,
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Vietnam',
    marginBottom: 5,
  },
  articleCount: {
    fontSize: 16,
    color: '#937878',
    fontWeight: '400',
    fontFamily: 'Vietnam',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  articleContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  articleCard: {
    backgroundColor: '#F3D9C9',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#eec7c7a1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    flexDirection: 'row',
    minHeight: 140,
  },
  articleImage: {
    width: 120,
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    width: 120,
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    opacity: 0.5,
  },
  articleInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    lineHeight: 22,
    fontFamily: 'VietMed',
    marginBottom: 8,
  },
  articleDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    fontFamily: 'Vietnam',
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  sourceText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    fontFamily: 'Vietnam',
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#777',
    fontFamily: 'Vietnam',
  },
  savedDateText: {
    fontSize: 11,
    color: '#8b5cf6',
    fontWeight: '500',
    fontFamily: 'Vietnam',
    fontStyle: 'italic',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFB8B8',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  removeButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Vietnam',
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Vietnam',
    textAlign: 'center',
    lineHeight: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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

export default SavedArticlesScreen;