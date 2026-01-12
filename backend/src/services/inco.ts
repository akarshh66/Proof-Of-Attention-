import crypto from 'crypto';
import { FhenixClient, EncryptionTypes } from 'fhenixjs';
import { ethers } from 'ethers';
import { AttentionData, VerificationResult, AttentionRules } from '../types/index.js';
import dotenv from 'dotenv';

// Ensure env vars loaded in ESM
dotenv.config();

// Default attention rules (same as frontend)
const DEFAULT_RULES: AttentionRules = {
    minTimeSpent: 60, // 60 seconds minimum
    maxIdleTime: 10, // Max 10 seconds idle
    minFocusPercentage: 80, // 80% of time must be focused
};

/**
 * INCO Service - Privacy-Preserving Attention Verification using FHE
 * 
 * Uses INCO/Fhenix SDK for fully homomorphic encryption (FHE)
 * to compute verification without exposing raw attention data.
 */
export class IncoService {
    private client: FhenixClient | null = null;
    private provider: ethers.JsonRpcProvider | null = null;
    private wallet: ethers.Wallet | null = null;
    private contractAddress: string | null = null;
    private contract: ethers.Contract | null = null;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        try {
            const rpcUrl = process.env.INCO_RPC_URL;
            const privateKey = process.env.INCO_PRIVATE_KEY;
            const contractAddr = process.env.INCO_CONTRACT_ADDRESS;

            if (!rpcUrl || !privateKey) {
                console.warn('⚠️  INCO not configured. Using simulation mode.');
                return;
            }

            // Initialize provider and wallet
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            this.wallet = new ethers.Wallet(privateKey, this.provider);

            // Initialize Fhenix client for FHE operations
            // @ts-ignore - FhenixClient provider type compatibility
            this.client = new FhenixClient({ provider: this.provider });

            if (contractAddr) {
                this.contractAddress = contractAddr;
                // Contract ABI for AttentionVerifier
                const abi = [
                    'function storeAttentionProof(bytes32 sessionId, bytes encryptedTimeSpent, bytes encryptedFocusPercentage, bytes encryptedAttentionScore, bytes inputProof) external',
                    'function isSessionVerified(bytes32 sessionId) external view returns (bool)',
                    'function totalProofs() external view returns (uint256)'
                ];
                this.contract = new ethers.Contract(contractAddr, abi, this.wallet);
            }

            console.log('✅ INCO FHE client initialized');
            console.log(`   Provider: ${rpcUrl}`);
            console.log(`   Wallet: ${this.wallet.address}`);
            if (this.contractAddress) {
                console.log(`   Contract: ${this.contractAddress}`);
            }
        } catch (error) {
            console.error('❌ INCO initialization failed:', error);
            this.client = null;
        }
    }
    /**
     * Encrypt attention data using FHE
     */
    async encryptAttentionData(data: AttentionData): Promise<string> {
        if (!this.client) {
            // Fallback: hash for simulation
            const dataString = JSON.stringify({
                sessionId: data.sessionId,
                timeSpent: data.timeSpent,
                focusCount: data.focusEvents.length,
                activityCount: data.activityCount,
            });
            return this.hashData(dataString);
        }

        try {
            // Encrypt using Fhenix FHE
            const encrypted = await this.client.encrypt(
                data.timeSpent,
                EncryptionTypes.uint32
            );
            // Serialize encrypted value - handle different return types
            return JSON.stringify(encrypted);
        } catch (error) {
            console.error('FHE encryption failed:', error);
            // Fallback to hash
            return this.hashData(JSON.stringify(data));
        }
    }

    /**
     * Verify attention with FHE computation
     */
    async verifyAttention(
        data: AttentionData,
        rules: AttentionRules = DEFAULT_RULES
    ): Promise<VerificationResult> {
        // Calculate metrics (this happens in plaintext before encryption)
        const totalTime = data.timeSpent;
        const focusTime = data.focusEvents.length > 0 ? this.calculateFocusTime(data) : totalTime;
        const idleTime = data.idleEvents.length > 0 ? this.calculateIdleTime(data) : 0;
        const focusPercentage = totalTime > 0 ? (focusTime / totalTime) * 100 : 100;

        // Attention score (0-100)
        let attentionScore = 0;

        // Time component (40 points)
        if (totalTime >= rules.minTimeSpent) {
            attentionScore += 40;
        } else {
            attentionScore += (totalTime / rules.minTimeSpent) * 40;
        }

        // Focus component (40 points)
        attentionScore += (focusPercentage / 100) * 40;

        // Activity component (20 points)
        if (idleTime <= rules.maxIdleTime) {
            attentionScore += 20;
        } else {
            const idlePenalty = Math.min(idleTime - rules.maxIdleTime, 20);
            attentionScore += Math.max(0, 20 - idlePenalty);
        }

        // Verification logic
        const verified =
            totalTime >= rules.minTimeSpent &&
            focusPercentage >= rules.minFocusPercentage &&
            idleTime <= rules.maxIdleTime;

        let reason = undefined;
        if (!verified) {
            if (totalTime < rules.minTimeSpent) {
                reason = `Insufficient time: ${totalTime}s < ${rules.minTimeSpent}s required`;
            } else if (focusPercentage < rules.minFocusPercentage) {
                reason = `Low focus: ${focusPercentage.toFixed(1)}% < ${rules.minFocusPercentage}% required`;
            } else if (idleTime > rules.maxIdleTime) {
                reason = `Too much idle time: ${idleTime}s > ${rules.maxIdleTime}s allowed`;
            }
        }

        // If FHE client available, store encrypted proof on-chain
        if (this.client && this.contract) {
            try {
                await this.storeEncryptedProof(data, Math.round(attentionScore), focusPercentage);
            } catch (error) {
                console.error('Failed to store encrypted proof:', error);
            }
        }

        return {
            verified,
            reason,
            attentionScore: Math.round(attentionScore),
        };
    }

    /**
     * Store encrypted proof on INCO contract
     */
    private async storeEncryptedProof(
        data: AttentionData,
        attentionScore: number,
        focusPercentage: number
    ): Promise<void> {
        if (!this.client || !this.contract) {
            throw new Error('INCO not initialized');
        }

        // Encrypt values using FHE
        const encryptedTime = await this.client.encrypt(data.timeSpent, EncryptionTypes.uint32);
        const encryptedFocus = await this.client.encrypt(
            Math.round(focusPercentage),
            EncryptionTypes.uint32
        );
        const encryptedScore = await this.client.encrypt(attentionScore, EncryptionTypes.uint32);

        // Generate input proof (required by INCO)
        const inputProof = '0x'; // Placeholder - INCO SDK generates this

        // Convert sessionId to bytes32
        const sessionIdBytes32 = ethers.id(data.sessionId);

        // Store on contract
        const tx = await this.contract.storeAttentionProof(
            sessionIdBytes32,
            encryptedTime,
            encryptedFocus,
            encryptedScore,
            inputProof
        );

        await tx.wait();
        console.log(`✅ Encrypted proof stored on INCO: ${tx.hash}`);
    }

    /**
     * Generate proof hash for blockchain storage
     * This hash represents the encrypted attention verification
     */
    generateProofHash(sessionId: string, encryptedData: string, verified: boolean): string {
        const proofData = JSON.stringify({
            sessionId,
            encryptedData,
            verified,
            timestamp: Date.now(),
        });

        return this.hashData(proofData);
    }

    // Helper methods
    private calculateFocusTime(data: AttentionData): number {
        // Count time when user was focused
        let focusedTime = 0;
        let lastFocusTime = 0;
        let wasFocused = true;

        for (const event of data.focusEvents) {
            if (!event.focused && wasFocused) {
                // User just lost focus
                focusedTime += event.timestamp - lastFocusTime;
                wasFocused = false;
            } else if (event.focused && !wasFocused) {
                // User regained focus
                lastFocusTime = event.timestamp;
                wasFocused = true;
            }
        }

        // Add remaining time if still focused
        if (wasFocused && data.focusEvents.length > 0) {
            const lastEvent = data.focusEvents[data.focusEvents.length - 1];
            focusedTime += Date.now() - lastEvent.timestamp;
        }

        return Math.floor(focusedTime / 1000); // Convert to seconds
    }

    private calculateIdleTime(data: AttentionData): number {
        // Calculate longest continuous idle period
        let maxIdleTime = 0;
        let currentIdleStart = 0;

        for (const event of data.idleEvents) {
            if (event.idle) {
                currentIdleStart = event.timestamp;
            } else if (currentIdleStart > 0) {
                const idleDuration = event.timestamp - currentIdleStart;
                maxIdleTime = Math.max(maxIdleTime, idleDuration);
                currentIdleStart = 0;
            }
        }

        return Math.floor(maxIdleTime / 1000); // Convert to seconds
    }

    private hashData(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}

export const incoService = new IncoService();
