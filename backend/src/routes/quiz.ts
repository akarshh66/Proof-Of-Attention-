import { Router, Request, Response } from 'express';
import { getQuizForCourse } from '../services/quizData.js';
import { QuizAttempt, QuizScore } from '../types/quiz.js';

const router = Router();

// In-memory storage
let quizAttempts: QuizAttempt[] = [];
let quizScores: QuizScore[] = [];

/**
 * GET /api/quiz/course/:courseId - Get all questions for a course
 */
router.get('/course/:courseId', (req: Request, res: Response) => {
    const { courseId } = req.params;
    const quiz = getQuizForCourse(courseId);

    if (!quiz) {
        return res.status(404).json({
            success: false,
            error: 'No quiz found for this course',
        });
    }

    res.json({
        success: true,
        data: {
            courseId: quiz.courseId,
            title: quiz.title,
            questions: quiz.questions,
            totalQuestions: quiz.questions.length,
        },
    });
});

/**
 * POST /api/quiz/submit-answer - Submit a quiz answer
 */
router.post('/submit-answer', (req: Request, res: Response) => {
    const { sessionId, userId, courseId, questionId, selectedAnswer } = req.body;

    if (!sessionId || !userId || !courseId || !questionId || selectedAnswer === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields',
        });
    }

    const quiz = getQuizForCourse(courseId);
    if (!quiz) {
        return res.status(404).json({
            success: false,
            error: 'Course quiz not found',
        });
    }

    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) {
        return res.status(404).json({
            success: false,
            error: 'Question not found',
        });
    }

    const isCorrect = selectedAnswer === question.correctAnswer;
    const attempt: QuizAttempt = {
        id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        userId,
        courseId,
        questionId,
        selectedAnswer,
        isCorrect,
        answeredAt: Date.now(),
        timeToAnswer: 0, // Will be calculated on frontend
    };

    quizAttempts.push(attempt);

    res.json({
        success: true,
        data: {
            attemptId: attempt.id,
            isCorrect,
            correctAnswer: question.correctAnswer,
        },
    });
});

/**
 * POST /api/quiz/calculate-score - Calculate attention score for a session
 */
router.post('/calculate-score', (req: Request, res: Response) => {
    const { sessionId, userId, courseId } = req.body;

    console.log('📊 Calculate-score endpoint called:', { sessionId, userId, courseId });

    if (!sessionId || !userId || !courseId) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields',
        });
    }

    const sessionAttempts = quizAttempts.filter(
        a => a.sessionId === sessionId && a.userId === userId && a.courseId === courseId
    );

    console.log(`📋 Found ${sessionAttempts.length} quiz attempts for session ${sessionId}`);
    console.log('Total quiz attempts in memory:', quizAttempts.length);

    // If no quiz attempts, generate a default score based on session participation
    if (sessionAttempts.length === 0) {
        // Fallback: assign a base score of 65 for just viewing the video
        const attentionScore = 65;

        const score: QuizScore = {
            sessionId,
            userId,
            courseId,
            totalQuestions: 0,
            correctAnswers: 0,
            percentageScore: 0,
            attentionScore,
            timestamp: Date.now(),
        };

        quizScores.push(score);

        console.log('✅ No attempts found, returning fallback score:', attentionScore);

        return res.json({
            success: true,
            data: {
                totalQuestions: 0,
                correctAnswers: 0,
                percentageScore: 0,
                attentionScore: Math.round(attentionScore),
                message: '✅ Video completed. Base score assigned.',
            },
        });
    }

    const correctAnswers = sessionAttempts.filter(a => a.isCorrect).length;
    const totalQuestions = sessionAttempts.length;
    const percentageScore = (correctAnswers / totalQuestions) * 100;

    // Calculate attention score (0-100)
    // Based on: accuracy (70%), speed (20%), completion (10%)
    const avgTimePerQuestion = sessionAttempts.reduce((sum, a) => sum + a.timeToAnswer, 0) / totalQuestions;
    const speedBonus = Math.min(20, (120000 / avgTimePerQuestion) * 10); // Max 20 points for good speed
    const completionBonus = totalQuestions >= 3 ? 10 : 5; // Bonus for answering all questions

    let attentionScore = percentageScore * 0.7 + speedBonus + completionBonus;
    attentionScore = Math.min(100, Math.max(0, attentionScore)); // Clamp 0-100

    console.log('📈 Quiz score calculation:', {
        correctAnswers,
        totalQuestions,
        percentageScore: Math.round(percentageScore),
        speedBonus: Math.round(speedBonus),
        completionBonus,
        finalAttentionScore: Math.round(attentionScore),
    });

    const score: QuizScore = {
        sessionId,
        userId,
        courseId,
        totalQuestions,
        correctAnswers,
        percentageScore,
        attentionScore,
        timestamp: Date.now(),
    };

    quizScores.push(score);

    res.json({
        success: true,
        data: {
            totalQuestions,
            correctAnswers,
            percentageScore: Math.round(percentageScore),
            attentionScore: Math.round(attentionScore),
            message: attentionScore >= 70 ? '✅ High attention verified!' : '⚠️ Low attention score',
        },
    });
});

/**
 * GET /api/quiz/session/:sessionId/score - Get quiz score for a session
 */
router.get('/session/:sessionId/score', (req: Request, res: Response) => {
    const { sessionId } = req.params;

    const score = quizScores.find(s => s.sessionId === sessionId);

    if (!score) {
        return res.status(404).json({
            success: false,
            error: 'No score found for this session',
        });
    }

    res.json({
        success: true,
        data: score,
    });
});

export default router;
