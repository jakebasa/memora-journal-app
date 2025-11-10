import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './app/routes/auth.js';
import entryRoutes from './app/routes/entries.js';
import aiRoutes from './app/routes/ai.js';
import imageRoutes from './app/routes/imageRoutes.js';
import userRoutes from './app/routes/userRoutes.js';

dotenv.config();
const app = express();

// Rate limiting - increased limits for development
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // increased from 100 to 1000 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // increased from 5 to 50 login attempts per windowMs for development
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.',
    },
});

// CORS configuration for production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:8080',
            'http://localhost:3000',
            'http://localhost:5173',
            process.env.FRONTEND_URL,
        ].filter(Boolean);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow credentials (cookies, authorization headers)
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Prevent large payloads
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

app.use((req, res, next) => {
    // More permissive CSP for API server
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://res.cloudinary.com; script-src 'self'; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;"
    );
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/user', userRoutes);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected!'))
    .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
