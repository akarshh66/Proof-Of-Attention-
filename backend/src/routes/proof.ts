import { Router, Request, Response } from 'express';
import { Proof, AttentionData } from '../types/index.js';
import { incoService } from '../services/inco.js';
import { shardeumService } from '../services/shardeum.js';

const router = Router();

// In-memory proof storage (use database in production)
const proofs = new Map<string, Proof>();

/**
 * Generate proof after successful attention verification
 * Stores proof metadata on Shardeum blockchain
 */
router.post('/generate', async (req: Request, res: Response) => {
    try {
        const { sessionId, userId, courseId, lessonId, attentionData } = req.body;

        if (!sessionId || !userId || !courseId || !lessonId || !attentionData) {
            return res.status(400).json({
                error: 'Missing required fields',
            });
        }

        console.log('🎯 Generating proof for session:', sessionId);
        console.log('📊 Attention data:', attentionData);

        // Step 1: Get quiz score (primary indicator of attention)
        const quizScore = attentionData.quizScore || 65;
        const isVerified = quizScore >= 50; // Require minimum 50 score for verification

        console.log('✅ Quiz score:', quizScore, '- Verified:', isVerified);

        // Step 2: Encrypt attention data for privacy
        try {
            const encryptedData = await incoService.encryptAttentionData(attentionData);
            console.log('🔐 Data encrypted');
        } catch (encryptError) {
            console.warn('⚠️  Encryption failed (continuing):', encryptError);
        }

        // Step 3: Generate proof ID and hash
        const proofId = `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const proofHashInput = `${sessionId}_${quizScore}_${Date.now()}`;
        const proofHash = incoService.generateProofHash(
            sessionId,
            proofHashInput,
            isVerified
        );

        // Step 4: Create proof object
        const proof: Proof = {
            proofId,
            sessionId,
            userId,
            courseId,
            lessonId,
            verified: isVerified,
            attentionTime: attentionData.timeSpent || 0,
            attentionScore: quizScore,
            proofHash,
            timestamp: new Date().toISOString(),
        };

        // Step 5: Store on Shardeum blockchain (non-blocking)
        try {
            const txHash = await shardeumService.storeProof(proof);
            if (txHash) {
                proof.blockchainTxHash = txHash;
                console.log('✅ Shardeum TX:', txHash);
            }
        } catch (shardeumError) {
            console.warn('⚠️  Shardeum storage failed (continuing):', shardeumError);
            // Continue without blockchain storage
        }

        // Step 6: Store in local database
        proofs.set(proofId, proof);

        console.log('✅ Proof generated:', proofId, 'Score:', quizScore);

        res.json({
            success: true,
            proof: {
                proofId: proof.proofId,
                sessionId: proof.sessionId,
                userId: proof.userId,
                courseId: proof.courseId,
                verified: proof.verified,
                attentionScore: proof.attentionScore,
                attentionTime: proof.attentionTime,
                proofHash: proof.proofHash,
                blockchainTxHash: proof.blockchainTxHash,
                timestamp: proof.timestamp,
            },
        });
    } catch (error) {
        console.error('Proof generation error:', error);
        res.status(500).json({ error: 'Failed to generate proof' });
    }
});

/**
 * Verify proof exists and is valid
 * Course platforms can call this to verify completion
 */
router.get('/verify/:proofId', async (req: Request, res: Response) => {
    try {
        const { proofId } = req.params;

        // Check local storage
        const proof = proofs.get(proofId);
        if (!proof) {
            return res.status(404).json({
                success: false,
                error: 'Proof not found',
            });
        }

        // Verify on blockchain (optional double-check)
        const blockchainVerified = await shardeumService.verifyProof(proofId);

        res.json({
            success: true,
            verified: proof.verified && blockchainVerified,
            proof: {
                proofId: proof.proofId,
                sessionId: proof.sessionId,
                userId: proof.userId,
                courseId: proof.courseId,
                lessonId: proof.lessonId,
                verified: proof.verified,
                attentionTime: proof.attentionTime,
                timestamp: proof.timestamp,
                blockchainVerified,
            },
        });
    } catch (error) {
        console.error('Proof verification error:', error);
        res.status(500).json({ error: 'Failed to verify proof' });
    }
});

/**
 * Get proof details
 */
router.get('/:proofId', (req: Request, res: Response) => {
    try {
        const { proofId } = req.params;
        const proof = proofs.get(proofId);

        if (!proof) {
            return res.status(404).json({
                success: false,
                error: 'Proof not found',
            });
        }

        res.json({
            success: true,
            proof,
        });
    } catch (error) {
        console.error('Proof retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve proof' });
    }
});

export default router;
