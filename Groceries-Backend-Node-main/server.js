const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
let logger = require('morgan');
const dotenv = require('dotenv');
const morgan = require('morgan');
// Load environment variables
dotenv.config({ path: './config.env' });

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));
app.use(
  logger(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/address', require('./routes/address'));
app.use('/api/countries', require('./routes/countries'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/redeem', require('./routes/redeem'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/test-notifications', require('./routes/test-notifications'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    status: 500,
    message: 'Something went wrong!',
    data: null
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: 'Route not found',
    data: null
  });
});

console.log('MongoDB URI:', process.env.MONGODB_URI);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
