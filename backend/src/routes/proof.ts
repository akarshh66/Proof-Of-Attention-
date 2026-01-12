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

        // Step 1: Verify attention using INCO
        const encryptedData = await incoService.encryptAttentionData(attentionData);
        const verificationResult = await incoService.verifyAttention(attentionData);

        if (!verificationResult.verified) {
            return res.status(400).json({
                success: false,
                error: 'Attention verification failed',
                reason: verificationResult.reason,
            });
        }

        // Step 2: Generate proof ID and hash
        const proofId = `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const proofHash = incoService.generateProofHash(
            sessionId,
            encryptedData,
            verificationResult.verified
        );

        // Step 3: Create proof object
        const proof: Proof = {
            proofId,
            sessionId,
            userId,
            courseId,
            lessonId,
            verified: verificationResult.verified,
            attentionTime: attentionData.timeSpent,
            proofHash,
            timestamp: new Date().toISOString(),
        };

        // Step 4: Store on Shardeum blockchain
        const txHash = await shardeumService.storeProof(proof);
        if (txHash) {
            proof.blockchainTxHash = txHash;
        }

        // Step 5: Store in local database
        proofs.set(proofId, proof);

        console.log('✅ Proof generated:', proofId);

        res.json({
            success: true,
            proof: {
                proofId: proof.proofId,
                sessionId: proof.sessionId,
                verified: proof.verified,
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
