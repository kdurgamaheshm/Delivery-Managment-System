// src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import authRoutes from "./routes/auth";
import orderRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";

dotenv.config();

const app = express();

// Normalize FRONTEND_URL(s) from env (no trailing slash) and allow localhost for dev
const rawFrontends = (process.env.FRONTEND_URL || "http://localhost:3000").split(",").map(s => s.trim()).filter(Boolean);
export const FRONTEND_URLS = rawFrontends.map(u => u.replace(/\/+$/, ""));

// DEBUG: log allowed origins
console.log("Allowed frontend origins:", FRONTEND_URLS);

app.use(express.json());

// Use a function to check origin so we normalize incoming origin and compare
app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests (e.g., curl/postman) that omit origin
    if (!origin) return callback(null, true);

    const normalized = origin.replace(/\/+$/, "");
    if (FRONTEND_URLS.includes(normalized)) return callback(null, true);

    console.warn("CORS blocked origin:", origin, "normalized:", normalized);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// Optional: small request logging for debugging (remove later)
app.use((req, res, next) => {
  console.log(`[REQ] ${new Date().toISOString()} ${req.method} ${req.originalUrl} Origin=${req.headers.origin || ""}`);
  next();
});

// Routes - Make sure these are registered BEFORE any static/fallback
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// If you serve static files from backend, place static + fallback after API routers

// Connect DB
connectDB();

export default app;
