from flask import Flask, request, jsonify, Response, send_from_directory
import google.generativeai as genai
import os
from dotenv import load_dotenv
from flask_cors import CORS
import json
#from document_processor import DocumentProcessor
import PyPDF2

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for all routes

# Initialize Gemini with API key
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

# Initialize the model and document processor
model = genai.GenerativeModel('gemini-2.0-flash-exp')

#doc_processor = DocumentProcessor(
#    source_dir="../data/source_files",
#    db_dir="../data/vector_db"
#)

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

#@app.route('/process-docs', methods=['POST'])
#def process_documents():
#    """Endpoint to process/reprocess all documents"""
#    try:
#        overwrite = request.json.get('overwrite', False) if request.json else False
#        doc_processor.process_pdfs(overwrite=overwrite)
#        return jsonify({'message': 'Documents processed successfully'})
#    except Exception as e:
#        return jsonify({'error': str(e)}), 500

#API route for chat
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        #print(f"\nUser message: {user_message}")
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Get relevant document chunks
        #relevant_docs = doc_processor.query_similar(user_message)
        
        # Format context with citations
        #context_parts = []
        #citations = []  # Store citations for frontend
        #for i, doc in enumerate(relevant_docs, 1):
        #    context_parts.append(f"From {doc['source']}, Page {doc['page']}:\n{doc['content']}")
        #    citations.append({
        #        'id': i,
        #        'source': doc['source'],
        #        'page': doc['page'],
        #        'content': doc['content']
        #    })
        #context = "\n\n".join(context_parts)
        
        pdf_path = "../data/source_files/inspection_report.pdf"
        with open(pdf_path, 'rb') as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            context = "\n".join(page.extract_text() for page in pdf_reader.pages)
        
        # Print final context for debugging
        #print("\nFinal context being passed to model:")
        #print("=" * 80)
        #print(context)
        #print("=" * 80)
        
        def generate():
            # Generate streaming response using Gemini
            prompt = f"""You are a helpful assistant that provides information based on the given context.
                    You should use information from the context to answer the user's question.
                    Your responses should be clear, accurate, and well-structured using markdown syntax where appropriate.

                    Context:
                    {context}

                    User Question:
                    {user_message}
                    """

            response = model.generate_content(prompt, stream=True)
            
            # Send citations first
            #yield f"data: {json.dumps({'citations': citations})}\n\n"
            
            # Buffer to accumulate response and ensure proper formatting
            response_buffer = ""
            
            for chunk in response:
                if chunk.text:
                    response_buffer += chunk.text
                    # Format the data as SSE
                    data = json.dumps({'chunk': chunk.text})
                    yield f"data: {data}\n\n"
            
            # If response doesn't end with References section, add it
            #if 'References:' not in response_buffer:
            #    references = "\n\nReferences:\n"
            #    for citation in citations:
            #        references += f"[{citation['id']}] {citation['source']}, page {citation['page']}\n"
            #    data = json.dumps({'chunk': references})
            #    yield f"data: {data}\n\n"
            
            # Send a completion message
            yield "data: [DONE]\n\n"

        return Response(generate(), mimetype='text/event-stream')
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)