# Mental Health Diary Analyzer

## Overview

The Mental Health Diary Analyzer is an innovative application that uses AI to analyze personal diary entries, providing emotional feedback and insights. This tool aims to support users in understanding their emotional states and thought patterns, potentially contributing to better mental health awareness.

## Features

- User-friendly web interface for diary entry
- Multi-LLM (Large Language Model) analysis system:
  - Content analysis
  - Emotion detection
  - Sentiment analysis
- Comprehensive feedback generation
- Visual representation of emotional analysis
- Responsive and intuitive user interface

## Technology Stack

- Frontend: React.js
- Backend: Flask (Python)
- AI/ML: OpenAI GPT models
- Data Visualization: recharts
- Markdown Rendering: react-markdown

## Project Structure

```
mental-health-diary-analyzer/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/
│   ├── app.py
│   ├── api.py
│   └── ...
├── package.json
└── README.md
```

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/mental-health-diary-analyzer.git
   cd mental-health-diary-analyzer
   ```

2. Set up the backend:
   ```
   cd backend
   pip install flask flask-cors
   ```

3. Set up the frontend:
   ```
   cd ../frontend
   npm install
   ```

4. Configure API keys:
   - Create a `.env` file in the backend directory
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```

## Building and Running the Application

1. Build the frontend:
   ```
   cd frontend
   npm run build
   ```

2. Run the Flask application:
   ```
   cd ../backend
   python app.py
   ```

3. Open your browser and navigate to `http://127.0.0.1:5000`

The application should now be running with full functionality.

## Usage

1. On the main page, you'll see a text area where you can write your diary entry.
2. After writing your entry, click the "Submit Entry" button.
3. The system will process your entry and provide:
   - A sentiment analysis graph
   - A subjectivity analysis graph
   - Detected emotions
   - Detailed feedback from an AI counselor persona

## Disclaimer

This system is not a substitute for professional mental health support. If you're experiencing severe emotional distress or mental health issues, please seek help from a qualified mental health professional.