from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
import re
import os
import json
import secrets
import requests
import logging

app = Flask(__name__)

# more permissive cors config for development - TEMPORARY
CORS(app, 
     origins=["*"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     supports_credentials=False)

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'false')
    return response

basedir = os.path.abspath(os.path.dirname(__file__))
db_dir = os.path.join(basedir, 'database')
os.makedirs(db_dir, exist_ok=True)
db_path = os.path.join(db_dir, 'users.db')

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


# News API Configuration
NEWS_API_KEY = os.environ["NEWS_API_KEY"]
NEWS_CACHE = {}
NEWS_CACHE_DURATION = timedelta(hours=2)

print(f"📁 Database will be created at: {db_path}")

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    genres = db.Column(db.Text, nullable=True)  # Store as JSON string
    profile_picture = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    news_preferences = db.Column(db.Text, nullable=True)  # Store preferred news categories
    
    def set_genres(self, genres_list):
        """Set genres as JSON string"""
        self.genres = json.dumps(genres_list) if genres_list else None
    
    def get_genres(self):
        """Get genres as list"""
        if self.genres:
            try:
                return json.loads(self.genres)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_news_preferences(self, preferences_list):
        """Set news preferences as JSON string"""
        self.news_preferences = json.dumps(preferences_list) if preferences_list else None
    
    def get_news_preferences(self):
        """Get news preferences as list"""
        if self.news_preferences:
            try:
                return json.loads(self.news_preferences)
            except json.JSONDecodeError:
                return ['community', 'kindness', 'charity']
        return ['community', 'kindness', 'charity']
    
 

