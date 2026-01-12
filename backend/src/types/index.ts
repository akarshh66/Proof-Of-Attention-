export interface Session {
    sessionId: string;
    userId: string;
    courseId: string;
    lessonId: string;
    startTime: string;
    returnUrl?: string;
}

export interface AttentionData {
    sessionId: string;
    timeSpent: number;
    focusEvents: FocusEvent[];
    idleEvents: IdleEvent[];
    activityCount: number;
}

export interface FocusEvent {
    timestamp: number;
    focused: boolean;
}

export interface IdleEvent {
    timestamp: number;
    idle: boolean;
}

export interface VerificationResult {
    verified: boolean;
    reason?: string;
    attentionScore: number;
}

export interface Proof {
    proofId: string;
    sessionId: string;
    userId: string;
    courseId: string;
    lessonId: string;
    verified: boolean;
    attentionTime: number;
    attentionScore?: number;
    proofHash: string;
    blockchainTxHash?: string;
    timestamp: string;
}

export interface AttentionRules {
    minTimeSpent: number; // seconds
    maxIdleTime: number; // seconds
    minFocusPercentage: number; // 0-100
}
