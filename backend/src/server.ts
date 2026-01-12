import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST before any service imports
dotenv.config();

import sessionRoutes from './routes/session.js';
import verifyRoutes from './routes/verify.js';
import proofRoutes from './routes/proof.js';
import courseRoutes from './routes/courses.js';
import { shardeumService } from './services/shardeum.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/session', sessionRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/proof', proofRoutes);
app.use('/api', courseRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'POA Backend',
    });
});

// Network info endpoint
app.get('/api/network', async (req: Request, res: Response) => {
    try {
        const networkInfo = await shardeumService.getNetworkInfo();
        res.json({
            success: true,
            shardeum: networkInfo,
            inco: {
                status: 'configured',
                mode: 'privacy-preserving computation',
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get network info' });
    }
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        service: 'POA - Proof of Attention API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            network: '/api/network',
            session: {
                create: 'POST /api/session/create',
                get: 'GET /api/session/:sessionId',
                delete: 'DELETE /api/session/:sessionId',
            },
            verify: {
                verify: 'POST /api/verify/verify',
                rules: 'GET /api/verify/rules',
            },
            proof: {
                generate: 'POST /api/proof/generate',
                verify: 'GET /api/proof/verify/:proofId',
                get: 'GET /api/proof/:proofId',
            },
        },
    });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n🚀 POA Backend Server Started\n');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 Network info: http://localhost:${PORT}/api/network`);
    console.log('\n📋 API Endpoints:');
    console.log(`   POST   /api/session/create`);
    console.log(`   GET    /api/session/:sessionId`);
    console.log(`   POST   /api/verify/verify`);
    console.log(`   POST   /api/proof/generate`);
    console.log(`   GET    /api/proof/verify/:proofId`);
    console.log('\n🔐 INCO: Privacy-preserving computation enabled');
    console.log(`⛓️  Shardeum: ${shardeumService.getAddress() || 'Demo mode (no wallet)'}`);
    console.log('\n✅ Ready to receive requests\n');
});

export default app;
