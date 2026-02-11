import numpy as np
from PIL import Image
import io
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image as keras_image

class FoodClassifier:
    def __init__(self):
        """Initialize MobileNetV2 model with pre-trained ImageNet weights"""
        print("Loading MobileNetV2 model...")
        self.model = MobileNetV2(weights='imagenet', include_top=True)
        print("Model loaded successfully")
        
        # Food category mapping (simplified)
        self.food_categories = {
            'pizza': ['pizza'],
            'bread': ['bagel', 'pretzel', 'french_loaf'],
            'vegetables': ['broccoli', 'cauliflower', 'head_cabbage', 'artichoke'],
            'fruits': ['banana', 'strawberry', 'orange', 'lemon', 'pineapple'],
            'meat': ['hot_dog', 'hamburger', 'cheeseburger'],
            'dessert': ['ice_cream', 'chocolate_sauce', 'custard'],
            'rice': ['rice'],
            'pasta': ['spaghetti', 'ravioli'],
        }
    
    def predict(self, image_file):
        """
        Predict food type from image
        Returns: dict with category, confidence, and raw predictions
        """
        # Read and preprocess image
        img = Image.open(image_file.stream).convert('RGB')
        img = img.resize((224, 224))
        img_array = keras_image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)
        
        # Make prediction
        predictions = self.model.predict(img_array)
        decoded = decode_predictions(predictions, top=5)[0]
        
        # Map to food categories
        detected_category = 'other'
        max_confidence = 0.0
        
        for category, keywords in self.food_categories.items():
            for pred in decoded:
                if any(keyword in pred[1].lower() for keyword in keywords):
                    if pred[2] > max_confidence:
                        detected_category = category
                        max_confidence = float(pred[2])
        
        # Format results
        top_predictions = [
            {
                'label': pred[1],
                'confidence': float(pred[2]),
                'probability': f"{float(pred[2]) * 100:.2f}%"
            }
            for pred in decoded
        ]
        
        return {
            'category': detected_category,
            'confidence': max_confidence,
            'probability': f"{max_confidence * 100:.2f}%",
            'top_predictions': top_predictions
        }
