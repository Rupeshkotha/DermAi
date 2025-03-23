# Skin Disease Detection System

A modern web application that uses AI to detect and analyze various skin conditions. Built with React, FastAPI, and PyTorch.

## Features

- 🔍 Real-time skin disease detection
- 🤖 AI-powered analysis and insights
- 📱 Responsive design for all devices
- 🌓 Dark/Light mode support
- 🔐 Google Authentication
- 💡 Detailed disease information and treatment recommendations

## Tech Stack & External Dependencies

### Frontend
1. **Core Framework**
   - React 18.x
   - TypeScript 5.x
   - Vite/React Scripts for build tooling

2. **UI & Styling**
   - Tailwind CSS for utility-first styling
   - Heroicons for UI icons
   - React Dropzone for file uploads
   - Headless UI for accessible components

3. **State Management & Routing**
   - React Context API for global state
   - React Router for navigation

4. **Authentication & Backend Integration**
   - Firebase Authentication
   - Firebase Firestore for database
   - Firebase Storage for image storage

5. **Development Tools**
   - ESLint for code linting
   - Prettier for code formatting
   - TypeScript for type safety

### Backend
1. **Core Framework**
   - FastAPI for REST API
   - Python 3.8+
   - Uvicorn ASGI server

2. **Machine Learning**
   - PyTorch for deep learning
   - DinoV2 model for image classification
   - Custom dermatology model weights

3. **AI & Natural Language Processing**
   - OpenRouter API for GPT integration
   - Custom prompt engineering for medical insights

4. **Image Processing**
   - Pillow (PIL) for image manipulation
   - OpenCV for image preprocessing

5. **Database & Storage**
   - Firebase Firestore
   - Firebase Storage

## External APIs

1. **Firebase Services**
   - Authentication API
   - Firestore Database API
   - Storage API
   - Configuration: Environment variables for Firebase setup

2. **OpenRouter API**
   - GPT model access
   - Medical information generation
   - Treatment recommendations

3. **Custom ML Model API**
   - DinoV2-based skin disease classification
   - Confidence scoring
   - Disease detection endpoints

## Development Tools & Environment

1. **Version Control**
   - Git for source control
   - GitHub for repository hosting

2. **Development Environment**
   - Node.js 14+ for frontend
   - Python 3.8+ for backend
   - Virtual environment (venv) for Python dependencies

3. **Package Management**
   - npm/yarn for frontend
   - pip for Python packages

4. **Environment Variables**
   - `.env` files for configuration
   - Environment-specific settings

## Project Structure

```
skin-disease-detection/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── context/         # React context providers
│   │   ├── config/          # Configuration files
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript type definitions
│   └── public/              # Static assets
├── app/                     # Backend application
│   ├── model/              # ML model handling
│   └── utils/              # Utility functions
├── main.py                 # FastAPI application entry
└── requirements.txt        # Python dependencies
```

## API Endpoints

1. **Authentication**
   - `POST /auth/login`: User login
   - `POST /auth/register`: User registration
   - `POST /auth/logout`: User logout

2. **Disease Detection**
   - `POST /detect`: Upload and analyze skin image
   - `GET /diseases`: List supported diseases
   - `GET /diseases/{id}`: Get disease details

3. **Monitoring**
   - `POST /monitoring/start`: Start condition monitoring
   - `POST /monitoring/check-in`: Add progress check-in
   - `GET /monitoring/conditions`: Get user's monitored conditions
   - `GET /monitoring/progress/{id}`: Get condition progress

## Security Considerations

1. **Authentication**
   - Firebase Authentication
   - JWT token management
   - Secure session handling

2. **Data Protection**
   - Environment variable management
   - API key security
   - Data encryption

3. **Access Control**
   - Role-based access control
   - User data isolation
   - API rate limiting

## Deployment Requirements

1. **Frontend**
   - Node.js environment
   - Build optimization
   - Environment configuration

2. **Backend**
   - Python environment
   - ML model deployment
   - API server configuration

3. **Infrastructure**
   - Firebase project setup
   - API key management
   - Environment variables

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

