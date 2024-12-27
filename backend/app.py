from flask import Flask, request, jsonify, Response
import google.generativeai as genai
import os
from dotenv import load_dotenv
from flask_cors import CORS
import json
from document_processor import DocumentProcessor

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Gemini with API key
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

# Initialize the model and document processor
model = genai.GenerativeModel('gemini-pro')
doc_processor = DocumentProcessor(
    source_dir="../data/source_files",
    db_dir="../data/vector_db"
)

@app.route('/process-docs', methods=['POST'])
def process_documents():
    """Endpoint to process/reprocess all documents"""
    try:
        doc_processor.process_pdfs()
        return jsonify({'message': 'Documents processed successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#API route for chat
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        print(f"User message: {user_message}")
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Get relevant document chunks
        relevant_docs = doc_processor.query_similar(user_message)
        context = "\n\n".join([doc.page_content for doc in relevant_docs])
        
        def generate():
            # Generate streaming response using Gemini
            prompt = f"""Please provide a response using the following context and format it using markdown syntax where appropriate. If the context doesn't help answer the question, just respond based on your general knowledge.

Context:
{context}

User Question:
{user_message}"""

            response = model.generate_content(prompt, stream=True)
            
            for chunk in response:
                if chunk.text:
                    # Format the data as SSE
                    data = json.dumps({'chunk': chunk.text})
                    yield f"data: {data}\n\n"
            
            # Send a completion message
            yield "data: [DONE]\n\n"

        return Response(generate(), mimetype='text/event-stream')
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)