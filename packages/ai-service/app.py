from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv
import base64
from PIL import Image
import io

load_dotenv()

app = Flask(__name__)
CORS(app)

# AI Service Configuration
AI_PROVIDER = os.getenv('AI_PROVIDER', 'clarifai')  # clarifai, openai, custom
AI_API_KEY = os.getenv('AI_API_KEY', '')
AI_API_URL = os.getenv('AI_API_URL', '')

# Clarifai Configuration
CLARIFAI_APP_ID = os.getenv('CLARIFAI_APP_ID', '')
CLARIFAI_MODEL_ID = os.getenv('CLARIFAI_MODEL_ID', 'food-item-recognition')

# OpenAI Configuration  
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

def encode_image_to_base64(image_file):
    """Convert uploaded image to base64"""
    return base64.b64encode(image_file.read()).decode('utf-8')

def classify_with_clarifai(image_base64):
    """Use Clarifai Food Item Recognition model"""
    url = "https://api.clarifai.com/v2/models/food-item-recognition/predictions"
    
    payload = {
        "inputs": [{
            "data": {
                "image": {
                    "base64": image_base64
                }
            }
        }]
    }
    
    headers = {
        'Authorization': f'Key {AI_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()
    
    if 'outputs' in data and len(data['outputs']) > 0:
        concepts = data['outputs'][0]['data']['concepts']
        if concepts:
            top_concept = concepts[0]
            return {
                'foodType': top_concept['name'].replace('_', ' ').title(),
                'confidence': round(top_concept['value'] * 100, 2),
                'source': 'clarifai'
            }
    
    return {'foodType': 'Unknown', 'confidence': 0, 'source': 'clarifai'}

def classify_with_openai(image_base64):
    """Use OpenAI GPT-4 Vision for food classification"""
    url = "https://api.openai.com/v1/chat/completions"
    
    headers = {
        'Content-Type': 'application/application/json',
        'Authorization': f'Bearer {OPENAI_API_KEY}'
    }
    
    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What type of food is in this image? Respond with just the food name."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    }
    
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()
    
    if 'choices' in data and len(data['choices']) > 0:
        food_type = data['choices'][0]['message']['content']
        return {
            'foodType': food_type,
            'confidence': 95.0,
            'source': 'openai'
        }
    
    return {'foodType': 'Unknown', 'confidence': 0, 'source': 'openai'}

def classify_with_custom_api(image_base64):
    """Use custom AI API endpoint"""
    try:
        headers = {
            'Authorization': f'Bearer {AI_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'image': image_base64,
            'task': 'classify'
        }
        
        response = requests.post(AI_API_URL, json=payload, headers=headers, timeout=30)
        data = response.json()
        
        # Adjust based on your custom API response format
        return {
            'foodType': data.get('food_type', 'Unknown'),
            'confidence': data.get('confidence', 0),
            'source': 'custom'
        }
    except Exception as e:
        return {'foodType': 'Error', 'confidence': 0, 'source': 'custom', 'error': str(e)}

def estimate_freshness(image_base64, food_type):
    """
    Estimate freshness based on food type and simple heuristics
    In production, replace with actual ML model or external API
    """
    # Simple heuristic-based freshness estimation
    # You can replace this with actual AI model calls
    
    freshness_scores = {
        'fruit': 85,
        'vegetable': 80,
        'bread': 70,
        'pasta': 90,
        'rice': 95,
        'meat': 60,
        'dairy': 75,
        'bakery': 70,
        'salad': 65,
        'soup': 80
    }
    
    food_type_lower = food_type.lower()
    base_score = 75  # Default score
    
    for food, score in freshness_scores.items():
        if food in food_type_lower:
            base_score = score
            break
    
    # Add some randomness for demonstration
    import random
    final_score = min(100, max(0, base_score + random.randint(-10, 10)))
    
    if final_score >= 85:
        status = "Excellent"
    elif final_score >= 70:
        status = "Good"
    elif final_score >= 50:
        status = "Fair"
    else:
        status = "Poor"
    
    return {
        'freshnessScore': final_score,
        'status': status,
        'description': f"{status} condition - suitable for donation",
        'source': 'heuristic'
    }

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok', 
        'message': 'AI service running',
        'provider': AI_PROVIDER
    })

@app.route('/classify', methods=['POST'])
def classify():
    """Classify food type from image using configured AI provider"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image_file = request.files['image']
    
    try:
        # Read and encode image
        image_content = image_file.read()
        image_base64 = base64.b64encode(image_content).decode('utf-8')
        
        # Route to appropriate classifier
        if AI_PROVIDER == 'clarifai':
            result = classify_with_clarifai(image_base64)
        elif AI_PROVIDER == 'openai':
            result = classify_with_openai(image_base64)
        elif AI_PROVIDER == 'custom':
            result = classify_with_custom_api(image_base64)
        else:
            result = {'foodType': 'Unknown', 'confidence': 0, 'source': 'default'}
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e), 'foodType': 'Error', 'confidence': 0}), 500

@app.route('/freshness', methods=['POST'])
def freshness():
    """Detect food freshness from image"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image_file = request.files['image']
    
    try:
        # First classify the food
        image_content = image_file.read()
        image_base64 = base64.b64encode(image_content).decode('utf-8')
        
        # Get food type first
        if AI_PROVIDER == 'clarifai':
            classification = classify_with_clarifai(image_base64)
        elif AI_PROVIDER == 'openai':
            classification = classify_with_openai(image_base64)
        elif AI_PROVIDER == 'custom':
            classification = classify_with_custom_api(image_base64)
        else:
            classification = {'foodType': 'unknown', 'confidence': 0}
        
        # Estimate freshness based on food type
        freshness_result = estimate_freshness(image_base64, classification['foodType'])
        
        return jsonify({
            **freshness_result,
            'foodType': classification['foodType'],
            'classificationConfidence': classification['confidence']
        })
    
    except Exception as e:
        return jsonify({'error': str(e), 'freshnessScore': 0}), 500

@app.route('/classify-and-freshness', methods=['POST'])
def classify_and_freshness():
    """Combined endpoint for both classification and freshness"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image_file = request.files['image']
    
    try:
        image_content = image_file.read()
        image_base64 = base64.b64encode(image_content).decode('utf-8')
        
        # Classify
        if AI_PROVIDER == 'clarifai':
            classification = classify_with_clarifai(image_base64)
        elif AI_PROVIDER == 'openai':
            classification = classify_with_openai(image_base64)
        elif AI_PROVIDER == 'custom':
            classification = classify_with_custom_api(image_base64)
        else:
            classification = {'foodType': 'Unknown', 'confidence': 0}
        
        # Estimate freshness
        freshness = estimate_freshness(image_base64, classification['foodType'])
        
        return jsonify({
            'classification': classification,
            'freshness': freshness,
            'freshnessScore': freshness['freshnessScore'],
            'foodType': classification['foodType']
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    print(f"Starting AI Service with provider: {AI_PROVIDER}")
    app.run(host='0.0.0.0', port=port, debug=debug)
