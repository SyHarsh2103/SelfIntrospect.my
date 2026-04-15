import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import publicRoutes from "./routes/publicRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((item) => item.trim())
  : "*";

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Sahajayoga Guidance Tool API is running.",
  });
});

app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });