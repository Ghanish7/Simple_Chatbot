# Simple AI Chatbot using Python and NLTK

An elegant, student-grade full-stack mini-project demonstrating pattern matching, tokenization, and text preprocessing using Python **Flask** and the **Natural Language Toolkit (NLTK)**. Made with an attractive, premium SaaS-style Bootstrap 5 web portal.

## 🌟 Key Features
- **NLTK Processing Pipeline**: Converts raw user requests to lower-case, cleanses all punctuation marks, splits substrings using NLTK tokens, and matches predefined trigger dictionaries.
- **Flask Server Engine**: Built-in routing handlers mapped to '/chat', '/history', and '/clear' active endpoints.
- **SaaS Portal Layout**: Single-view desktop environments featuring responsive menus, animated interactive robot canvas floats, slide-in responsive mobile drawers.
- **Analytics Canvas**: Real-time stats panels tracking total messaging volume, query-to-bot replies ratio, and interactive trigger graphs powered by Chart.js.
- **Utilities Integration**: Support for downloading dialog buffers as standard '.txt' layouts, clear chat indicators, and quick-fill triggers.

---

## 🛠️ Folder Structure
~~~text
project/
│
├── app.py              # Main Flask server entry configuration
├── chatbot.py          # Corporate NLTK dataset matching classes
├── intents.json        # Predefined dictionary matches
├── requirements.txt    # NPM & pip modules dependencies
│
├── static/
│   ├── css/
│   │   └── style.css   # Clean custom tailwind integrations style-sheets
│   ├── js/
│   │   └── script.js   # Dynamic micro-controller client script
│   └── images/
│
├── templates/
│   ├── index.html      # Landing hero page view
│   ├── chat.html       # Full-scale conversational window
│   └── dashboard.html  # Live dynamic charts metrics view
│
└── README.md           # Documentation guide page
~~~

---

## 🚀 Execution Guide
To run the college Python code locally on your environment:

### 1. Prerequisite Installations
Ensure that you have Python 3.9+ installed.

### 2. Prepare Virtual Environments
~~~bash
# Create environment
python -m venv venv

# Activate on Windows:
venv\Scripts\activate

# Activate on macOS/Linux:
source venv/bin/activate
~~~

### 3. Install Package Dependencies
~~~bash
pip install -r requirements.txt
~~~

### 4. Fetch NLTK Tokenization Datasets
Normally, downloading is triggered automatically in 'chatbot.py', but you can fetch it manually:
~~~python
import nltk
nltk.download('punkt')
~~~

### 5. Launch web application server
~~~bash
python app.py
~~~
The application starts instantly on: **http://127.0.0.1:5000/**

Open the browser tab and interact live with NLTK rule mappings!
