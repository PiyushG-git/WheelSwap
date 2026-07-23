import './types/express';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { env } from './config/env.config';
import { logger } from './config/logger.config';
import { generalLimiter } from './middlewares/rateLimit.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import v1Router from './routes/v1/index';

const app: Application = express();

// ── Security Middleware ───────────────────────

app.use(helmet());

const allowedOrigins = [env.FRONTEND_URL, env.ADMIN_URL]
  .filter(Boolean)
  .map((url) => (url.endsWith('/') ? url.slice(0, -1) : url));

const CORS_WHITELIST = [
  'https://wheel-swap-chi.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
      
      if (allowedOrigins.includes(normalizedOrigin) || CORS_WHITELIST.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        logger.warn(`⚠️ CORS blocked origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── General Middleware ────────────────────────

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ───────────────────────────────────

if (env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// ── Rate Limiting ─────────────────────────────

app.use(env.API_PREFIX, generalLimiter);

// ── Swagger Docs ──────────────────────────────

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WheelSwap API',
      version: '1.0.0',
      description: 'Peer-to-Peer Vehicle Swap & Rental Platform API',
      contact: { name: 'WheelSwap Team', email: 'support@wheelswap.in' },
    },
    servers: [
      { url: `http://localhost:${env.PORT}${env.API_PREFIX}`, description: 'Local' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/routes/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── API Routes ────────────────────────────────

app.use(env.API_PREFIX, v1Router);

// ── Error Handlers ────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
