import { Router, Request, Response } from 'express';
import { AttentionData } from '../types/index.js';
import { incoService } from '../services/inco.js';

const router = Router();

/**
 * Verify attention data using privacy-preserving computation (INCO)
 * This endpoint receives attention metrics and verifies them securely
 */
router.post('/verify', async (req: Request, res: Response) => {
    try {
        const attentionData: AttentionData = req.body;

        if (!attentionData.sessionId || attentionData.timeSpent === undefined) {
            return res.status(400).json({
                error: 'Missing required fields: sessionId, timeSpent',
            });
        }

        console.log('🔐 Verifying attention for session:', attentionData.sessionId);

        // Step 1: Encrypt attention data (INCO - privacy layer)
        const encryptedData = await incoService.encryptAttentionData(attentionData);

        // Step 2: Verify attention using privacy-preserving computation
        const verificationResult = await incoService.verifyAttention(attentionData);

        console.log('✅ Verification result:', {
            verified: verificationResult.verified,
            score: verificationResult.attentionScore,
        });

        res.json({
            success: true,
            verified: verificationResult.verified,
            attentionScore: verificationResult.attentionScore,
            reason: verificationResult.reason,
            encryptedData, // Hash of encrypted data
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Failed to verify attention' });
    }
});

/**
 * Get verification rules
 */
router.get('/rules', (req: Request, res: Response) => {
    res.json({
        success: true,
        rules: {
            minTimeSpent: 60,
            maxIdleTime: 10,
            minFocusPercentage: 80,
        },
    });
});

export default router;
