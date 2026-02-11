# AI Microservice

Python Flask service for food classification and freshness detection using TensorFlow and OpenCV.

## Features

- 🤖 **Food Classification**: MobileNetV2-based food type detection
- 🍎 **Freshness Detection**: Color and texture analysis for freshness scoring
- 🚀 **Fast Inference**: Lightweight model optimized for speed
- 🐳 **Dockerized**: Ready for containerized deployment

## Setup

### Prerequisites

- Python 3.10+
- pip

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py
```

Server will start on `http://localhost:5000`

### Docker

```bash
# Build image
docker build -t hungerblock-ai .

# Run container
docker run -p 5000:5000 hungerblock-ai
```

## API Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "message": "AI service running"
}
```

### Classify Food
```bash
POST /classify
Content-Type: multipart/form-data

image: <file>
```

Response:
```json
{
  "category": "pizza",
  "confidence": 0.95,
  "probability": "95.00%",
  "top_predictions": [
    {
      "label": "pizza",
      "confidence": 0.95,
      "probability": "95.00%"
    }
  ]
}
```

### Detect Freshness
```bash
POST /freshness
Content-Type: multipart/form-data

image: <file>
```

Response:
```json
{
  "score": 85,
  "category": "excellent",
  "description": "Food appears very fresh and safe to donate",
  "metrics": {
    "brightness": 156.23,
    "texture_variance": 892.45,
    "color_distribution": {
      "fresh": 65.23,
      "ripe": 25.10,
      "spoiled": 2.15
    }
  }
}
```

## Models

### Food Classifier
- **Model**: MobileNetV2 (pre-trained on ImageNet)
- **Input**: 224x224 RGB images
- **Output**: Food category + top 5 predictions
- **Categories**: pizza, bread, vegetables, fruits, meat, dessert, rice, pasta, other

### Freshness Detector
- **Method**: Computer vision (HSV color analysis + texture)
- **Score**: 0-100 (higher = fresher)
- **Categories**: excellent (80-100), good (60-79), fair (40-59), poor (0-39)
- **Metrics**: Brightness, texture variance, color distribution

## Environment Variables

```bash
PORT=5000
FLASK_ENV=development  # or production
```

## Production Deployment

The service uses Gunicorn in production:
- 2 workers
- 120s timeout (for model inference)
- Binds to 0.0.0.0:5000
