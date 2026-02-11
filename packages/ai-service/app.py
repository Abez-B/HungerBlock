from flask import Flask, request, jsonify
from flask_cors import CORS
from models.classifier import FoodClassifier
from models.freshness import FreshnessDetector
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize models
print("Loading AI models...")
classifier = FoodClassifier()
freshness_detector = FreshnessDetector()
print("AI models loaded successfully!")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'AI service running'})

@app.route('/classify', methods=['POST'])
def classify():
    """Classify food type from image"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image_file = request.files['image']
    
    try:
        result = classifier.predict(image_file)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/freshness', methods=['POST'])
def freshness():
    """Detect food freshness from image"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image_file = request.files['image']
    
    try:
        result = freshness_detector.analyze(image_file)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
