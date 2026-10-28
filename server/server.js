const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { connectDB, getCollection } = require('./config/db');
const recordRoutes = require('./routes/recordRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { getDashboardKPIs } = require('./controllers/analyticsController');
const { importDataset } = require('../database/import');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static assets from client/ directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// Ensure database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    // Handled by db module fallback
  }
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { getDBMode } = require('./config/db');
    const collection = getCollection();
    const count = await collection.countDocuments();
    const mode = getDBMode();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: mode === 'mongodb' ? 'MongoDB Connected' : 'Cloud In-Memory Dataset',
      mode: mode,
      totalRecords: count
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// Dashboard summary KPIs route
app.get('/api/stats', getDashboardKPIs);

// Mount API routes
app.use('/api/records', recordRoutes);
app.use('/api/analytics', analyticsRoutes);

// Fallback to client/index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Start Server and Connect Database
async function startServer() {
  try {
    console.log(`--------------------------------------------------`);
    console.log(`Starting Vehicle Service & Maintenance Analytics Server`);
    console.log(`--------------------------------------------------`);

    await connectDB();

    // Check if dataset is already imported; if not, auto-import from CSV
    const collection = getCollection();
    const count = await collection.countDocuments();
    if (count === 0) {
      console.log(`Collection is empty. Automatically importing dataset from CSV...`);
      await importDataset();
    } else {
      console.log(`Collection already contains ${count} records.`);
    }

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
      console.log(`📊 Dashboard UI:   http://localhost:${PORT}`);
      console.log(`🔗 API Base URL:   http://localhost:${PORT}/api/records`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error(`Failed to start server:`, err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
