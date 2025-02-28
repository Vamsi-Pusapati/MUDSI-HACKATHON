import os
import json
import time
import pickle
import numpy as np
import pandas as pd
import logging
from numpy.linalg import norm
from flask import Flask, request, jsonify, session, render_template
import openai
from tensorflow.keras.models import load_model
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from flask_cors import CORS
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
# Use a secure secret key for session management in production
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'supersecretkey')

# -------------------------
# OpenAI API Configuration
# -------------------------
openai.api_key = os.getenv("OPENAI_API_KEY")


# -------------------------
# Load LSTM Model and Artifacts for Mood Prediction
# -------------------------
lstm_model = load_model('lstm_model.h5')
logger.info("LSTM model loaded.")

with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)
logger.info("Scaler loaded.")

with open('label_encoders.pkl', 'rb') as f:
    label_encoders = pickle.load(f)
logger.info("Label encoders loaded.")

# Define survey questions and options (for mood prediction)
questions_options = {
    "Gender": ["Female", "Male"],
    "self_employed": ["No", "Yes"],
    "family_history": ["No", "Yes"],
    "treatment": ["No", "Yes"],
    "Days_Indoors": ["Go out Every day", "1-14 days", "15-30 days", "31-60 days", "More than 2 months"],
    "Growing_Stress": ["Maybe", "No", "Yes"],
    "Changes_Habits": ["Maybe", "No", "Yes"],
    "Mental_Health_History": ["Maybe", "No", "Yes"],
    "Coping_Struggles": ["No", "Yes"],
    "Work_Interest": ["Maybe", "No", "Yes"],
    "Social_Weakness": ["Maybe", "No", "Yes"],
    "mental_health_interview": ["Maybe", "No", "Yes"],
    "care_options": ["No", "Not sure", "Yes"]
}

# -------------------------
# Endpoint: /predict_mood for Mood Prediction
# -------------------------
@app.route("/predict_mood", methods=["POST"])
def predict_mood():
    user_data = request.json  # Expect JSON payload with keys as in questions_options
    if not user_data:
        return jsonify({"error": "No input data provided"}), 400
    try:
        df_input = pd.DataFrame([user_data])
        # Encode features using the saved label encoders
        for feature in questions_options.keys():
            if feature in label_encoders:
                le = label_encoders[feature]
                df_input[feature] = le.transform(df_input[feature])
            else:
                df_input[feature] = pd.to_numeric(df_input[feature], errors='coerce')
        features_order = list(questions_options.keys())
        X_input = df_input[features_order].values
        # Scale and reshape for LSTM input
        X_input_scaled = scaler.transform(X_input)
        num_features = X_input_scaled.shape[1]
        X_input_seq = X_input_scaled.reshape(-1, num_features, 1)
        prediction_probabilities = lstm_model.predict(X_input_seq)
        predicted_class = np.argmax(prediction_probabilities, axis=1)
        return jsonify({"predicted_mood_class": int(predicted_class[0])})
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        return jsonify({"error": str(e)}), 500

# -------------------------
# Chatbot Knowledge Base for GPT-4 Chat (using embeddings)
# -------------------------
# Load and preprocess dataset for chat from CSV (counselchat-data.csv) and JSON.
CSV_FILE = "counselchat-data.csv"
df_csv_chat = pd.read_csv(CSV_FILE)
df_csv_chat['questionTitle'] = df_csv_chat['questionTitle'].fillna('')
df_csv_chat['questionText'] = df_csv_chat['questionText'].fillna('')
df_csv_chat['full_question'] = df_csv_chat['questionTitle'] + " " + df_csv_chat['questionText']
csv_qa_pairs = list(zip(df_csv_chat['full_question'], df_csv_chat['answerText']))

JSON_FILE = "counsel_chat_250-tokens_full.json"
json_qa_pairs = []
try:
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        data_json = json.load(f)
    for item in data_json.get("train", []):
        for utterance in item.get("utterances", []):
            question = utterance.get("history", [""])[0]
            candidates = utterance.get("candidates", [])
            answer = candidates[0] if candidates else ""
            if question and answer:
                json_qa_pairs.append((question, answer))
except Exception as e:
    logger.error(f"Error loading chat JSON file: {e}")

combined_qa_pairs = csv_qa_pairs + json_qa_pairs
df_combined = pd.DataFrame(combined_qa_pairs, columns=["full_question", "answerText"])

# -------------------------
# Embedding Utility and Caching
# -------------------------
def get_embedding(text, model="text-embedding-ada-002"):
    response = openai.Embedding.create(input=[text], model=model)
    return np.array(response["data"][0]["embedding"])

def compute_question_embeddings():
    EMBEDDING_FILE = "question_embeddings.npy"
    if os.path.exists(EMBEDDING_FILE):
        logger.info("Embeddings file found. Loading embeddings from file.")
        return np.load(EMBEDDING_FILE)
    else:
        logger.info("Embeddings file not found. Computing embeddings for all questions.")
        embeddings = []
        total = len(df_combined['full_question'])
        for idx, question in enumerate(df_combined['full_question']):
            logger.info(f"Computing embedding for question {idx+1}/{total}")
            emb = get_embedding(question)
            embeddings.append(emb)
            time.sleep(0.5)
        embeddings = np.array(embeddings)
        np.save(EMBEDDING_FILE, embeddings)
        logger.info("Embeddings computed and saved to file.")
        return embeddings

question_embeddings = compute_question_embeddings()

def cosine_similarity(a, b):
    return np.dot(a, b) / (norm(a) * norm(b))

def find_relevant_answers_embedding(user_query, top_n=3):
    query_embedding = get_embedding(user_query)
    similarities = [cosine_similarity(query_embedding, emb) for emb in question_embeddings]
    similarities = np.array(similarities)
    top_idx = similarities.argsort()[-top_n:][::-1]
    relevant_pairs = []
    for idx in top_idx:
        q = df_combined.at[idx, 'full_question']
        a = df_combined.at[idx, 'answerText']
        relevant_pairs.append((q, a))
    return relevant_pairs

def generate_response(user_query):
    relevant_pairs = find_relevant_answers_embedding(user_query)
    knowledge_text = ""
    for q, a in relevant_pairs:
        knowledge_text += f"Q: {q}\nA: {a}\n\n"
    
    system_prompt = (
        "You are a compassionate mental health therapist assistant. "
        "Answer the user's question using only the following therapist Q&A references. "
        "Do not add any extra advice beyond what is provided. "
        "If the answer is not present in the provided data, say you do not know.\n\n"
        "Therapist Q&A references:\n" + knowledge_text
    )
    
    messages = [{"role": "system", "content": system_prompt}]
    if 'history' in session:
        messages.extend(session['history'])
    messages.append({"role": "user", "content": user_query})
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=messages,
        temperature=0.7
    )
    assistant_reply = response['choices'][0]['message']['content']
    return assistant_reply

# -------------------------
# Chat Endpoint for GPT-4 Chat
# -------------------------
@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"response": "Please enter a message."}), 400
    if 'history' not in session:
        session['history'] = []
    session['history'].append({"role": "user", "content": user_message})
    assistant_reply = generate_response(user_message)
    session['history'].append({"role": "assistant", "content": assistant_reply})
    return jsonify({"response": assistant_reply})

@app.route("/reset", methods=["POST"])
def reset_conversation():
    session.pop('history', None)
    return jsonify({"message": "Conversation reset."})

# -------------------------
# Optional: Provide Survey Questions to Frontend
# -------------------------
@app.route("/survey", methods=["GET"])
def get_survey_questions():
    return jsonify(questions_options)

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)