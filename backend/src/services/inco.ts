import crypto from 'crypto';
import { AttentionData, VerificationResult, AttentionRules } from '../types/index.js';

// Default attention rules (same as frontend)
const DEFAULT_RULES: AttentionRules = {
    minTimeSpent: 60, // 60 seconds minimum
    maxIdleTime: 10, // Max 10 seconds idle
    minFocusPercentage: 80, // 80% of time must be focused
};

/**
 * INCO Service - Privacy-Preserving Attention Verification
 * 
 * In production, this would use INCO SDK for fully homomorphic encryption (FHE)
 * to compute verification without exposing raw attention data.
 * 
 * For MVP demo: Simulates privacy-preserving computation
 */
export class IncoService {
    /**
     * Encrypt attention data using privacy-preserving computation
     * In production: Use INCO's FHE to encrypt sensitive data
     */
    async encryptAttentionData(data: AttentionData): Promise<string> {
        // MVP: Create encrypted representation (hash)
        const dataString = JSON.stringify({
            sessionId: data.sessionId,
            timeSpent: data.timeSpent,
            focusCount: data.focusEvents.length,
            activityCount: data.activityCount,
            // Don't include raw event arrays in production
        });

        // In production with INCO SDK:
        // const encrypted = await fhenixClient.encrypt(data, 'uint32');
        // return encrypted.toString();

        return this.hashData(dataString);
    }

    /**
     * Verify attention privately without exposing raw data
     * In production: Computation happens on encrypted data using INCO's FHE
     */
    async verifyAttention(
        data: AttentionData,
        rules: AttentionRules = DEFAULT_RULES
    ): Promise<VerificationResult> {
        // Calculate metrics
        const totalTime = data.timeSpent;

        // For MVP: If no focus/idle events provided, assume good behavior
        // In production with INCO, this data would be encrypted and computed privately
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

        // In production with INCO:
        // This entire computation would happen on encrypted data
        // Only the boolean result would be decrypted and returned

        return {
            verified,
            reason,
            attentionScore: Math.round(attentionScore),
        };
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
