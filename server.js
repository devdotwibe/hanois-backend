// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // later change to 'https://hanois.dotwibe.com'
  methods: ['GET', 'POST'],
}));

// Routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Hanois Backend!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
