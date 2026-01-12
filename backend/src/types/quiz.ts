export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // index of correct option
    difficulty: 'easy' | 'medium' | 'hard';
    timeOffset: number; // seconds into video when quiz appears
}

export interface CourseQuiz {
    courseId: string;
    title: string;
    questions: QuizQuestion[];
}

export interface QuizAttempt {
    id: string;
    sessionId: string;
    userId: string;
    courseId: string;
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    answeredAt: number;
    timeToAnswer: number; // milliseconds
}

export interface QuizScore {
    sessionId: string;
    userId: string;
    courseId: string;
    totalQuestions: number;
    correctAnswers: number;
    percentageScore: number;
    attentionScore: number; // 0-100, based on timing + accuracy
    timestamp: number;
}
