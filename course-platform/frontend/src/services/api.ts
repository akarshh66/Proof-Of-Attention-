// Use vite environment variable or fallback to localhost
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string | undefined) || 'http://localhost:3001/api';

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// ID Generation API - Auto-generate unique IDs
export const idGenerationApi = {
    generateIds: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/session/generate-ids`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            return response.json();
        } catch (error) {
            console.error('Failed to generate IDs from backend, using local generation:', error);
            // Fallback to local generation
            return {
                success: true,
                ids: {
                    userId: 'USR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    courseId: 'COURSE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    lessonId: 'LESSON_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    sessionId: 'SESSION_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                }
            };
        }
    },
};

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

// Courses API
export const coursesApi = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/courses`);
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

// Completions API
export const completionsApi = {
    save: async (completion: {
        userId: string;
        courseId: string;
        lessonId: string;
        proofId?: string;
        sessionId?: string;
        verified: boolean;
        attentionScore: number;
    }) => {
        const response = await fetch(`${API_BASE_URL}/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(completion),
        });
        return response.json();
    },
};
