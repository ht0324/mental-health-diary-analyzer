import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { WavRecorder, WavStreamPlayer } from './wavtools/';
import './App.css';

function App() {
  const [showNamePopup, setShowNamePopup] = useState(true);
  const [userName, setUserName] = useState('');
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
  const conversationEndRef = useRef(null);

  useEffect(() => {
    console.log('Initializing RealtimeClient for the first time');
    const newClient = new RealtimeClient({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowAPIKeyInBrowser: true,
    });

    newClient.on('conversation.updated', handleConversationUpdate);

    clientRef.current = newClient;
    wavRecorderRef.current = new WavRecorder({ sampleRate: 24000 });
    wavStreamPlayerRef.current = new WavStreamPlayer({ sampleRate: 24000 });


    console.log('Realtime API initialized');
    return () => {
      if (newClient.isConnected()) {
        newClient.disconnect();
        console.log('Disconnected from RealtimeClient');
      }
    };
  }, []);
// Separate effect for conversation scroll behavior
  useEffect(() => {
    if (!conversationEndRef.current) return;
    conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);


  const handleConversationUpdate = useCallback(({ item, delta }) => {
    console.log('Conversation updated:', item);
    // const client = clientRef.current;
    // const wavStreamPlayer = wavStreamPlayerRef.current;
    // const items = client.conversation.getItems();
    
    if (delta?.audio) {
      console.log('Received audio delta');
      wavStreamPlayerRef.current.add16BitPCM(delta.audio, item.id);
    }
    
    console.log('Updating conversation items');
    // do not append to conversation if 
    setConversation(clientRef.current.conversation.getItems());
  }, []);
  
  const formatContextForCounselor = (diaryEntry, feedback, sentiment, subjectivity, emotions) => {
    const sentimentText = sentiment ? `Their current emotional state appears ${sentiment > 0 ? 'positive' : sentiment < 0 ? 'negative' : 'neutral'} (sentiment score: ${sentiment.toFixed(2)}).` : '';
    const emotionsText = emotions.length > 0 ? `Detected emotions include: ${emotions.join(', ')}.` : '';
    
    return `You are helpful virtual mental health counselor.

    The user's name is ${userName}.

    Here's the ${userName}'s diary entry: "${diaryEntry}"
    Previous AI analysis: ${feedback}
    
    ${sentimentText}
    ${emotionsText} 
    
    Please acknowledge this context. First respond with a general greeting, then ask the user how they are feeling today. From now on, respond in less than 2 senteces.`;
  };



  const connect = useCallback(async () => {
    if (clientRef.current && !clientRef.current.isConnected()) {
      console.log('Connecting to RealtimeClient');
      await clientRef.current.connect();
      await wavRecorderRef.current.begin();
      await wavStreamPlayerRef.current.connect();

      // Send context message if diary entry exists
      if (diaryEntry.trim() && feedback.trim()) {
        const contextMessage = formatContextForCounselor(
          diaryEntry,
          feedback,
          sentiment,
          subjectivity,
          emotions
        );

        clientRef.current.updateSession({ 
        instructions: contextMessage,
        voice: 'alloy',
        // turn_detection: { type: 'none' },
        input_audio_transcription: { model: 'whisper-1' },
      });

      }

      setIsConnected(true);
      console.log('Connected successfully');
    }
  }, [diaryEntry, feedback, sentiment, emotions]);

  const disconnect = useCallback(async () => {
    if (clientRef.current && clientRef.current.isConnected()) {
      console.log('Disconnecting from RealtimeClient');
      await clientRef.current.disconnect();
      await wavRecorderRef.current.end();
      await wavStreamPlayerRef.current.interrupt();
      setIsConnected(false);
      setConversation([]);
      console.log('Disconnected successfully');
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    console.log('Starting recording');
    setIsRecording(true);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      console.log('Cancelling previous response');
      await client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    console.log('Appending input audio');
  }, [isRecording]);

  const stopRecording = useCallback(async () => {
    if (!isRecording) return;
    console.log('Stopping recording');
    setIsRecording(false);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
    console.log('Creating response');
    await client.createResponse();
  }, [isRecording]);


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
      console.log('Received feedback:', data);
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

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setShowNamePopup(false);
    }
  };

  const NamePopup = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Hi there!</h2>
          <p>What is your name?</p>
        </div>
        <form onSubmit={handleNameSubmit}>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="name-input"
            autoFocus
          />
          <button
            type="submit"
            className="modal-button"
            disabled={!userName.trim()}
          >
            Done
          </button>
        </form>
      </div>
    </div>
  );


    return (
      <div className="App">
        {showNamePopup && <NamePopup />}
        {!showNamePopup && (
          <header className="App-header">
            <h1>Good day {userName}, how was your day?</h1>
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
                    <button 
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      disabled={!isConnected}
                      className={isRecording ? 'recording' : ''}
                    >
                      {isRecording ? 'Release to Send' : 'Hold to Speak'}
                    </button>
                  )}
                  {isConnected && (
                    <div className="conversation-log">
                    {conversation.map((item, index) => (
                      <p key={index}>{item.role}: {item.formatted.text || item.formatted.transcript}</p>
                    ))}
                    {/* Add a dummy div at the bottom */}
                    <div ref={conversationEndRef} />
                  </div>
                  )}
                </div>
              </>
            )}
          </header>
        )}
      </div>
    );
  };
  
  export default App;