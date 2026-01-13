import { Router, Request, Response } from 'express';
import { getQuizForCourse } from '../services/quizData.js';

const router = Router();

/**
 * GET /api/quiz/course/:courseId - Get all questions for a course
 * Note: Quiz submission endpoints have been removed
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
            questions: quiz.questions,
            totalQuestions: quiz.questions.length,
        },
    });
});

export default router;
