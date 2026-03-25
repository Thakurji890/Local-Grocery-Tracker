const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load end configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// Base Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const billRoutes = require('./routes/billRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Test Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Grocery Bill Tracker API is running!' });
});

// Database and Server Init
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grocery-tracker';
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected successfully');
    app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });
