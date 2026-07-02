import Joi from 'joi';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
const envPath = process.env.NODE_ENV === 'test' ? '../../.env.test' : '../../.env';
dotenv.config({ path: path.join(__dirname, envPath) });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(5001),
    MONGO_URI: Joi.string().required().description('MongoDB Connection String'),
    JWT_SECRET: Joi.string().required().description('JWT Secret Key'),
    JWT_REFRESH_SECRET: Joi.string().required().description('JWT Refresh Secret Key'),
    CLIENT_URL: Joi.string().required().description('Frontend Client URL'),
    LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly').default('info'),
    UPLOAD_LIMIT: Joi.string().default('50mb'),
    OPENAI_API_KEY: Joi.string().optional().allow(''),
    
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