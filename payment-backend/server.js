const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware 
app.use(cors()); 
app.use(express.json()); 
app.use(helmet()); 

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per Microsecond
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// MongoDB Connection 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error(err));


// Routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transaction');
 

app.use('/api/auth', authRoutes); 
app.use('/api/transactions', transactionRoutes); 



// Test Route
app.get('/', (req, res) => {
  res.send('Payment App Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
