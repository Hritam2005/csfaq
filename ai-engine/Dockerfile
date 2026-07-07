# Use official Python 3.11 slim image for a smaller footprint
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies (required for some ML libraries like FAISS)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies (without caching to save space)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Start the FastAPI server using the entry point in main.py
CMD ["python", "main.py"]
