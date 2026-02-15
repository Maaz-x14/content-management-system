// ============================================
// MINIMAL VERCEL TEST - Step-by-step debugging
// ============================================

import express from 'express';
import cors from 'cors';

const app = express();

// CORS first
app.use(cors({
    origin: '*', // Allow all for testing
    credentials: true,
}));

app.use(express.json());

// Simple health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Minimal Vercel test - Working!',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
});

app.get('/api/test', (req, res) => {
    res.json({ test: 'API route working' });
});

export default app;
