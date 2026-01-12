export interface Course {
    id: string;
    title: string;
    description: string;
    duration: number; // seconds
    thumbnail: string;
    videoUrl: string;
    instructor: string;
    createdAt: number;
}

export interface Enrollment {
    userId: string;
    courseId: string;
    enrolledAt: number;
    completedAt?: number;
    proofId?: string;
    sessionId?: string;
    attentionScore?: number;
    verified: boolean;
}

export interface CourseCompletion {
    userId: string;
    courseId: string;
    lessonId: string;
    proofId: string;
    sessionId: string;
    verified: boolean;
    attentionScore: number;
    completedAt: number;
}
