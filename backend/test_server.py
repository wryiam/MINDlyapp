from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)

# Simple CORS setup that definitely works
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Test endpoint
@app.route('/api/test-cors', methods=['GET'])
def test_cors():
    return jsonify({
        'status': 'success',
        'message': 'CORS is working!',
        'method': request.method,
        'origin': request.headers.get('Origin', 'No Origin')
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Server is running!'
    })

# Simple signup endpoint for testing
@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        print(f"Received {request.method} request to /api/signup")
        print(f"Origin: {request.headers.get('Origin', 'No Origin')}")
        print(f"Content-Type: {request.headers.get('Content-Type', 'No Content-Type')}")
        
        # Check if request has JSON data
        if not request.is_json:
            print("Request is not JSON")
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        print(f"Received data: {data}")
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Basic validation
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not username:
            return jsonify({'error': 'Username is required'}), 400
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Mock successful response
        user_data = {
            'id': 123,
            'username': username,
            'email': email,
            'genres': data.get('genres', []),
            'created_at': '2025-09-07T14:36:35.551832+00:00'
        }
        
        print(f"Sending success response: {user_data}")
        
        return jsonify({
            'message': 'User created successfully',
            'user': user_data
        }), 201
        
    except Exception as e:
        print(f"Error in signup: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting minimal Flask server...")
    print("Available endpoints:")
    print("- GET  http://localhost:5000/api/health")
    print("- GET  http://localhost:5000/api/test-cors") 
    print("- POST http://localhost:5000/api/signup")
    print("")
    print("Server will run on http://0.0.0.0:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)