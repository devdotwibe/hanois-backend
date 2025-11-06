const { validateEnv, config } = require('./config/env');
validateEnv();
const path = require('path');  
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');

const contactRoutes = require('./routes/contactRoutes');
const bannerRoutes = require('./routes/bannerRoutes');

const adminRoutes = require('./routes/adminRoutes');

const settingsRoutes = require('./routes/settingsRoutes');

const providerRouted = require('./routes/providerRouted');

const faqRoutes = require("./routes/faqRoutes");

const pageRoutes = require("./routes/pageRoutes");

const categoryRoutes = require('./routes/categoryRoutes');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const pool = require('./db/pool');

const app = express();
const port = config.port;

app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);


app.use('/api/users', userRoutes);

app.use('/api/providers', providerRouted);

app.use('/api/admin', adminRoutes);

app.use('/api/contacts', contactRoutes);

app.use('/api/banner', bannerRoutes);

app.use('/api/settings', settingsRoutes);

app.use("/api/faq", faqRoutes);

app.use("/api/page", pageRoutes);

app.use("/api/categories", categoryRoutes);



app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Hanois Backend API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
    }
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server closed');
    
    pool.end(() => {
      console.log('Database connection pool closed');
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});



// require('dotenv').config();

// const express = require('express');
// const { Pool } = require('pg'); 
// const app = express();
// const port = process.env.PORT || 5000;

// app.use(express.json());

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// pool.connect((err, client, release) => {
//   if (err) {
//     return console.error('Error connecting to DB', err.stack);
//   }
//   console.log('Connected to PostgreSQL database');
//   release();
// });

// app.get("/", (req, res) => {
//   res.send("Hello from Hanois Backend!");
// });

// app.get('/api/users', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM users');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// app.get('/api/users/create-table', async (req, res) => {
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
//     res.json({ message: 'Users table created successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.post('/api/users/create', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ error: 'Please provide name, email, and password' });
//     }

//     const insertQuery = `
//       INSERT INTO users (name, email, password)
//       VALUES ($1, $2, $3)
//       RETURNING *;
//     `;
//     const result = await pool.query(insertQuery, [name, email, password]);
//     res.json({ message: 'User created successfully', user: result.rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });



// app.get('/api/users/insert-test', async (req, res) => {
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
//     res.json({ message: 'Test users inserted', users: result.rows });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
