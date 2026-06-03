import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDB } from './db.js';
import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import photosRoutes from './routes/photos.js';
import cloudinaryRoutes from './routes/cloudinary.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:8000').split(','),
  credentials: true
}));

// Initialize database
initializeDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/photos', photosRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
