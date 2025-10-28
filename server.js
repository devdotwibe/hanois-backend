require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

const userRoutes = require('./routes/userRoutes');

const cors = require('cors');
app.use(cors({
  origin: '*', // allow all origins for now (you can tighten this later)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Hanois Backend!");
});

app.use('/api/users', userRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
