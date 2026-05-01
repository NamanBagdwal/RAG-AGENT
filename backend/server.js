require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
// Only connect if URI is provided, otherwise skip to allow server to run for testing
if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_uri_here') {
  connectDB();
} else {
  console.warn("MongoDB URI missing. Skipping DB connection.");
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.send('Enterprise SOP AI Agent API is running');
});

// Routes (will be imported and used here)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
