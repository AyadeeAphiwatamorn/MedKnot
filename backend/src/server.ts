import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { supabase } from "./config/supabase";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

// Welcome route
app.get("/", (req, res) => {
  res.send("Welcome to MedKnot API!");
});

// Basic API health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MedKnot API is running successfully!",
  });
});

// Supabase API availability check
app.get("/api/health/supabase", async (req, res) => {
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/health`, {
      headers: {
        apikey: process.env.SUPABASE_PUBLISHABLE_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error("Supabase health check failed");
    }

    res.json({
      success: true,
      message: "MedKnot can reach the Supabase Auth API!",
    });
  } catch (error) {
    console.error("Supabase connection error:", error);

    res.status(500).json({
      success: false,
      message: "Could not reach Supabase Auth API",
    });
  }
});

// Database connection test
app.get("/api/health/database", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("roles")
      .select("id, name")
      .limit(5);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Database query completed successfully!",
      roles: data,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database query failed",
    });
  }
});

app.post("/api/health/auth-test", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Supabase authentication successful!",
      userId: data.user.id,
      authenticated: true,
    });
  } catch (error) {
    console.error("Authentication test error:", error);

    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`MedKnot API running at http://localhost:${PORT}`);
});
