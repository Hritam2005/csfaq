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
    PORT: Joi.number().default(5000),
    MONGO_URI: Joi.string().required().description('MongoDB Connection String'),
    JWT_SECRET: Joi.string().required().description('JWT Secret Key'),
    JWT_REFRESH_SECRET: Joi.string().required().description('JWT Refresh Secret Key'),
    CLIENT_URL: Joi.string().required().description('Frontend Client URL'),
    LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly').default('info'),
    UPLOAD_LIMIT: Joi.string().default('50mb'),
    OPENAI_API_KEY: Joi.string().optional().allow(''),
    REDIS_URL: Joi.string().optional().allow(''),
    SMTP_HOST: Joi.string().optional().allow(''),
    SMTP_PORT: Joi.number().optional(),
    SMTP_USER: Joi.string().optional().allow(''),
    SMTP_PASSWORD: Joi.string().optional().allow(''),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  console.error(`Config validation error: ${error.message}`);
  process.exit(1); // Fail fast
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
  redisUrl: envVars.REDIS_URL,
  smtp: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    user: envVars.SMTP_USER,
    password: envVars.SMTP_PASSWORD,
  },
};
