const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { attachRequestContext, requireJsonBody } = require('./middleware/requestMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://mathspoint-client.onrender.com',
];

const effectiveOrigins = allowedOrigins.length === 0 ? defaultOrigins : [...new Set([...allowedOrigins, ...defaultOrigins])];

const corsOptions = {
  origin(origin, callback) {
    // Allow tools like Postman and same-origin server requests.
    if (!origin) {
      return callback(null, true);
    }

    return callback(null, effectiveOrigins.includes(origin));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

// Middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors(corsOptions));
// Ensure preflight requests are handled with the same CORS options
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(requireJsonBody);
app.use(attachRequestContext);
app.use(apiLimiter);
app.use('/uploads', express.static('uploads')); // For serving uploaded files

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const parentRoutes = require('./routes/parentRoutes');
const publicRoutes = require('./routes/publicRoutes');

// Mount Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/public', publicRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Maths Point API is running...');
});

app.use(notFound);
app.use(errorHandler);

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment variables.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in environment variables.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });
