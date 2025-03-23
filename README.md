# Skin Disease Detection System

A modern web application that uses AI to detect and analyze various skin conditions. Built with React, FastAPI, and PyTorch.

## Features

- 🔍 Real-time skin disease detection
- 🤖 AI-powered analysis and insights
- 📱 Responsive design for all devices
- 🌓 Dark/Light mode support
- 🔐 Google Authentication
- 💡 Detailed disease information and treatment recommendations

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Firebase Authentication
- React Dropzone for image uploads
- Context API for state management

### Backend
- FastAPI
- PyTorch with DinoV2 model
- OpenRouter/GPT for AI insights
- CORS support
- Environment variable management

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn
- Firebase account
- OpenRouter API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/skin-disease-detection.git
cd skin-disease-detection
```

2. Set up the backend:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

3. Set up the frontend:
```bash
cd frontend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

## Configuration

### Backend (.env)
```
OPENROUTER_API_KEY=your_api_key
MODEL_PATH=path_to_model
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_CONFIG=your_firebase_config
```

## Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 5000
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
skin-disease-detection/
├── backend/
│   ├── app/
│   │   ├── model/
│   │   │   ├── model_handler.py
│   │   │   └── dinov2_dermnet_model.pth
│   │   └── utils/
│   │       └── gpt_handler.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── Results.tsx
│   │   │   └── Login.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── config/
│   │   │   └── firebase.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## API Endpoints

- `POST /detect`: Upload and analyze a skin image
  - Request: Form data with image file
  - Response: Disease detection results with AI insights

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- DinoV2 model for image classification
- OpenRouter for AI insights
- Firebase for authentication and database
- FastAPI for the backend framework
- React and Tailwind CSS for the frontend

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/skin-disease-detection](https://github.com/yourusername/skin-disease-detection) 