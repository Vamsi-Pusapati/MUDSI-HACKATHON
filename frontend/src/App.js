import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Button,
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a default theme
const theme = createTheme();

// Styled Components
const TwoCardContainer = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const OptionCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textAlign: 'center',
  boxShadow: theme.shadows[3],
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  backgroundColor: '#ffffff',
}));

const ChatContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '60vh',
  overflowY: 'auto',
  backgroundColor: '#f4f4f9',
  marginTop: theme.spacing(2),
}));

// Survey Questions (you can update these as needed)
const surveyQuestions = {
  Gender: {
    question: "What is your gender?",
    options: ["Female", "Male"],
  },
  self_employed: {
    question: "Are you self-employed?",
    options: ["No", "Yes"],
  },
  family_history: {
    question: "Do you have a family history of mental health issues?",
    options: ["No", "Yes"],
  },
  treatment: {
    question: "Have you ever received mental health treatment?",
    options: ["No", "Yes"],
  },
  Days_Indoors: {
    question: "How frequently do you go outdoors?",
    options: ["Go out Every day", "1-14 days", "15-30 days", "31-60 days", "More than 2 months"],
  },
  Growing_Stress: {
    question: "Do you feel that your stress levels are increasing?",
    options: ["Yes", "No", "Maybe"],
  },
  Changes_Habits: {
    question: "Have you experienced significant changes in your daily habits?",
    options: ["Yes", "No", "Maybe"],
  },
  Mental_Health_History: {
    question: "Do you have a personal history of mental health issues?",
    options: ["Yes", "No", "Maybe"],
  },
  Coping_Struggles: {
    question: "Do you find it difficult to cope with daily challenges?",
    options: ["Yes", "No"],
  },
  Work_Interest: {
    question: "Are you interested in your current work or daily activities?",
    options: ["Yes", "No", "Maybe"],
  },
  Social_Weakness: {
    question: "Do you face challenges in social situations?",
    options: ["Yes", "No", "Maybe"],
  },
  mental_health_interview: {
    question: "Have you ever participated in a mental health assessment?",
    options: ["Yes", "No", "Maybe"],
  },
  care_options: {
    question: "Are you aware of available mental health care options?",
    options: ["Yes", "Not sure", "No"],
  },
};

// Mood Messages: 0 = low risk, 1 = moderate risk, 2 = high risk (consult a therapist)
const moodMessages = {
  0: "Your assessment suggests a low risk of mental health issues. Keep up with your self-care and healthy habits!",
  1: "Your assessment indicates a moderate level of concern. It might be helpful to seek additional support or self-care strategies.",
  2: "Your assessment indicates a high risk of mental health disorder. We strongly recommend consulting a therapist as soon as possible.",
};

function SurveyForm({ onSubmit, surveyData, setSurveyData }) {
  const handleChange = (feature, value) => {
    setSurveyData((prev) => ({ ...prev, [feature]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(surveyData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {Object.entries(surveyQuestions).map(([feature, { question, options }]) => (
        <FormControl fullWidth margin="normal" key={feature}>
          <InputLabel>{question}</InputLabel>
          <Select
            value={surveyData[feature] || ''}
            onChange={(e) => handleChange(feature, e.target.value)}
            required
          >
            {options.map((option, index) => (
              <MenuItem value={option} key={index}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
      <Box textAlign="center" mt={3}>
        <Button variant="contained" color="primary" type="submit">
          Submit Survey
        </Button>
      </Box>
    </Box>
  );
}

function ChatInterface({ onRetakeSurvey }) {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: chatInput }]);
    const userMsg = chatInput;
    setChatInput('');
    try {
      const response = await fetch('http://localhost:5001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error: Could not get a response.' },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <Box>
      <ChatContainer elevation={3}>
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index}>
              <ListItemText primary={msg.role === 'user' ? 'You' : 'Therapist'} secondary={msg.content} />
            </ListItem>
          ))}
        </List>
      </ChatContainer>
      <Box mt={2} display="flex">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button variant="contained" color="primary" onClick={sendMessage} sx={{ ml: 2 }}>
          Send
        </Button>
      </Box>
      <Box textAlign="center" mt={3}>
        <Button variant="outlined" color="secondary" onClick={onRetakeSurvey}>
          Retake Survey
        </Button>
      </Box>
    </Box>
  );
}

function App() {
  // currentView: 'home' | 'survey' | 'results' | 'chat'
  const [currentView, setCurrentView] = useState('home');
  const [surveyData, setSurveyData] = useState({});
  const [moodPrediction, setMoodPrediction] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  const handleSurveySubmit = async (data) => {
    try {
      const response = await fetch('http://localhost:5001/predict_mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setMoodPrediction(result.predicted_mood_class);
      setCurrentView('results');
    } catch (error) {
      console.error("Error predicting mood:", error);
    }
  };

  const handleRetakeSurvey = () => {
    setSurveyData({});
    setMoodPrediction(null);
    setChatMessages([]);
    setCurrentView('survey');
  };

  const goHome = () => setCurrentView('home');
  const goSurvey = () => setCurrentView('survey');
  const goChat = () => setCurrentView('chat');

  const renderHome = () => (
    <TwoCardContainer container spacing={4} justifyContent="center">
      <Grid item xs={12} md={5}>
        <OptionCard>
          <CardActionArea onClick={goSurvey}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Take Survey
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Mental health assessment (optional)
              </Typography>
            </CardContent>
          </CardActionArea>
        </OptionCard>
      </Grid>
      <Grid item xs={12} md={5}>
        <OptionCard>
          <CardActionArea onClick={goChat}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Personal Assistance
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Chat with a therapist assistant
              </Typography>
            </CardContent>
          </CardActionArea>
        </OptionCard>
      </Grid>
    </TwoCardContainer>
  );

  const renderSurvey = () => (
    <SectionPaper>
      <Typography variant="h5" align="center" gutterBottom>
        Mental Health Survey
      </Typography>
      <SurveyForm onSubmit={handleSurveySubmit} surveyData={surveyData} setSurveyData={setSurveyData} />
    </SectionPaper>
  );

  const renderResults = () => (
    <SectionPaper>
      <Typography variant="h5" align="center">
        Your Mental Health Assessment:
      </Typography>
      {moodPrediction !== null && (
        <Typography
          variant="h6"
          align="center"
          sx={{ mt: 2, color: moodPrediction === 2 ? 'error.main' : 'text.primary' }}
        >
          {moodMessages[moodPrediction]}
        </Typography>
      )}
      <Box textAlign="center" mt={3}>
        <Button variant="contained" color="primary" onClick={goChat} sx={{ mr: 2 }}>
          Proceed to Chat
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleRetakeSurvey}>
          Retake Survey
        </Button>
      </Box>
    </SectionPaper>
  );

  const renderChat = () => (
    <SectionPaper>
      <Typography variant="h5" align="center" gutterBottom>
        Chat with Our Therapist Assistant
      </Typography>
      <ChatInterface onRetakeSurvey={handleRetakeSurvey} />
    </SectionPaper>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <AppBar position="static" sx={{ mb: 3 }}>
          <Toolbar>
            <Typography variant="h6" component="div">
              Mental Health Assessment & Chatbot
            </Typography>
          </Toolbar>
        </AppBar>
        {currentView === 'home' && renderHome()}
        {currentView === 'survey' && renderSurvey()}
        {currentView === 'results' && renderResults()}
        {currentView === 'chat' && renderChat()}
      </Container>
    </ThemeProvider>
  );
}

export default App;
