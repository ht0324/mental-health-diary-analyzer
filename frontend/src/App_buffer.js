import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { WavRecorder, WavStreamPlayer } from './wavtools/';
import './App.css';

function App() {
  const [diaryEntry, setDiaryEntry] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [subjectivity, setSubjectivity] = useState(null);
  const [emotions, setEmotions] = useState([]);

  // Realtime API
  const clientRef = useRef(null);
  const wavRecorderRef = useRef(null);
  const wavStreamPlayerRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [audioBuffer, setAudioBuffer] = useState([]);

  useEffect(() => {
    const newClient = new RealtimeClient({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowAPIKeyInBrowser: true,
    });

    newClient.updateSession({ 
      instructions: 'You are helpful mental health counselor. Be empathetic and supportive to the user.',
      voice: 'alloy',
      turn_detection: { type: 'none' },
      input_audio_transcription: { model: 'whisper-1' },
    });

    newClient.on('conversation.updated', handleConversationUpdate);

    clientRef.current = newClient;
    wavRecorderRef.current = new WavRecorder({ sampleRate: 24000 });
    wavStreamPlayerRef.current = new WavStreamPlayer({ sampleRate: 24000 });

    return () => {
      if (newClient.isConnected()) {
        newClient.disconnect();
      }
    };
  }, []);

  const handleConversationUpdate = useCallback(({ item, delta }) => {
    setConversation(prev => {
      const existingItemIndex = prev.findIndex(i => i.id === item.id);
      if (existingItemIndex !== -1) {
        // Update existing item
        const newConversation = [...prev];
        newConversation[existingItemIndex] = {
          ...newConversation[existingItemIndex],
          ...item,
          formatted: {
            ...newConversation[existingItemIndex].formatted,
            ...item.formatted
          }
        };
        return newConversation;
      } else {
        // Add new item
        return [...prev, item];
      }
    });

    if (delta?.audio) {
      wavStreamPlayerRef.current.add16BitPCM(delta.audio, item.id);
    }
  }, []);


  const connect = useCallback(async () => {
    if (clientRef.current && !clientRef.current.isConnected()) {
      await clientRef.current.connect();
      await wavRecorderRef.current.begin();
      await wavStreamPlayerRef.current.connect();
      setIsConnected(true);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      await clientRef.current.disconnect();
      await wavRecorderRef.current.end();
      await wavStreamPlayerRef.current.interrupt();
      setIsConnected(false);
      setConversation([]);
      setAudioBuffer([]);
    }
  }, []);

  const startRecording = useCallback(async () => {
    setIsRecording(true);
    setAudioBuffer([]);
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.record((data) => {
      setAudioBuffer(prev => [...prev, data.mono]);
    });
  }, []);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
    
    // Combine all audio buffers and send them at once
    const combinedBuffer = new Int16Array(audioBuffer.reduce((acc, curr) => [...acc, ...curr], []));
    client.appendInputAudio(combinedBuffer);
    client.createResponse();
    setAudioBuffer([]);
  }, [audioBuffer]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/submit_diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diaryEntry }),
      });
      const data = await response.json();
      setFeedback(data.feedback);
      setSentiment(data.sentiment);
      setSubjectivity(data.subjectivity);
      setEmotions(data.emotions);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedback('Failed to get feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const renderAnalysisGraph = (value, title) => (
    <div className="analysis-graph">
      <h3>{title}:</h3>
      <div className="graph-container">
        <div className="graph-bar" style={{width: `${((value + 5) / 10) * 100}%`}}></div>
      </div>
      <div className="graph-labels">
        <span>{title === 'Sentiment Analysis' ? 'Negative' : 'Objective'}</span>
        <span>Neutral</span>
        <span>{title === 'Sentiment Analysis' ? 'Positive' : 'Subjective'}</span>
      </div>
      <p>Score: <strong>{value.toFixed(2)}</strong></p>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>Good day user, how was your day?</h1>
        <p className="date">{today}</p>
        <textarea
          value={diaryEntry}
          onChange={(e) => setDiaryEntry(e.target.value)}
          placeholder="Write your diary entry here..."
          rows="10"
          cols="50"
        />
        <button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            'Submit Entry'
          )}
        </button>
        
        {feedback && (
          <>
            {sentiment !== null && renderAnalysisGraph(sentiment, 'Sentiment Analysis')}
            {subjectivity !== null && renderAnalysisGraph(subjectivity, 'Subjectivity Analysis')}
            {emotions.length > 0 && (
              <div className="emotions">
                <h3>Detected Emotions:</h3>
                <p><strong>{emotions.join(', ')}</strong></p>
              </div>
            )}
            <div className="feedback">
              <h3>Feedback:</h3>
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
            
            <div className="conversation">
              <h3>Virtual Counselor</h3>
              <button onClick={isConnected ? disconnect : connect}>
                {isConnected ? 'Disconnect' : 'Connect'}
              </button>
              {isConnected && (
                <button onClick={toggleRecording}
                disabled={!isConnected}
                className={isRecording ? 'recording' : ''}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
              )}
              {isConnected && (
                <div className="conversation-log">
                  {conversation.map((item) => (
                    <p key={item.id}>{item.role}: {item.formatted.text || item.formatted.transcript}</p>
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;