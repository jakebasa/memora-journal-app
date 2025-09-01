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
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // increased from 5 to 50 login attempts per windowMs for development
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.'
    },
});

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Prevent large payloads
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

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
