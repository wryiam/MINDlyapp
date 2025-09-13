import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Image,
  Dimensions,
  Alert,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const SimpleNewsScreen = ({ onLogout }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://API_URL_DEV_WEB:5000/api/news/feel-good');
      const data = await response.json();
      
      if (data.status === 'success') {
        setArticles(data.articles || []);
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

  const handleLogout = () => {
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

  const renderArticle = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.articleCard} 
      onPress={() => openArticle(item.url)}
      activeOpacity={0.9}
    >

      {item.urlToImage && (
        <Image
          source={{ uri: item.urlToImage }}
          style={styles.articleImage}
          resizeMode="cover"
          onError={(e) => {
            console.log('Image failed to load:', item.urlToImage);
          }}
        />
      )}
      
      <View style={styles.articleContent}>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        
        {item.description && (
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
        )}
        
      
        <View style={styles.articleFooter}>
          <Text style={styles.source}>
            {item.source?.name || 'Unknown Source'}
          </Text>
          
          {item.publishedAt && (
            <Text style={styles.timestamp}>
              {formatDate(item.publishedAt)}
            </Text>
          )}
        </View>
        
      
        {item.author && (
          <Text style={styles.author} numberOfLines={1}>
            By {item.author}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading feel-good news...</Text>
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

  return (
    <View style={styles.container}>
 
      <View style={styles.headerContainer}>
        <Text style={styles.header}>feel good news</Text>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={articles}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        renderItem={renderArticle}
        onRefresh={fetchNews}
        refreshing={loading}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2EB', 
    paddingTop: 50,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF2EB',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Vietnam',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#FFDCDC',
    borderWidth: 2,
    borderColor: '#eec7c7a1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginLeft: 10,
  },
  logoutButtonText: {
    color: '#020202ff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  articleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#eec7c7a1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  articleContent: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    lineHeight: 26,
    fontFamily: 'Vietnam',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  source: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 14,
    color: '#7F55B1',
    fontWeight: '500',
  },
  author: {
    fontSize: 13,
    color: '#7F55B1',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  separator: {
    height: 16,
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

export default SimpleNewsScreen;