import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [diaryEntry, setDiaryEntry] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [subjectivity, setSubjectivity] = useState(null);
  const [emotions, setEmotions] = useState([]);

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
        {sentiment !== null && renderAnalysisGraph(sentiment, 'Sentiment Analysis')}
        {subjectivity !== null && renderAnalysisGraph(subjectivity, 'Subjectivity Analysis')}
        {emotions.length > 0 && (
          <div className="emotions">
            <h3>Detected Emotions:</h3>
            <p><strong>{emotions.join(', ')}</strong></p>
          </div>
        )}
        {feedback && (
          <div className="feedback">
            <h3>Feedback:</h3>
            <ReactMarkdown>{feedback}</ReactMarkdown>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;