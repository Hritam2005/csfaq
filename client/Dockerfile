# Use Node image
FROM node:22-alpine

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the project (if applicable) and expose Vite's default port
EXPOSE 3000
EXPOSE 5173

# Start the development server (adjust to "npm run build && npm run preview" for production)
CMD ["npm", "run", "dev", "--", "--host"]
