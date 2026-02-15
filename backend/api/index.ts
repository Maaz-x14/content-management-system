// ============================================
// Vercel Serverless Function Entry Point
// ============================================
// This file re-exports the Express app for Vercel's serverless platform
// Vercel looks for files in the /api directory by default

import app from '../src/server';

// Export the Express app as a Vercel serverless function
export default app;
