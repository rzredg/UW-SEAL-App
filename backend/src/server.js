import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import teamsRoutes from './routes/teams.js';
import projectsRoutes from './routes/projects.js';
import tasksRoutes from './routes/tasks.js';
import membersRoutes from './routes/members.js';
import { initializeCronJobs } from './config/cronScheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.CLIENT_ORIGIN, // production frontend
        "http://localhost:5173",   // local dev
        "http://127.0.0.1:5173"
      ];

      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/members', membersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API running' });
});

app.use(errorHandler);

// Initialize cron jobs
initializeCronJobs();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});