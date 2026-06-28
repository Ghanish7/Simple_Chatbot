"""
Flask web server for the Simple Chatbot college project.
Handles standard browser routing, web requests, and session history tracker.
"""

from flask import Flask, render_template, request, jsonify, session
from chatbot import NLTKChatbot
import os
import uuid
from datetime import datetime

app = Flask(__name__)
# Generate a randomized secret key for sessions
app.secret_key = os.urandom(24)

# Instantiate the NLTK chatbot
chatbot = NLTKChatbot()

@app.before_request
def setup_session():
    """Ensure conversation state and counters are in place"""
    if 'history' not in session:
        session['history'] = []
    if 'stats' not in session:
        session['stats'] = {
            'total_messages': 0,
            'user_messages': 0,
            'bot_messages': 0,
            'most_asked': 'None yet',
            'questions_count': {}
        }

@app.route('/')
def home():
    """Renders the attractive SaaS-like Hero Landing Page"""
    return render_template('index.html')

@app.route('/chat')
def chat_panel():
    """Renders the modern, clean ChatGPT-style Chat Window"""
    return render_template('chat.html')

@app.route('/dashboard')
def metrics_dashboard():
    """Renders the Analytics and Metrics page"""
    return render_template('dashboard.html')

@app.route('/api/chat', methods=['POST'])
def handle_chat_message():
    """
    POST /chat Endpoint
    Receives user messages, matches NLTK intents, updates session history, and returns JSON.
    """
    data = request.get_json() or {}
    message_text = data.get('message', '').strip()

    if not message_text:
        return jsonify({"error": "Empty message"}), 400

    # Get response from NLTK chatbot
    bot_reply = chatbot.get_response(message_text)

    # Sync project counters
    stats = session.get('stats')
    stats['total_messages'] += 2
    stats['user_messages'] += 1
    stats['bot_messages'] += 1

    # Record the question for most asked logic
    normalized_msg = message_text.lower().strip()
    q_counts = stats.get('questions_count', {})
    q_counts[normalized_msg] = q_counts.get(normalized_msg, 0) + 1
    stats['questions_count'] = q_counts

    # Re-evaluate the most asked question
    highest_count = 0
    frequent_question = stats['most_asked']
    for q_text, count in q_counts.items():
        if count > highest_count:
            highest_count = count
            frequent_question = q_text
    stats['most_asked'] = frequent_question
    session['stats'] = stats

    # Timestamps
    current_time = datetime.now().strftime("%I:%M %p")
    
    # Message items with distinct IDs
    user_msg_object = {
        "id": "msg-u-" + str(uuid.uuid4())[:8],
        "sender": "user",
        "text": message_text,
        "timestamp": current_time
    }
    
    bot_msg_object = {
        "id": "msg-b-" + str(uuid.uuid4())[:8],
        "sender": "bot",
        "text": bot_reply,
        "timestamp": current_time
    }

    # Append to session history list
    history_list = session.get('history')
    history_list.append(user_msg_object)
    history_list.append(bot_msg_object)
    session['history'] = history_list

    return jsonify({
        "status": "success",
        "user_message": user_msg_object,
        "bot_message": bot_msg_object,
        "stats": {
            "totalMessages": stats['total_messages'],
            "userMessages": stats['user_messages'],
            "botMessages": stats['bot_messages'],
            "mostAsked": stats['most_asked']
        }
    })

@app.route('/api/history', methods=['GET'])
def fetch_conversation_history():
    """
    GET /history Endpoint
    Returns full history array and current stats as JSON.
    """
    return jsonify({
        "status": "success",
        "history": session.get('history', []),
        "stats": {
            "totalMessages": session.get('stats', {}).get('total_messages', 0),
            "userMessages": session.get('stats', {}).get('user_messages', 0),
            "botMessages": session.get('stats', {}).get('bot_messages', 0),
            "mostAsked": session.get('stats', {}).get('most_asked', 'None yet')
        }
    })

@app.route('/api/clear', methods=['DELETE'])
def clear_conversation():
    """
    DELETE /clear Endpoint
    Clears conversation history and stats.
    """
    session['history'] = []
    session['stats'] = {
        'total_messages': 0,
        'user_messages': 0,
        'bot_messages': 0,
        'most_asked': 'None yet',
        'questions_count': {}
    }
    return jsonify({
        "status": "success",
        "message": "Chat conversation cleared with success."
    })

if __name__ == '__main__':
    print("Starting Flask NLTK chatbot web service on http://127.0.0.1:5000 ...")
    app.run(host='127.0.0.1', port=5000, debug=True)
