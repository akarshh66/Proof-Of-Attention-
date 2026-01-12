const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Session API
export const sessionApi = {
    create: async (userId: string, courseId: string, lessonId: string, returnUrl?: string) => {
        const response = await fetch(`${API_BASE_URL}/session/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, courseId, lessonId, returnUrl }),
        });
        return response.json();
    },

    get: async (sessionId: string) => {
        const response = await fetch(`${API_BASE_URL}/session/${sessionId}`);
        return response.json();
    },
};

// Verification API
export const verifyApi = {
    verify: async (attentionData: any) => {
        const response = await fetch(`${API_BASE_URL}/verify/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attentionData),
        });
        return response.json();
    },

    getRules: async () => {
        const response = await fetch(`${API_BASE_URL}/verify/rules`);
        return response.json();
    },
};

// Proof API
export const proofApi = {
    generate: async (sessionId: string, userId: string, courseId: string, lessonId: string, attentionData: any) => {
        const response = await fetch(`${API_BASE_URL}/proof/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, userId, courseId, lessonId, attentionData }),
        });
        return response.json();
    },

    verify: async (proofId: string) => {
        const response = await fetch(`${API_BASE_URL}/proof/verify/${proofId}`);
        return response.json();
    },

    get: async (proofId: string) => {
        const response = await fetch(`${API_BASE_URL}/proof/${proofId}`);
        return response.json();
    },
};

// Network info
export const networkApi = {
    info: async () => {
        const response = await fetch('http://localhost:3001/api/network');
        return response.json();
    },

    health: async () => {
        const response = await fetch('http://localhost:3001/health');
        return response.json();
    },
};
