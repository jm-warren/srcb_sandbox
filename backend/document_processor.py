from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.vectorstores import Chroma
import os
from dotenv import load_dotenv
import argparse

load_dotenv()

class DocumentProcessor:
    def __init__(self, source_dir="../data/source_files", db_dir="../data/vector_db"):
        self.source_dir = source_dir
        self.db_dir = db_dir
        # Updated embeddings initialization
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",  # Changed from model_name to model
            google_api_key=os.getenv("GOOGLE_API_KEY")  # Changed from GEMINI_API_KEY
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        
    def process_pdfs(self):
        """Process all PDFs in the source directory and store them in the vector database."""
        documents = []
        
        # Load all PDFs from the source directory
        pdf_files = [f for f in os.listdir(self.source_dir) if f.endswith(".pdf")]
        if not pdf_files:
            print(f"No PDF files found in {self.source_dir}")
            return None
            
        print(f"Found {len(pdf_files)} PDF files to process...")
        
        for filename in pdf_files:
            file_path = os.path.join(self.source_dir, filename)
            print(f"Processing {filename}...")
            loader = PyPDFLoader(file_path)
            documents.extend(loader.load())
        
        print("Splitting documents into chunks...")
        # Split documents into chunks
        texts = self.text_splitter.split_documents(documents)
        
        print("Creating vector store...")
        # Create or load the vector store
        db = Chroma.from_documents(
            documents=texts,
            embedding=self.embeddings,
            persist_directory=self.db_dir
        )
        db.persist()
        print(f"Successfully processed {len(pdf_files)} files and created {len(texts)} chunks")
        return db
    
    def query_similar(self, query: str, k: int = 3):
        """Query the vector store for similar chunks of text."""
        db = Chroma(
            persist_directory=self.db_dir,
            embedding_function=self.embeddings
        )
        results = db.similarity_search(query, k=k)
        return results

def main():
    parser = argparse.ArgumentParser(description='Process PDF documents for RAG system')
    parser.add_argument('--source-dir', type=str, default='../data/source_files',
                      help='Directory containing PDF files (default: ../data/source_files)')
    parser.add_argument('--db-dir', type=str, default='../data/vector_db',
                      help='Directory to store vector database (default: ../data/vector_db)')
    parser.add_argument('--test-query', type=str,
                      help='Optional test query to try after processing')
    
    args = parser.parse_args()
    
    processor = DocumentProcessor(source_dir=args.source_dir, db_dir=args.db_dir)
    
    print("Starting document processing...")
    processor.process_pdfs()
    
    if args.test_query:
        print(f"\nTesting with query: {args.test_query}")
        results = processor.query_similar(args.test_query)
        print("\nTop relevant chunks:")
        for i, doc in enumerate(results, 1):
            print(f"\n--- Chunk {i} ---")
            print(doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content)

if __name__ == "__main__":
    main() 