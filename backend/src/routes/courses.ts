import { Router, Request, Response } from 'express';
import { Course, Enrollment, CourseCompletion } from '../types/course.js';

const router = Router();

// In-memory storage (in production, use a database)
let courses: Course[] = [
    {
        id: 'course_001',
        title: 'Introduction to React',
        description: 'Learn the basics of React and build your first component-based application.',
        duration: 600,
        thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcR5U16C8yXgBpl7-Bc7Itjx3_LRl425zINA&s',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
        instructor: 'John Doe',
        createdAt: Date.now(),
    },
    {
        id: 'course_002',
        title: 'Advanced TypeScript',
        description: 'Master TypeScript with advanced patterns, generics, and type inference.',
        duration: 900,
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Typescript.svg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4',
        instructor: 'Jane Smith',
        createdAt: Date.now(),
    },
    {
        id: 'course_004',
        title: 'Blockchain Fundamentals',
        description: 'Understand blockchain technology, smart contracts, and decentralized applications.',
        duration: 1800,
        thumbnail: 'https://builtin.com/sites/www.builtin.com/files/2024-10/Blockchain%20Technology%20from%20Builtin.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerEscapes.mp4',
        instructor: 'Alex Chen',
        createdAt: Date.now(),
    },
];

let enrollments: Enrollment[] = [];
let completions: CourseCompletion[] = [];

/**
 * GET /api/courses - List all courses
 */
router.get('/courses', (req: Request, res: Response) => {
    res.json({
        success: true,
        data: courses,
        count: courses.length,
    });
});

/**
 * GET /api/courses/:courseId - Get specific course
 */
router.get('/courses/:courseId', (req: Request, res: Response) => {
    const { courseId } = req.params;
    const course = courses.find(c => c.id === courseId);

    if (!course) {
        return res.status(404).json({
            success: false,
            error: 'Course not found',
        });
    }

    res.json({
        success: true,
        data: course,
    });
});

/**
 * POST /api/enrollments - Enroll user in course
 */
router.post('/enrollments', (req: Request, res: Response) => {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
        return res.status(400).json({
            success: false,
            error: 'userId and courseId required',
        });
    }

    const course = courses.find(c => c.id === courseId);
    if (!course) {
        return res.status(404).json({
            success: false,
            error: 'Course not found',
        });
    }

    // Check if already enrolled
    const existing = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    if (existing) {
        return res.json({
            success: true,
            data: existing,
            message: 'Already enrolled',
        });
    }

    const enrollment: Enrollment = {
        userId,
        courseId,
        enrolledAt: Date.now(),
        verified: false,
    };

    enrollments.push(enrollment);

    res.status(201).json({
        success: true,
        data: enrollment,
    });
});

/**
 * POST /api/completions - Record course completion with proof
 */
router.post('/completions', (req: Request, res: Response) => {
    const { userId, courseId, lessonId, proofId, sessionId, verified, attentionScore } = req.body;

    if (!userId || !courseId || !proofId || !sessionId) {
        return res.status(400).json({
            success: false,
            error: 'userId, courseId, proofId, and sessionId required',
        });
    }

    const completion: CourseCompletion = {
        userId,
        courseId,
        lessonId,
        proofId,
        sessionId,
        verified: verified || false,
        attentionScore: attentionScore || 0,
        completedAt: Date.now(),
    };

    completions.push(completion);

    // Update enrollment
    const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
    if (enrollment) {
        enrollment.completedAt = Date.now();
        enrollment.proofId = proofId;
        enrollment.sessionId = sessionId;
        enrollment.attentionScore = attentionScore;
        enrollment.verified = verified;
    }

    res.status(201).json({
        success: true,
        data: completion,
    });
});

/**
 * GET /api/users/:userId/completions - Get user's completed courses
 */
router.get('/users/:userId/completions', (req: Request, res: Response) => {
    const { userId } = req.params;

    const userCompletions = completions.filter(c => c.userId === userId);
    const userEnrollments = enrollments.filter(e => e.userId === userId);

    res.json({
        success: true,
        data: {
            completions: userCompletions,
            enrollments: userEnrollments,
            stats: {
                totalEnrolled: userEnrollments.length,
                totalCompleted: userCompletions.length,
                totalVerified: userCompletions.filter(c => c.verified).length,
                averageScore: userCompletions.length > 0
                    ? Math.round(userCompletions.reduce((sum, c) => sum + (c.attentionScore || 0), 0) / userCompletions.length)
                    : 0,
            },
        },
    });
});

/**
 * GET /api/users/:userId/enrollments - Get user's enrollments
 */
router.get('/users/:userId/enrollments', (req: Request, res: Response) => {
    const { userId } = req.params;
    const userEnrollments = enrollments.filter(e => e.userId === userId);

    res.json({
        success: true,
        data: userEnrollments,
        count: userEnrollments.length,
    });
});

/**
 * GET /api/courses/:courseId/completions - Get all completions for a course
 */
router.get('/courses/:courseId/completions', (req: Request, res: Response) => {
    const { courseId } = req.params;
    const courseCompletions = completions.filter(c => c.courseId === courseId);

    res.json({
        success: true,
        data: courseCompletions,
        stats: {
            totalCompletions: courseCompletions.length,
            verifiedCount: courseCompletions.filter(c => c.verified).length,
            averageScore: courseCompletions.length > 0
                ? Math.round(courseCompletions.reduce((sum, c) => sum + (c.attentionScore || 0), 0) / courseCompletions.length)
                : 0,
        },
    });
});

export default router;
