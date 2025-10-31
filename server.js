import dotenv from "dotenv";
import express from "express";
import pkg from "pg";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://hanois.dotwibe.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error("❌ Error connecting to DB:", err.stack);
  }
  console.log("✅ Connected to PostgreSQL database");
  release();
});


app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello from Hanois Backend!");
});

// app.get("/api/users", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM users");
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/users/create-table", async (req, res) => {
//   try {
//     const createTableQuery = `
//       CREATE TABLE IF NOT EXISTS users (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(100) NOT NULL,
//         email VARCHAR(100) UNIQUE NOT NULL,
//         password VARCHAR(255) NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `;
//     await pool.query(createTableQuery);
//     res.json({ message: "Users table created successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.post("/api/users/create", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         error: "Please provide name, email, and password",
//       });
//     }

//     const insertQuery = `
//       INSERT INTO users (name, email, password)
//       VALUES ($1, $2, $3)
//       RETURNING *;
//     `;
//     const result = await pool.query(insertQuery, [name, email, password]);
//     res.json({ message: "User created successfully", user: result.rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/users/insert-test", async (req, res) => {
//   try {
//     const insertQuery = `
//       INSERT INTO users (name, email, password)
//       VALUES 
//         ('Alice', 'alice1@example.com', '123456'),
//         ('Bob', 'bob@example.com', 'abcdef'),
//         ('Charlie', 'charlie@example.com', 'password')
//       ON CONFLICT (email) DO NOTHING
//       RETURNING *;
//     `;
//     const result = await pool.query(insertQuery);
//     res.json({ message: "Test users inserted", users: result.rows });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
