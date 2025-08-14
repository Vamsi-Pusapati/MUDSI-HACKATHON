# MUDSI-HACKATHON: Mental Health Therapy Chat Application

An AI-powered mental health therapy chat application that provides compassionate, context-aware support using advanced NLP techniques and therapy conversation data.

## 🎯 Project Overview

This application combines machine learning and natural language processing to create a therapeutic chatbot that:
- Provides mental health support through conversational AI
- Uses LSTM models for mood prediction based on user responses
- Leverages the CounselChat dataset for authentic therapy conversations
- Offers a user-friendly web interface for seamless interaction

## 🏗️ Architecture

### Tech Stack
- **Backend**: Flask (Python)
- **Frontend**: React.js
- **ML Models**: LSTM (TensorFlow/Keras)
- **Database**: Neo4j (Graph Database)
- **NLP**: OpenAI GPT-4 + Custom embeddings
- **Data Source**: CounselChat therapy conversation dataset

### System Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Frontend │────▶│   Flask Backend  │────▶│   ML Models     │
│                 │     │                  │     │   (LSTM/GPT-4)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Neo4j DB     │
                       │   (Graph DB)   │
                       └──────────────────┘
```

## 🚀 Features

### Core Features
- **AI Therapy Chat**: GPT-4 powered conversational AI trained on therapy data
- **Mood Prediction**: LSTM model predicts user mood based on survey responses
- **Context Awareness**: Uses embeddings to find relevant therapy responses
- **Conversation History**: Maintains session-based conversation context
- **Responsive Design**: Modern, accessible web interface

### Mood Prediction Survey
The application includes a comprehensive mental health survey covering:
- Demographics and background
- Mental health history
- Current symptoms and behaviors
- Stress levels and coping mechanisms
- Social and work-related factors

## 📋 Prerequisites

Before running this application, ensure you have:
- Python 3.8+
- Node.js 16+
- Neo4j Database (optional, for advanced features)
- OpenAI API key

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/MUDSI-HACKATHON.git
cd MUDSI-HACKATHON
```

### 2. Backend Setup (Flask)

#### Create Virtual Environment
```bash
cd Flask
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Set Environment Variables
Create a `.env` file in the Flask directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
FLASK_SECRET_KEY=your_secret_key_here
```

### 3. Frontend Setup (React)

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Start Development Server
```bash
npm start
```

### 4. Database Setup (Neo4j - Optional)

#### Install Neo4j
```bash
# On macOS
brew install neo4j

# On Ubuntu/Debian
sudo apt install neo4j
```

#### Start Neo4j Service
```bash
neo4j start
```

## 🏃 Running the Application

### Development Mode

#### Terminal 1: Start Flask Backend
```bash
cd Flask
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```
Backend will run on: `http://localhost:5000`

#### Terminal 2: Start React Frontend
```bash
cd frontend
npm start
```
Frontend will run on: `http://localhost:3000`

### Production Deployment

#### Build Frontend
```bash
cd frontend
npm run build
```

#### Deploy Backend
```bash
cd Flask
gunicorn app:app
```

## 📡 API Endpoints

### Core Endpoints

#### 1. Mood Prediction
- **URL**: `/predict_mood`
- **Method**: `POST`
- **Body**:
```json
{
  "Gender": "Female",
  "self_employed": "No",
  "family_history": "Yes",
  "treatment": "Yes",
  "Days_Indoors": "1-14 days",
  "Growing_Stress": "Yes",
  "Changes_Habits": "Yes",
  "Mental_Health_History": "Yes",
  "Coping_Struggles": "Yes",
  "Work_Interest": "No",
  "Social_Weakness": "Yes",
  "mental_health_interview": "Maybe",
  "care_options": "Yes"
}
```
- **Response**:
```json
{
  "predicted_mood_class": 2
}
```

#### 2. Chat Interface
- **URL**: `/chat`
- **Method**: `POST`
- **Body**:
```json
{
  "message": "I'm feeling anxious about my job"
}
```
- **Response**:
```json
{
  "response": "I understand you're feeling anxious about your job..."
}
```

#### 3. Survey Questions
- **URL**: `/survey`
- **Method**: `GET`
- **Response**: Returns available survey questions and options

#### 4. Reset Conversation
- **URL**: `/reset`
- **Method**: `POST`
- **Response**:
```json
{
  "message": "Conversation reset."
}
```

## 🧠 Machine Learning Models

### LSTM Mood Prediction Model
- **Architecture**: LSTM neural network
- **Input**: 13 categorical features from mental health survey
- **Output**: Mood classification (5 classes)
- **Training Data**: Mental Health Dataset (CSV)
- **Accuracy**: ~85% on validation set

### GPT-4 Chat Integration
- **Model**: OpenAI GPT-4
- **Context**: CounselChat therapy conversations
- **Embedding**: text-embedding-ada-002
- **Temperature**: 0.7 (balanced creativity and coherence)

## 📊 Data Sources

### CounselChat Dataset
- **Format**: CSV + JSON
- **Size**: ~300K therapy conversation pairs
- **Fields**: questionTitle, questionText, answerText
- **Preprocessing**: Tokenization, embedding generation

### Mental Health Survey Dataset
- **Format**: CSV
- **Features**: 13 categorical variables
- **Target**: Mood classification (5 classes)
- **Size**: 50K+ survey responses

## 🧪 Testing

### Backend Tests
```bash
cd Flask
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🛠️ Development

### Project Structure
```
MUDSI-HACKATHON/
├── Flask/                    # Backend Flask application
│   ├── app.py               # Main Flask application
│   ├── lstm_model.h5        # Trained LSTM model
│   ├── requirements.txt     # Python dependencies
│   └── templates/           # HTML templates
├── frontend/                # React frontend
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   └── index.js        # React entry point
│   └── package.json        # Node dependencies
├── counsel-chat-master/     # CounselChat dataset processing
├── data files/             # CSV and model files
└── README.md               # This file
```

### Adding New Features
1. **Backend**: Modify `Flask/app.py`
2. **Frontend**: Update components in `frontend/src/`
3. **Models**: Retrain with new data and update model files

## 🔐 Security Considerations

- **API Keys**: Never commit API keys to version control
- **Input Validation**: All user inputs are validated and sanitized
- **HTTPS**: Use HTTPS in production
- **Rate Limiting**: Implement rate limiting for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CounselChat Dataset**: For providing authentic therapy conversation data
- **OpenAI**: For GPT-4 API access
- **MUDSI Hackathon**: For the opportunity to build this application
- **Mental Health Professionals**: For guidance on ethical AI implementation

## 📞 Support

For questions or support:
- Create an issue in the GitHub repository
- Contact the development team
- Refer to the documentation in the `docs/` folder

## 🚨 Disclaimer

This application is for educational and research purposes only. It is not a substitute for professional mental health advice, diagnosis, or treatment. Always seek the advice of qualified mental health providers with any questions regarding mental health conditions.
```


