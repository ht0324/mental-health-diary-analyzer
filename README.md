# Mental Health Diary Analyzer

## Overview

The Mental Health Diary Analyzer is an innovative application that uses AI to analyze personal diary entries, providing emotional feedback and insights. This tool aims to support users in understanding their emotional states and thought patterns, potentially contributing to better mental health awareness. The application also features a real-time virtual counseling system that enables **voice-based interactions** with an AI counselor by using OpenAI Realtime API.

## Demo


https://github.com/user-attachments/assets/adda6342-3558-4350-aa9d-2efac0e84a98


While no sound is recorded in this demo, voice interaction using OpenAI Realtime API is implemented and functions as expected.

## Features

- User-friendly web interface for diary entry
- Multi-LLM (Large Language Model) analysis system:
  - Content analysis
  - Emotion detection
  - Sentiment analysis
- Comprehensive feedback generation
- Visual representation of emotional analysis
- Responsive and intuitive user interface
- Real-time Virtual Counseling:
  - Voice-based interaction with AI counselor
  - Real-time audio streaming
  - Context-aware responses based on diary analysis
  - Interactive conversation history

## Technology Stack

- Frontend: React.js
- Backend: Flask (Python)
- AI/ML: OpenAI GPT models
- Real-time Communication: OpenAI Realtime API
- Audio Processing: WavRecorder, WavStreamPlayer
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
│   │   ├── wavtools/
│   │   │   ├── WavRecorder.js
│   │   │   └── WavStreamPlayer.js
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
   npm install @openai/realtime-api-beta react-markdown
   ```

4. Configure API keys:
   - Create a `.env` file in the backend directory
   - Add your API keys:
     ```
     OPENAI_API_KEY=your_api_key_here
     OPENAI_REALTIME_API_KEY=your_realtime_api_key_here
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

1. Enter your name when prompted.
2. Write your diary entry in the text area and click the "Submit Entry" button.
3. The system will process your entry and provide:
   - A sentiment analysis graph
   - A subjectivity analysis graph
   - Detected emotions
   - Detailed feedback from an AI counselor persona

4. To use the Virtual Counselor:
   - Click the "Connect" button to start a counseling session
   - Hold the "Hold to Speak" button while speaking
   - Release the button to send your message
   - The AI counselor will respond with voice and text
   - View the conversation history in the chat log
   - Click "Disconnect" to end the session

## Virtual Counselor Features

- Real-time voice interaction
- Context-aware responses based on diary analysis
- Conversation history tracking
- Voice output with configurable AI voice
- Automatic speech-to-text transcription
- Seamless audio streaming

## Disclaimer

This system is not a substitute for professional mental health support. The virtual counselor is an AI-powered tool designed to provide basic emotional support and guidance. If you're experiencing severe emotional distress or mental health issues, please seek help from a qualified mental health professional.
