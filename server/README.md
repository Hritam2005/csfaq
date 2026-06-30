# AI Knowledge Hub - Backend Foundation

This is the production-ready backend foundation for the AI Knowledge Hub platform.

## 🚀 Features
- **Express.js** REST API with ES Modules
- **MongoDB** integration via Mongoose
- **Security:** Helmet, CORS, Rate Limiting, XSS clean, Mongo Sanitize
- **Validation:** Joi (Environment), Express-Validator (Requests)
- **Logging:** Winston Daily Rotate File (Application, Error, Access, Security)
- **Documentation:** Auto-generated Swagger UI (`/api-docs`)
- **Docker:** Multi-stage Dockerfile and docker-compose.yml

## 📂 Folder Structure
```text
server/
├── Dockerfile
├── docker-compose.yml
├── server.js              # Bootstrap & Graceful Shutdown
├── src/
│   ├── app.js             # Express & Middlewares
│   ├── config/            # DB, Env, Logger, Swagger configs
│   ├── controllers/       # Route handlers
│   ├── middlewares/       # Error handler, Rate limiters
│   ├── routes/            # Express Routers
│   └── utils/             # ApiError, ApiResponse, asyncHandler
└── tests/                 # Jest & Supertest Integration Tests
```

## ⚙️ Installation

1. Clone the repository and navigate to the `server` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
4. Fill in the `.env` file (Ensure `MONGO_URI` is valid).

## 🏃‍♂️ Running the Server

**Development Mode (Nodemon):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

## 🐳 Docker Deployment

To spin up the API and Redis via Docker Compose:
```bash
docker-compose up -d --build
```

## 🧪 Testing

Run the test suite using Jest and Supertest:
```bash
npm test
```

## 📖 API Documentation

Once the server is running, view the Swagger UI at:
[http://localhost:5000/api-docs](http://localhost:5000/api-docs)
