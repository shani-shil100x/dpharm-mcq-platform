const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

// Security headers
app.use(helmet());

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// Stricter rate limiter for auth endpoints (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again after 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// CORS — restrict to known origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL, // Set this in .env for production
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));

app.get('/', (req, res) => {
  res.send('D.Pharm MCQ Backend is running perfectly on Vercel!');
});

app.get('/api', (req, res) => {
  res.send('API is running...');
});

const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userStatsRoutes = require('./routes/userStatsRoutes');
const examRoutes = require('./routes/examRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/user/stats', userStatsRoutes);
app.use('/api/exam', examRoutes);

app.use(notFound);
app.use(errorHandler);

// Only listen if not running in Vercel Serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
