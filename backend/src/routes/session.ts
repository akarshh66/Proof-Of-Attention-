import { Router, Request, Response } from 'express';
import { Session } from '../types/index.js';

const router = Router();

// In-memory session storage (use Redis in production)
const sessions = new Map<string, Session>();

/**
 * Create a new POA session
 * Called when user is redirected from course platform
 */
router.post('/create', (req: Request, res: Response) => {
    try {
        const { userId, courseId, lessonId, returnUrl } = req.body;

        if (!userId || !courseId || !lessonId) {
            return res.status(400).json({
                error: 'Missing required fields: userId, courseId, lessonId',
            });
        }

        // Generate unique session ID
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const session: Session = {
            sessionId,
            userId,
            courseId,
            lessonId,
            startTime: new Date().toISOString(),
            returnUrl,
        };

        sessions.set(sessionId, session);

        console.log('✅ Session created:', sessionId);

        res.json({
            success: true,
            session,
        });
    } catch (error) {
        console.error('Session creation error:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

/**
 * Get session details
 */
router.get('/:sessionId', (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const session = sessions.get(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ success: true, session });
    } catch (error) {
        console.error('Session retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve session' });
    }
});

/**
 * Delete session (cleanup)
 */
router.delete('/:sessionId', (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const deleted = sessions.delete(sessionId);

        if (!deleted) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ success: true, message: 'Session deleted' });
    } catch (error) {
        console.error('Session deletion error:', error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

export default router;
