import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seeds";
import path from "path";

const app = express();

// Configure production/development mode
const isProduction = process.env.NODE_ENV === "production";

// Configure CORS and trust APP_URL
const appUrl = process.env.APP_URL || "http://localhost:5000";
const corsOrigins = [
  appUrl,
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://blocksystem.local",
  "http://localhost:3000",
  "http://localhost:80"
];

// Trust proxy (for reverse proxy setups like Apache/WampServer)
app.set("trust proxy", true);

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  // Allow requests from configured origins
  if (corsOrigins.some(allowed => origin === allowed || !origin)) {
    res.header("Access-Control-Allow-Origin", origin || appUrl);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Database seeding disabled - data will be entered manually by admin
  // To enable seeding temporarily: set ENABLE_SEEDING=true in .env
  if (process.env.ENABLE_SEEDING === "true") {
    try {
      const seedTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Seed timeout")), 5000)
      );
      await Promise.race([seedDatabase(), seedTimeout]);
    } catch (error) {
      console.warn("⚠️  Database seeding skipped:", (error as Error).message);
    }
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (!isProduction) {
    await setupVite(app, server);
  } else {
    // In production: serve static files and SPA
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
