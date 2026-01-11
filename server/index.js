const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB
initDb();

// Routes
const path = require('path');

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Routes (Keep these before the catch-all)
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
