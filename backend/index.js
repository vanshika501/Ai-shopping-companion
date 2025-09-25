import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.js";

import authRoutes from "./src/routes/auth.js";
import productsRoutes from './src/routes/products.js';

const app = express();

// Middleware
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes); 
// Start server after DB connects
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
})();

