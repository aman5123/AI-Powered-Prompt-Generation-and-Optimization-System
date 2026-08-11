import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Start server without DB
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
