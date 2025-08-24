import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './config/firebase';
//import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
//app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Goalsy API is running!',
    timestamp: new Date().toISOString(),
  });
});

// Test Firebase connection
app.get('/test-firebase', async (req, res) => {
  try {
    const testRef = db.collection('test').doc('connection');
    await testRef.set({
      message: 'Firebase connected successfully!',
      timestamp: new Date().toISOString()
    });
    
    const doc = await testRef.get();
    
    res.json({
      success: true,
      data: doc.data()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Goalsy API running on port ${PORT}`);
});