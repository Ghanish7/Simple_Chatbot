"""
Simple Chatbot using Python & NLTK (Natural Language Toolkit)
College Mini-Project Core Processor
"""

import json
import string
import os
import nltk
from nltk.tokenize import word_tokenize

# Secure downloading of the NLTK Punkt tokenizer
# Configure NLTK for Vercel
NLTK_DATA_DIR = "/tmp/nltk_data"
os.makedirs(NLTK_DATA_DIR, exist_ok=True)

nltk.data.path.insert(0, NLTK_DATA_DIR)

try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt", download_dir=NLTK_DATA_DIR, quiet=True)

class NLTKChatbot:
    def __init__(self, intents_path='intents.json'):
        self.intents = {}
        # Load pre-defined intents dataset
        if os.path.exists(intents_path):
            with open(intents_path, 'r', encoding='utf-8') as f:
                self.intents = json.load(f)
        else:
            # Fallback local dictionary if file is missing
            self.intents = {
                "hello": "Hello! How can I help you today?",
                "hi": "Hi there! Nice to meet you.",
                "how are you": "I am doing great. How about you?",
                "what is your name": "I am an AI Chatbot created using Python.",
                "bye": "Goodbye! Have a wonderful day.",
                "thank you": "You're welcome!",
                "help": "I can answer simple predefined questions."
            }

    def preprocess_text(self, text):
        """
        Requirements Checklist:
        1. Convert user text to lowercase
        2. Remove punctuation
        """
        text = text.lower()
        # Remove punctuation by mapping against string.punctuation
        text = text.translate(str.maketrans('', '', string.punctuation))
        return text

    def get_response(self, user_input):
        """
        Requirements Checklist:
        3. Use NLTK tokenization
        4. Match user input with predefined intents
        5. Return appropriate response
        """
        if not user_input or user_input.strip() == "":
            return "Please say something!"

        # Preprocess input line
        clean_input = self.preprocess_text(user_input)

        # NLTK Tokenization
        try:
            tokens = word_tokenize(clean_input)
        except Exception:
            # Tokenization fallback
            tokens = clean_input.split()

        # Join tokens back into a search phrase (normalized string)
        search_phrase = " ".join(tokens)

        # Match tokens against intents patterns
        for key, response in self.intents.items():
            clean_key = self.preprocess_text(key)
            # Match directly or check if keywords correspond
            if clean_key == search_phrase or clean_key in search_phrase or search_phrase in clean_key:
                return response

        # Requirement: Returns appropriate default text when no pattern matches
        return "Sorry, I don't understand that yet."
