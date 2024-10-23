from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import asyncio
from api import query
import os

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/submit_diary', methods=['POST'])
def submit_diary():
    data = request.json
    diary_entry = data['diaryEntry']
    
    feedback_system_prompt = """
    You are a warm and insightful psychological counselor. Your client has shared a personal diary entry with you and is seeking your guidance. Engage in a caring, conversational dialogue that:

    - Acknowledges and validates your client's feelings
    - Gently explores the key themes or events mentioned
    - Offers thoughtful reflections to encourage self-awareness
    - Suggests subtle, supportive strategies for growth or coping

    Respond as if you're speaking directly to your client in a safe, comfortable setting. Be empathetic and kind, while skillfully guiding the conversation towards positive change. Your goal is to help your client feel heard, understood, and gently supported in their journey of self-discovery and personal growth. Do not make it too lengthy, and do not end with a question. Respond in the same language as the diary entry.
    """
    
    sentiment_system_prompt = """
    You are tasked with doing sentiment analysis for the given text. Output only a number with a range of -5 to +5. 
    -5 is the most negative sentiment, +5 is the most positive sentiment, and 0 is neutral. 
    Only output this number.
    """
    
    subjectivity_system_prompt = """
    You are tasked with analyzing the subjectivity of the given text. Output only a number with a range of -5 to +5.
    -5 represents extremely objective language (facts, no personal opinions),
    +5 represents extremely subjective language (personal opinions, emotions, judgments),
    and 0 represents a balance between objective and subjective elements.
    Only output this number.
    """
    
    emotions_system_prompt = """
    You are tasked with detecting emotions in the given text. List the emotions you detect, separating them with commas.
    Output only the detected emotions, with the first letter of each emotion capitalized (e.g., "Joy, Sadness, Anger").
    If no clear emotions are detected, output "Neutral".
    Limit your response to at most 5 emotions. Respond in the same language as the text.
    """
    
    # Run the async query functions in a synchronous context
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    feedback_response = loop.run_until_complete(query("gpt-4o-mini", feedback_system_prompt, "Diary entry: "+ diary_entry + "\n\nRespond in the same language as the diary entry, either English or Korean"))
    sentiment_response = loop.run_until_complete(query("gpt-4o-mini", sentiment_system_prompt, diary_entry))
    subjectivity_response = loop.run_until_complete(query("gpt-4o-mini", subjectivity_system_prompt, diary_entry))
    emotions_response = loop.run_until_complete(query("gpt-4o-mini", emotions_system_prompt, diary_entry))
    
    try:
        sentiment_score = float(sentiment_response.strip())
    except ValueError:
        sentiment_score = 0  # Default to neutral if parsing fails
    
    try:
        subjectivity_score = float(subjectivity_response.strip())
    except ValueError:
        subjectivity_score = 0  # Default to neutral if parsing fails
    
    emotions = emotions_response.strip().split(', ')
    
    return jsonify({
        "feedback": feedback_response,
        "sentiment": sentiment_score,
        "subjectivity": subjectivity_score,
        "emotions": emotions
    })

if __name__ == '__main__':
    app.run(debug=True)