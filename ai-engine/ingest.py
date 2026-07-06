import os
import json
import faiss
import numpy as np
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

PDF_PATH = "docs/KB.pdf"
INDEX_PATH = "faiss_index.bin"
CHUNKS_PATH = "chunks.json"
MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_SIZE = 300
OVERLAP = 30

def extract_text_from_pdf(pdf_path):
    print(f"Extracting text from {pdf_path}...")
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text

def chunk_text(text, chunk_size, overlap):
    print(f"Chunking text with size {chunk_size} and overlap {overlap}...")
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        if len(words) - i <= chunk_size:
            break
        i += chunk_size - overlap
    return chunks

def build_vector_db():
    if not os.path.exists(PDF_PATH):
        print(f"Error: {PDF_PATH} not found.")
        return

    text = extract_text_from_pdf(PDF_PATH)
    chunks = chunk_text(text, CHUNK_SIZE, OVERLAP)
    
    print(f"Total chunks created: {len(chunks)}")
    
    print(f"Loading embedding model: {MODEL_NAME}...")
    # Setting up the model to run optimally
    model = SentenceTransformer(MODEL_NAME)
    
    print("Generating embeddings...")
    embeddings = model.encode(chunks, show_progress_bar=True)
    embeddings = np.array(embeddings).astype("float32")
    
    dimension = embeddings.shape[1]
    
    print(f"Building FAISS index with dimension {dimension}...")
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    
    print(f"Saving FAISS index to {INDEX_PATH}...")
    faiss.write_index(index, INDEX_PATH)
    
    print(f"Saving chunks to {CHUNKS_PATH}...")
    with open(CHUNKS_PATH, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)
        
    print("Ingestion pipeline completed successfully.")

if __name__ == "__main__":
    build_vector_db()
