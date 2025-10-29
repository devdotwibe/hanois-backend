require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const dbRoutes = require('./routes/dbRoutes'); // new DB routes

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // later change to your frontend URL
  methods: ['GET', 'POST'],
}));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/db', dbRoutes); // DB routes

app.get('/', (req, res) => {
  res.send('Hello from Hanois Backend!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
