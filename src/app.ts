
import express, { Application, Request, Response } from "express";
import apiRoutes from "./routes";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./config/logger";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import { redis } from "./config/redis";
import { pingDB } from "./config/db";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import { swaggerSpec } from "./config/swagger";
import { env } from "./config/env";

const app: Application = express();

// Allowed frontend origins
const allowedOrigins = [
  env.STUDENT_URL,

  // Local development frontends
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",

  // Include these if you use 127.0.0.1
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
].filter((origin): origin is string => Boolean(origin));

// Request logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === "/health",
    },
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "debug";
    },
  })
);

// CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Global middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Full system health check
 *     responses:
 *       200:
 *         description: All services are healthy
 *       503:
 *         description: One or more services are unavailable
 *
 * /live:
 *   get:
 *     tags: [Health]
 *     summary: API liveness check
 *     responses:
 *       200:
 *         description: API process is running
 */

// Shared dependency health checker
const checkDependencies = async () => {
  let redisStatus = "down";
  let mysqlStatus = "down";

  try {
    const pong = await redis.ping();

    if (pong === "PONG") {
      redisStatus = "up";
    }
  } catch {
    redisStatus = "down";
  }

  try {
    const dbUp = await pingDB();

    if (dbUp) {
      mysqlStatus = "up";
    }
  } catch {
    mysqlStatus = "down";
  }

  const allServicesUp =
    redisStatus === "up" && mysqlStatus === "up";

  return {
    status: allServicesUp ? "ok" : "degraded",
    message: allServicesUp
      ? "SaySo API is running"
      : "One or more services are unavailable",
    services: {
      api: "up",
      mysql: mysqlStatus,
      redis: redisStatus,
    },
    timestamp: new Date().toISOString(),
  };
};

// Full health check: API + MySQL + Redis
app.get("/health", async (_req: Request, res: Response) => {
  const health = await checkDependencies();

  res.status(health.status === "ok" ? 200 : 503).json(health);
});

// Liveness check: API process only
app.get("/live", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "SaySo API is running",
    services: {
      api: "up",
    },
    timestamp: new Date().toISOString(),
  });
});

// Readiness check: same dependency checks as full health
app.get("/ready", async (_req: Request, res: Response) => {
  const health = await checkDependencies();

  res.status(health.status === "ok" ? 200 : 503).json(health);
});


// API routes
app.use("/api/v1", apiRoutes);

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "SaySo API Docs",
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

// Raw Swagger JSON
app.get("/api-docs.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// 404 handler
app.use(notFound);

// Central error handler (must remain last)
app.use(errorHandler);

export default app;
