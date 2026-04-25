# AI Service

Food classification and freshness detection service using TensorFlow and OpenCV.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Download pre-trained models:
```bash
# Place your trained models in the models/ directory
# - food_classifier.h5 (TensorFlow Keras model)
# - freshness_detector.h5 (TensorFlow Keras model)
```

4. Run the service:
```bash
python app.py
```

## API Endpoints

### Health Check
```
GET /health
```

### Classify Food
```
POST /classify
Content-Type: multipart/form-data

Parameters:
- image: Image file (JPEG, PNG)

Response:
{
  "foodType": "Rice",
  "confidence": 0.95
}
```

### Detect Freshness
```
POST /freshness
Content-Type: multipart/form-data

Parameters:
- image: Image file (JPEG, PNG)

Response:
{
  "freshnessScore": 85,
  "status": "Fresh",
  "details": "Good condition, minimal spoilage"
}
```

## Model Requirements

- Input: 224x224 RGB images
- Output: Classification label and confidence score
- Framework: TensorFlow 2.15+

## Environment Variables

```
PORT=5000
FLASK_ENV=development
MODEL_PATH=models/
```
