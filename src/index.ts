import express from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import riderRoutes from './routes/riderRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'Rider Service',
    timestamp: new Date().toISOString() 
  });
});

// API Routes
app.use('/v1/riders', riderRoutes);

// 404 handler (must be after all routes)
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Initialize database connection and start server
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Rider Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

