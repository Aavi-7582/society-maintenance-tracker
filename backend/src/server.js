import express from 'express';
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import AdminRoutes from './routes/adminRoutes.js';
import NoticeRoutes from './routes/noticeRoutes.js';
import DashboardRoutes from './routes/dashboardRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const app=express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/api/health',(req,res)=>{
    res.status(200).json({ status: 'UP', timestamp: new Date() });
})

app.use('/api/auth',authRoutes);
app.use('/api/complaints',complaintRoutes);
app.use('/api/admin', AdminRoutes);
app.use('/api/notices', NoticeRoutes);
app.use('/api/admin/dashboard', DashboardRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Database Connection & Server Boot
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas successfully.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failure:', err.message);
    process.exit(1);
  });
