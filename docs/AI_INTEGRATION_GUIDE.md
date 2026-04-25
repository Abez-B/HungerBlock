# AI Integration Guide

## Overview

The HungerBlock AI service supports multiple AI providers for food classification and freshness detection. Choose the provider that best fits your needs.

## Available AI Providers

### 1. **Clarifai** (Recommended) ⭐
- **Best for**: Food recognition
- **Cost**: Free tier available (1,000 operations/month)
- **Accuracy**: High for food items
- **Setup**: Easy

#### Setup Steps:
1. Sign up at [Clarifai](https://clarifai.com/)
2. Create a free account
3. Go to Settings → API Keys
4. Copy your API key
5. Add to `.env`:
```env
AI_PROVIDER=clarifai
AI_API_KEY=your_clarifai_api_key_here
```

#### Usage:
No additional configuration needed - Clarifai has a built-in food recognition model!

---

### 2. **OpenAI GPT-4 Vision**
- **Best for**: General image understanding
- **Cost**: Pay-per-use (~$0.01 per image)
- **Accuracy**: Very high
- **Setup**: Moderate

#### Setup Steps:
1. Sign up at [OpenAI](https://platform.openai.com/)
2. Add credits to your account
3. Generate API key
4. Add to `.env`:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
```

---

### 3. **Custom AI API**
- **Best for**: Proprietary models or specific requirements
- **Cost**: Varies
- **Accuracy**: Depends on your model
- **Setup**: Requires API development

#### Setup Steps:
1. Deploy your AI model as an API
2. Configure endpoint in `.env`:
```env
AI_PROVIDER=custom
AI_API_KEY=your_api_key_here
AI_API_URL=https://your-api.com/classify
```

Your API should accept:
- POST request with JSON: `{"image": "base64_string"}`
- Return JSON: `{"foodType": "string", "confidence": number}`

---

### 4. **Heuristic Mode** (No API)
- **Best for**: Testing/development
- **Cost**: Free
- **Accuracy**: Low (estimates based on food type)
- **Setup**: None

```env
AI_PROVIDER=default
```

---

## API Endpoints

### 1. Classify Food Type
```http
POST /api/ai/classify
Content-Type: multipart/form-data

Parameters:
- image: Image file (JPEG, PNG)

Response:
{
  "foodType": "Rice and Vegetables",
  "confidence": 92.5,
  "source": "clarifai"
}
```

### 2. Detect Freshness
```http
POST /api/ai/freshness
Content-Type: multipart/form-data

Parameters:
- image: Image file

Response:
{
  "freshnessScore": 85,
  "status": "Good",
  "description": "Good condition - suitable for donation",
  "foodType": "Rice",
  "classificationConfidence": 92.5,
  "source": "heuristic"
}
```

### 3. Combined Endpoint (Recommended)
```http
POST /api/ai/classify-and-freshness
Content-Type: multipart/form-data

Parameters:
- image: Image file

Response:
{
  "classification": {
    "foodType": "Pasta",
    "confidence": 88.3,
    "source": "clarifai"
  },
  "freshness": {
    "freshnessScore": 78,
    "status": "Good",
    "description": "Good condition - suitable for donation"
  },
  "freshnessScore": 78,
  "foodType": "Pasta"
}
```

---

## Frontend Integration

### Using the AI Service

The frontend already has hooks to call the AI service:

```typescript
// packages/frontend/src/lib/api.ts
export const aiAPI = {
  classify: (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/ai/classify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  freshness: (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/ai/freshness', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
```

### Example Usage in Component

```typescript
const analyzeImage = async (imageFile: File) => {
  try {
    // Option 1: Use combined endpoint
    const response = await api.post('/api/ai/classify-and-freshness', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    const { foodType, freshnessScore, confidence } = response.data;
    
    // Update UI with results
    setAiAnalysis({
      foodType,
      freshness: freshnessScore,
      confidence
    });
    
  } catch (error) {
    console.error('AI analysis failed:', error);
    // Fallback to default values
    setAiAnalysis({
      foodType: 'Unknown',
      freshness: 75,
      confidence: 0
    });
  }
};
```

---

## Running the AI Service

### 1. Install Dependencies
```bash
cd packages/ai-service
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Start Service
```bash
python app.py
```

Service runs on: `http://localhost:5000`

### 4. Test Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Test classification
curl -X POST http://localhost:5000/classify \
  -F "image=@test-food.jpg"
```

---

## Backend Configuration

Update `packages/backend/.env`:

```env
# AI Service URL
AI_SERVICE_URL=http://localhost:5000

# Or for production:
# AI_SERVICE_URL=https://your-ai-service.com
```

---

## Quick Start with Clarifai (Recommended)

1. **Get Clarifai API Key**
   - Go to https://clarifai.com
   - Sign up (free)
   - Copy API key

2. **Configure AI Service**
   ```bash
   cd packages/ai-service
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   AI_PROVIDER=clarifai
   AI_API_KEY=paste_your_clarifai_key_here
   ```

3. **Start AI Service**
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python app.py
   ```

4. **Test**
   - Open http://localhost:8080
   - Upload a food image
   - See classification and freshness score!

---

## Troubleshooting

### "No AI provider configured"
- Check `AI_PROVIDER` in `.env`
- Valid values: `clarifai`, `openai`, `custom`, `default`

### "API key not found"
- Ensure `AI_API_KEY` is set in `.env`
- No trailing spaces or quotes

### "Connection refused"
- Check if AI service is running: `curl http://localhost:5000/health`
- Verify `AI_SERVICE_URL` in backend `.env`

### "Image too large"
- Clarifai has a 10MB limit
- Compress images before upload

---

## Cost Comparison

| Provider | Free Tier | Cost per Image | Best For |
|----------|-----------|----------------|----------|
| Clarifai | 1,000/mo | $0.001 | Food recognition |
| OpenAI | $5 credit | ~$0.01 | General images |
| Custom | Varies | Varies | Specific needs |
| Heuristic | Unlimited | Free | Testing |

---

## Next Steps

1. **Choose your provider** (Clarifai recommended)
2. **Set up API keys**
3. **Test with sample images**
4. **Deploy to production**
5. **Monitor usage and costs**

Need help? Check the API documentation or contact support!
