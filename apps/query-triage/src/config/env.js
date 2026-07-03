import Joi from 'joi';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, '../../.env') });
if (process.env.NODE_ENV === 'test') {
  const testEnvPath = path.join(__dirname, '../../.env.test');
  if (fs.existsSync(testEnvPath)) {
    dotenv.config({ path: testEnvPath, override: true });
  }
}

const isTest = process.env.NODE_ENV === 'test';

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(5001),
    MONGO_URI: isTest ? Joi.string().default('mongodb://localhost:27017/query_triage_test') : Joi.string().required().description('MongoDB Connection String'),
    JWT_SECRET: isTest ? Joi.string().default('test_jwt_secret') : Joi.string().required().description('JWT Secret Key'),
    JWT_REFRESH_SECRET: isTest ? Joi.string().default('test_refresh_secret') : Joi.string().required().description('JWT Refresh Secret Key'),
    CLIENT_URL: isTest ? Joi.string().default('http://localhost:3000') : Joi.string().required().description('Frontend Client URL'),
    LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly').default('info'),
    UPLOAD_LIMIT: Joi.string().default('50mb'),
    OPENAI_API_KEY: Joi.string().optional().allow(''),
    OPENAI_BASE_URL: Joi.string().default('http://127.0.0.1:8080/v1'),
    OPENAI_MODEL: Joi.string().default('qwen2.5-coder-1.5b'),
    
    // Capacity thresholds
    CAPACITY_WARNING_THRESHOLD: Joi.number().default(0.70),
    CAPACITY_CRITICAL_THRESHOLD: Joi.number().default(0.90),
    
    // WIP limits
    MAX_ACTIVE_CASES_PER_RESOLVER: Joi.number().default(10),
    
    // SLA Configuration (in hours, response in minutes for P0)
    SLA_P0_RESPONSE_MINUTES: Joi.number().default(15),
    SLA_P1_RESPONSE_HOURS: Joi.number().default(1),
    SLA_P2_RESPONSE_HOURS: Joi.number().default(8),
    SLA_P3_RESPONSE_HOURS: Joi.number().default(48),
    
    SLA_P0_RESOLUTION_HOURS: Joi.number().default(2),
    SLA_P1_RESOLUTION_HOURS: Joi.number().default(4),
    SLA_P2_RESOLUTION_HOURS: Joi.number().default(48),
    SLA_P3_RESOLUTION_HOURS: Joi.number().default(120),
    
    // Threshold Configuration
    DUPLICATE_SIMILARITY_THRESHOLD: Joi.number().default(0.90),
    MIN_AI_CONFIDENCE: Joi.number().default(0.85),
    MEDIUM_AI_CONFIDENCE: Joi.number().default(0.60),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  console.error(`Config validation error: ${error.message}`);
  process.exit(1);
}

export const env = {
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoUri: envVars.MONGO_URI,
  jwt: {
    secret: envVars.JWT_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
  },
  clientUrl: envVars.CLIENT_URL,
  logLevel: envVars.LOG_LEVEL,
  uploadLimit: envVars.UPLOAD_LIMIT,
  openaiApiKey: envVars.OPENAI_API_KEY,
  openai: {
    apiKey: envVars.OPENAI_API_KEY || 'sk-local-no-key-required',
    baseUrl: envVars.OPENAI_BASE_URL,
    model: envVars.OPENAI_MODEL,
  },
  
  // Capacity Management
  capacity: {
    warningThreshold: envVars.CAPACITY_WARNING_THRESHOLD,
    criticalThreshold: envVars.CAPACITY_CRITICAL_THRESHOLD,
    maxActiveCasesPerResolver: envVars.MAX_ACTIVE_CASES_PER_RESOLVER,
  },
  
  // SLA Configuration
  sla: {
    p0: {
      responseMinutes: envVars.SLA_P0_RESPONSE_MINUTES,
      resolutionHours: envVars.SLA_P0_RESOLUTION_HOURS,
    },
    p1: {
      responseHours: envVars.SLA_P1_RESPONSE_HOURS,
      resolutionHours: envVars.SLA_P1_RESOLUTION_HOURS,
    },
    p2: {
      responseHours: envVars.SLA_P2_RESPONSE_HOURS,
      resolutionHours: envVars.SLA_P2_RESOLUTION_HOURS,
    },
    p3: {
      responseHours: envVars.SLA_P3_RESPONSE_HOURS,
      resolutionHours: envVars.SLA_P3_RESOLUTION_HOURS,
    },
  },
  
  // Threshold Configuration
  thresholds: {
    duplicateSimilarity: envVars.DUPLICATE_SIMILARITY_THRESHOLD,
    minAiConfidence: envVars.MIN_AI_CONFIDENCE,
    mediumAiConfidence: envVars.MEDIUM_AI_CONFIDENCE,
  },
};