class SavedArticle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    article_title = db.Column(db.String(500), nullable=False)
    article_description = db.Column(db.Text, nullable=True)
    article_url = db.Column(db.String(1000), nullable=False)
    article_image_url = db.Column(db.String(1000), nullable=True)
    article_source = db.Column(db.String(200), nullable=True)
    article_published_at = db.Column(db.String(100), nullable=True)
    saved_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    
   
    user = db.relationship('User', backref=db.backref('saved_articles', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.article_title,
            'description': self.article_description,
            'url': self.article_url,
            'urlToImage': self.article_image_url,
            'source': {'name': self.article_source} if self.article_source else None,
            'publishedAt': self.article_published_at,
            'savedAt': self.saved_at.isoformat(),
            'userId': self.user_id
        }


# Community-focused news filtering configuration
COMMUNITY_POSITIVE_KEYWORDS = [
    # Community & Social Impact
    'community', 'neighborhood', 'local', 'volunteer', 'volunteers', 'volunteering',
    'charity', 'donation', 'donate', 'fundraiser', 'fundraising', 'nonprofit',
    'food bank', 'food drive', 'homeless shelter', 'helping hand', 'mutual aid',
    
    # Acts of Kindness & Human Connection
    'kindness', 'compassion', 'generosity', 'helping', 'support', 'caring',
    'good samaritan', 'stranger helps', 'random act', 'pay it forward',
    'neighbors helping', 'community comes together', 'unity', 'solidarity',
    
    # Positive Social Change & Civic Engagement
    'grassroots', 'activism', 'social change', 'community garden', 'clean up',
    'beautification', 'revitalization', 'restoration', 'conservation',
    'environmental stewardship', 'sustainability initiative',
    
    # Education & Youth Development
    'mentorship', 'tutoring', 'scholarship', 'education program', 'youth program',
    'after school', 'literacy', 'library', 'teacher appreciation',
    'school fundraiser', 'student achievement',
    
    # Health & Wellness Community Support
    'health clinic', 'medical mission', 'therapy dog', 'mental health support',
    'wellness program', 'support group', 'recovery', 'healing',
    
    # Senior & Vulnerable Population Support
    'senior center', 'elderly care', 'nursing home visit', 'meals on wheels',
    'disability support', 'accessibility', 'inclusion', 'barrier-free',
    
    # Cultural & Arts Community Building
    'community center', 'cultural celebration', 'art therapy', 'music therapy',
    'community choir', 'local artist', 'mural project', 'public art',
    
    # Emergency Response & Mutual Aid
    'disaster relief', 'emergency response', 'first responders honored',
    'community resilience', 'rebuild', 'recovery effort', 'crisis support'
]

# Exclude sports, entertainment, celebrity, and business-focused content
EXCLUDE_KEYWORDS = [
    # Sports & Competition
    'team wins', 'championship', 'playoffs', 'tournament', 'league', 'sports',
    'football', 'basketball', 'baseball', 'soccer', 'tennis', 'golf',
    'olympic', 'athlete', 'coach', 'stadium', 'game', 'match', 'score',
    
    # Entertainment & Celebrity
    'celebrity', 'actor', 'actress', 'movie', 'film', 'tv show', 'television',
    'concert', 'album', 'singer', 'musician', 'band', 'hollywood', 'premiere',
    'red carpet', 'award show', 'grammy', 'oscar', 'emmy',
    
    # Business & Corporate
    'stock market', 'wall street', 'corporate', 'ceo', 'profit', 'earnings',
    'ipo', 'merger', 'acquisition', 'investment', 'cryptocurrency', 'bitcoin',
    
    # Politics (to avoid divisive content)
    'election', 'political', 'congress', 'senate', 'democrat', 'republican',
    'president', 'governor', 'mayor', 'campaign', 'vote', 'ballot',
    
    # Negative content
    'war', 'death', 'murder', 'terrorism', 'shooting', 'crash', 'disaster',
    'pandemic', 'crisis', 'protest', 'conflict', 'attack', 'violence',
    'crime', 'fraud', 'scandal', 'corruption', 'abuse', 'assault',
    'kidnapping', 'suicide', 'fire', 'flood', 'earthquake', 'hurricane',
    'explosion', 'accident', 'injury', 'lawsuit', 'court case'
]

def community_sentiment_analysis(text):
    """Community-focused sentiment analysis based on keyword counting"""
    text = text.lower()
    
    # Count community-positive words
    community_positive_count = sum(1 for word in COMMUNITY_POSITIVE_KEYWORDS if word in text)
    
    # Check for excluded content
    exclude_count = sum(1 for word in EXCLUDE_KEYWORDS if word in text)
    
    # If excluded content is found, heavily penalize
    if exclude_count > 0:
        return -1.0
    
    # Score based on community keywords (higher weight for community focus)
    if community_positive_count > 0:
        return min(community_positive_count * 0.3, 1.0)  # Higher weight than before
    
    return 0.0

def filter_community_news(articles):
    """Filter articles to keep only community-focused feel-good stories"""
    filtered_articles = []
    
    for article in articles:
        title = article.get('title', '').lower()
        description = article.get('description', '').lower() if article.get('description') else ''
        content = f"{title} {description}"
        
        # Skip articles with excluded keywords (sports, entertainment, etc.)
        has_excluded = any(keyword in content for keyword in EXCLUDE_KEYWORDS)
        if has_excluded:
            continue
        
        # Check if article has community-focused keywords
        has_community_keywords = any(keyword in content for keyword in COMMUNITY_POSITIVE_KEYWORDS)
        
        # Check sentiment using community-focused analysis
        sentiment_score = community_sentiment_analysis(content)
        
        # Only keep articles that have community keywords AND positive sentiment
        if has_community_keywords and sentiment_score > 0.2:
            article['sentiment_score'] = sentiment_score
            article['community_focus'] = True
            filtered_articles.append(article)
    
    # Sort by sentiment score (most community-positive first)
    filtered_articles.sort(key=lambda x: x.get('sentiment_score', 0), reverse=True)
    
    return filtered_articles[:15]  # Return top 15 community-focused articles

def fetch_feel_good_news():
    """Fetch and filter community-focused feel-good news"""
    cache_key = 'community_feel_good_news'

    if cache_key in NEWS_CACHE:
        cached_data, cached_time = NEWS_CACHE[cache_key]
        if datetime.now(timezone.utc) - cached_time < NEWS_CACHE_DURATION:
            print(f"📰 Returning cached community news ({len(cached_data)} articles)")
            return cached_data
    
    all_articles = []
    
    try:
        community_queries = [
            'community volunteer charity kindness',
            'neighbors helping local support',
            'food bank donation fundraiser nonprofit',
            'good samaritan random act kindness',
            'community garden clean up beautification',
            'mentorship tutoring youth program',
            'disaster relief mutual aid recovery',
            'senior center elderly care support',
            'community comes together unity'
        ]
        
        headers = {'User-Agent': 'Mindsy-Community-News-App/1.0'}
        
        for query in community_queries:
            try:
                if NEWS_API_KEY and NEWS_API_KEY != 'your-news-api-key-here':
                    url = f"https://newsapi.org/v2/everything"
                    params = {
                        'q': query,
                        'language': 'en',
                        'sortBy': 'publishedAt',
                        'pageSize': 15,
                        'apiKey': NEWS_API_KEY,
                        'excludeDomains': 'espn.com,sports.com,tmz.com,entertainment.com'  # Exclude sports/entertainment
                    }
                    
                    print(f"🔍 Fetching community news for query: {query}")
                    response = requests.get(url, params=params, headers=headers, timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('articles'):
                            all_articles.extend(data['articles'])
                            print(f"✅ Found {len(data['articles'])} articles for query: {query}")
                    else:
                        print(f"❌ NewsAPI error {response.status_code} for query: {query}")
                
            except Exception as e:
                print(f"Error fetching news for query '{query}': {e}")
                continue
        if not all_articles:
            print("📰 Trying Guardian API for community news...")
            try:
                guardian_url = "https://content.guardianapis.com/search"
                guardian_params = {
                    'q': 'community AND (volunteer OR charity OR kindness OR helping OR support)',
                    'section': 'society|environment|education',
                    'page-size': 20,
                    'show-fields': 'headline,trailText,thumbnail,short-url',
                    'order-by': 'newest'
                }
                
                response = requests.get(guardian_url, params=guardian_params, headers=headers, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    guardian_articles = []
                    
                    for item in data.get('response', {}).get('results', []):
                        article = {
                            'title': item.get('webTitle', ''),
                            'description': item.get('fields', {}).get('trailText', ''),
                            'url': item.get('fields', {}).get('short-url', item.get('webUrl', '')),
                            'urlToImage': item.get('fields', {}).get('thumbnail', ''),
                            'publishedAt': item.get('webPublicationDate', ''),
                            'source': {'name': 'The Guardian'}
                        }
                        guardian_articles.append(article)
                    
                    all_articles.extend(guardian_articles)
                    print(f"✅ Found {len(guardian_articles)} articles from Guardian")
                    
            except Exception as e:
                print(f"Error fetching from Guardian API: {e}")
    
    except Exception as e:
        print(f"Error in fetch_feel_good_news: {e}")

    if not all_articles:
        print("📰 No articles found from APIs, creating sample community articles...")
        all_articles = [
            {
                'title': 'Local Neighbors Organize Food Drive for Families in Need',
                'description': 'Community volunteers collected over 2,000 meals to support local families facing food insecurity during tough times.',
                'url': 'https://example.com/food-drive',
                'urlToImage': '',
                'publishedAt': datetime.now(timezone.utc).isoformat(),
                'source': {'name': 'Community Herald'},
                'sentiment_score': 0.9,
                'community_focus': True
            },
            {
                'title': 'Teenagers Start Tutoring Program for Younger Students',
                'description': 'High school volunteers launch after-school program to help elementary students with homework and reading skills.',
                'url': 'https://example.com/tutoring-program',
                'urlToImage': '',
                'publishedAt': datetime.now(timezone.utc).isoformat(),
                'source': {'name': 'Local Education News'},
                'sentiment_score': 0.8,
                'community_focus': True
            },
            {
                'title': 'Community Garden Brings Neighbors Together',
                'description': 'Residents transform vacant lot into thriving garden space where families grow fresh vegetables and build friendships.',
                'url': 'https://example.com/community-garden',
                'urlToImage': '',
                'publishedAt': datetime.now(timezone.utc).isoformat(),
                'source': {'name': 'Neighborhood News'},
                'sentiment_score': 0.7,
                'community_focus': True
            },
            {
                'title': 'Local Business Owner Starts Free Meal Program',
                'description': 'Restaurant owner begins serving free lunches to seniors and low-income families every weekend.',
                'url': 'https://example.com/free-meals',
                'urlToImage': '',
                'publishedAt': datetime.now(timezone.utc).isoformat(),
                'source': {'name': 'Community Voice'},
                'sentiment_score': 0.9,
                'community_focus': True
            }
        ]

    filtered_articles = filter_community_news(all_articles)

    unique_articles = []
    seen_titles = set()
    
    for article in filtered_articles:
        title_words = set(article.get('title', '').lower().split())
        is_duplicate = False
        
        for seen_title in seen_titles:
            seen_words = set(seen_title.split())
            if len(title_words & seen_words) / max(len(title_words), len(seen_words), 1) > 0.6:
                is_duplicate = True
                break
        
        if not is_duplicate:
            seen_titles.add(article.get('title', '').lower())
            unique_articles.append(article)
    
    print(f"📰 Final result: {len(unique_articles)} unique community-focused articles")
    NEWS_CACHE[cache_key] = (unique_articles, datetime.now(timezone.utc))
    
    return unique_articles

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    return len(password) >= 6

def validate_genres(genres):
    if not isinstance(genres, list):
        return False
    if len(genres) == 0:
        return False
    if len(genres) > 5:
        return False
    
    valid_genres = [
        'community', 'kindness', 'charity', 'volunteering', 'mutual-aid', 'wholesome',
        'local-news', 'social-good', 'environmental', 'education', 'health-wellness'
    ]
    
    return all(genre in valid_genres for genre in genres)



@app.route('/api/users/<string:username>/saved-articles', methods=['POST', 'OPTIONS'])
def save_article(username):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        article_title = data.get('title', '').strip()
        article_url = data.get('url', '').strip()
        
        if not article_title or not article_url:
            return jsonify({'error': 'Title and URL are required'}), 400

        existing_saved = SavedArticle.query.filter_by(
            user_id=user.id,
            article_url=article_url
        ).first()
        
        if existing_saved:
            return jsonify({'error': 'Article already saved'}), 400

        saved_article = SavedArticle(
            user_id=user.id,
            article_title=article_title,
            article_description=data.get('description', ''),
            article_url=article_url,
            article_image_url=data.get('urlToImage', ''),
            article_source=data.get('source', {}).get('name', '') if data.get('source') else '',
            article_published_at=data.get('publishedAt', '')
        )
        
        db.session.add(saved_article)
        db.session.commit()
        
        return jsonify({
            'message': 'Article saved successfully',
            'saved_article': saved_article.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error saving article: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/users/<string:username>/saved-articles', methods=['GET', 'OPTIONS'])
def get_saved_articles(username):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        saved_articles = SavedArticle.query.filter_by(user_id=user.id)\
                                         .order_by(SavedArticle.saved_at.desc())\
                                         .all()
        
        articles_data = [article.to_dict() for article in saved_articles]
        
        return jsonify({
            'status': 'success',
            'saved_articles': articles_data,
            'count': len(articles_data),
            'username': username,
            'user_id': user.id
        }), 200
        
    except Exception as e:
        print(f"Error getting saved articles: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/users/<string:username>/saved-articles/<int:article_id>', methods=['DELETE', 'OPTIONS'])
def unsave_article(username, article_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        saved_article = SavedArticle.query.filter_by(
            id=article_id, 
            user_id=user.id
        ).first()
        
        if not saved_article:
            return jsonify({'error': 'Saved article not found'}), 404
        
        db.session.delete(saved_article)
        db.session.commit()
        
        return jsonify({
            'message': 'Article removed from saved articles'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error removing saved article: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/users/<string:username>/saved-articles/check', methods=['POST', 'OPTIONS'])
def check_if_saved(username):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        article_url = data.get('url', '').strip()
        
        if not article_url:
            return jsonify({'error': 'URL is required'}), 400

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        saved_article = SavedArticle.query.filter_by(
            user_id=user.id, 
            article_url=article_url
        ).first()
        
        return jsonify({
            'is_saved': saved_article is not None,
            'saved_article_id': saved_article.id if saved_article else None
        }), 200
        
    except Exception as e:
        print(f"Error checking saved status: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# News API endpoints
@app.route('/api/news/feel-good', methods=['GET', 'OPTIONS'])
def get_feel_good_news():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        print("📰 Fetching community-focused feel-good news...")
        articles = fetch_feel_good_news()
        print(f"✅ Returning {len(articles)} community articles")
        
        response_data = {
            'status': 'success',
            'articles': articles,
            'count': len(articles),
            'focus': 'community',
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        return jsonify(response_data), 200
    except Exception as e:
        print(f"❌ Error getting community news: {e}")
        return jsonify({
            'status': 'error',
            'error': 'Failed to fetch community news',
            'message': str(e)
        }), 500
    

@app.route('/api/news/world-news', methods=['GET', 'OPTIONS'])
def get_world_news():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        print("🌍 Fetching world news...")
        articles = fetch_feel_good_news() 
        
        return jsonify({
            'status': 'success',
            'articles': articles,
            'count': len(articles),
            'focus': 'world',
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 200
    except Exception as e:
        print(f"❌ Error getting world news: {e}")
        return jsonify({
            'status': 'error',
            'error': 'Failed to fetch world news',
            'message': str(e)
        }), 500

@app.route('/api/news/categories', methods=['GET', 'OPTIONS'])
def get_news_categories():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    return jsonify({
        'categories': [
            {'id': 'community', 'name': 'Community', 'icon': '🤝'},
            {'id': 'kindness', 'name': 'Acts of Kindness', 'icon': '💝'},
            {'id': 'charity', 'name': 'Charity & Giving', 'icon': '🎁'},
            {'id': 'volunteering', 'name': 'Volunteering', 'icon': '🙋‍♀️'},
            {'id': 'mutual-aid', 'name': 'Mutual Aid', 'icon': '🤲'},
            {'id': 'local-news', 'name': 'Local Good News', 'icon': '🏘️'},
            {'id': 'environmental', 'name': 'Environmental Stewardship', 'icon': '🌱'},
            {'id': 'education', 'name': 'Education & Youth', 'icon': '📚'},
            {'id': 'health-wellness', 'name': 'Community Health', 'icon': '💚'}
        ]
    }), 200

@app.route('/api/users/<int:user_id>/news-preferences', methods=['PUT', 'OPTIONS'])
def update_news_preferences(user_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        preferences = data.get('preferences', [])
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.set_news_preferences(preferences)
        db.session.commit()
        
        return jsonify({
            'message': 'News preferences updated successfully',
            'preferences': user.get_news_preferences()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/test-cors', methods=['GET', 'OPTIONS'])
def test_cors():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    print("🔍 CORS test endpoint called")
    return jsonify({
        'status': 'success',
        'message': 'CORS is working correctly!',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'headers_received': dict(request.headers)
    }), 200

@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health_check():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    return jsonify({
        'status': 'healthy', 
        'message': 'Community News Backend is running!',
        'focus': 'community-centered feel-good news',
        'timestamp': datetime.now(timezone.utc).isoformat()
    }), 200

@app.route('/api/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        genres = data.get('genres', [])
        profile_picture = data.get('profilePicture')

    
        if not username or len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters'}), 400
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        if not validate_password(password):
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        if genres and not validate_genres(genres):
            return jsonify({'error': 'Invalid genres selection'}), 400


        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400

        password_hash = generate_password_hash(password)
        new_user = User(
            username=username,
            email=email,
            password_hash=password_hash,
            profile_picture=profile_picture
        )

        if genres:
            new_user.set_genres(genres)

        new_user.set_news_preferences(['community', 'kindness', 'charity'])

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            'message': 'User created successfully',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email,
                'genres': new_user.get_genres(),
                'profile_picture': new_user.profile_picture,
                'news_preferences': new_user.get_news_preferences(),
                'created_at': new_user.created_at.isoformat(),

            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
            
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        login_field = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not login_field or not password:
            return jsonify({'error': 'Username/email and password are required'}), 400

        user = None
        if validate_email(login_field):
            user = User.query.filter_by(email=login_field.lower()).first()
        else:
            user = User.query.filter_by(username=login_field).first()
        
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid username/email or password'}), 401
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'genres': user.get_genres(),
                'profile_picture': user.profile_picture,
                'news_preferences': user.get_news_preferences(),
                'created_at': user.created_at.isoformat(),
     
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/users', methods=['GET', 'OPTIONS'])
def get_users():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        users = User.query.all()
        return jsonify({
            'users': [{
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'genres': user.get_genres(),
                'profile_picture': user.profile_picture,
                'news_preferences': user.get_news_preferences(),
                'created_at': user.created_at.isoformat(),
          
            } for user in users]
        }), 200
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting Flask backend server for Community-Focused News...")
    print(f"Database location: {db_path}")
    
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully!")
        except Exception as e:
            print(f"Error creating database: {e}")
            exit(1)
    


    
    app.run(debug=True, host='0.0.0.0', port=5000)