import os
import json
import faiss
import numpy as np
import uvicorn
import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

# Setup Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key or api_key == "your_gemini_api_key_here":
    print("WARNING: Please set your GEMINI_API_KEY in ai-engine/.env")

genai.configure(api_key=api_key)
generation_config = {
  "temperature": 0.2,
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 2048,
}
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", 
    generation_config=generation_config
)

INDEX_PATH = "faiss_index.bin"
CHUNKS_PATH = "chunks.json"
MODEL_NAME = "all-MiniLM-L6-v2"

print(f"Loading embedding model: {MODEL_NAME}...")
embedder = SentenceTransformer(MODEL_NAME)

print("Loading FAISS index...")
if os.path.exists(INDEX_PATH) and os.path.exists(CHUNKS_PATH):
    index = faiss.read_index(INDEX_PATH)
    with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
        chunks = json.load(f)
else:
    print("Warning: FAISS index or chunks not found. Run ingest.py first.")
    index = None
    chunks = []

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    prompt: str
    history: List[Dict[str, str]] = []

@app.get("/")
def health_check():
    return {"status": "ok", "message": "AI Engine Running"}

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    if not request.prompt:
        return {"error": "Prompt is empty"}
        
    if index is None:
        return {"error": "Knowledge base not initialized"}
        
    print(f"DEBUG: Processing request using model: {model.model_name}")

    # 1. Embed query
    query_embedding = embedder.encode([request.prompt]).astype("float32")
    
    # 2. Search FAISS
    k = 3
    distances, indices = index.search(query_embedding, k)
    
    retrieved_context = []
    for idx in indices[0]:
        if idx != -1 and idx < len(chunks):
            retrieved_context.append(chunks[idx])
            
    context_str = "\n\n---\n\n".join(retrieved_context)
    
    system_prompt = f"""You are a helpful AI assistant named Yaksha. 
You must answer the user's question STRICTLY based on the following context.
If the answer cannot be found in the context, explicitly say: "Yaksha does not know the answer to that question, please ask relevant questions"
Do not use outside knowledge.

Context:
{context_str}
"""
    
    formatted_history = []
    for msg in request.history:
        # Ignore system messages from history for Gemini ChatSession
        if msg.get("role") == "system":
            continue
        role = "model" if msg["role"] == "assistant" else "user"
        formatted_history.append({"role": role, "parts": [msg["content"]]})
        
    def generate():
        try:
            chat = model.start_chat(history=formatted_history)
            full_prompt = system_prompt + "\n\nUser Question: " + request.prompt
            
            response = chat.send_message(full_prompt, stream=True)
            
            for chunk in response:
                if getattr(chunk, 'text', None):
                    yield chunk.text
        except Exception as e:
            print(f"Generation error: {e}")
            yield f"\n[Error generating response: {str(e)}]"
            
    return StreamingResponse(generate(), media_type="text/plain")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
