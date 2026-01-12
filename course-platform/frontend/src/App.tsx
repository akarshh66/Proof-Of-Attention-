import { useState, useEffect } from 'react';
import './styles/App.css';
import CourseList from './pages/CourseList';
import CourseDetails from './pages/CourseDetails';
import ProofPage from './pages/ProofPage';
import { idGenerationApi, completionsApi } from './services/api';

interface Course {
    id: string;
    title: string;
    description: string;
    duration: number; // seconds
    thumbnail: string;
    videoUrl: string;
    instructor: string;
}

interface Proof {
    userId: string;
    courseId: string;
    lessonId: string;
    proofId?: string;
    sessionId?: string;
    verified: boolean;
    attentionScore: number;
    timestamp: number;
}

const API_URL = 'http://localhost:3001/api';

export default function App() {
    const [page, setPage] = useState<'list' | 'details' | 'proof'>('list');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [proofs, setProofs] = useState<Proof[]>([]);
    const [userId] = useState(() => {
        // Check if user already exists in localStorage
        let stored = localStorage.getItem('poaUserId');
        if (!stored) {
            // Generate new user ID with timestamp for uniqueness
            stored = 'USR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('poaUserId', stored);
            console.log('🆔 Generated new User ID:', stored);
        } else {
            console.log('🆔 Using existing User ID:', stored);
        }
        return stored;
    });
    const [loading, setLoading] = useState(true);

    // Fetch courses on mount
    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch(`${API_URL}/courses`);
            const result = await response.json();
            if (result.success) {
                setCourses(result.data);
                console.log('📚 Courses loaded:', result.data.length);
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check if redirected from POA with proof
        const params = new URLSearchParams(window.location.search);
        if (params.has('proofId')) {
            const proof: Proof = {
                userId,
                courseId: params.get('courseId') || '',
                lessonId: params.get('lessonId') || '',
                proofId: params.get('proofId') || '',
                sessionId: params.get('sessionId') || '',
                verified: params.get('verified') === 'true',
                attentionScore: parseInt(params.get('score') || '0'),
                timestamp: Date.now(),
            };

            // Save completion to backend
            saveCompletion(proof);

            setProofs([...proofs, proof]);
            setPage('proof');
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const saveCompletion = async (proof: Proof) => {
        try {
            const result = await completionsApi.save({
                userId: proof.userId,
                courseId: proof.courseId,
                lessonId: proof.lessonId,
                proofId: proof.proofId,
                sessionId: proof.sessionId,
                verified: proof.verified,
                attentionScore: proof.attentionScore,
            });
            console.log('✅ Completion saved:', result);
        } catch (error) {
            console.error('Failed to save completion:', error);
        }
    };

    const handleCourseClick = (course: Course) => {
        setSelectedCourse(course);
        setPage('details');
    };

    const handleStartCourse = async (course: Course) => {
        try {
            // Generate auto IDs from backend or locally
            const idsResponse = await idGenerationApi.generateIds();

            if (!idsResponse.success || !idsResponse.ids) {
                throw new Error('Failed to generate IDs');
            }

            const { sessionId, courseId, lessonId } = idsResponse.ids;

            // Store for tracking
            sessionStorage.setItem('currentCourseId', courseId);
            sessionStorage.setItem('currentLessonId', lessonId);
            sessionStorage.setItem('currentSessionId', sessionId);

            console.log('🚀 Generated IDs:', { userId, courseId, lessonId, sessionId });

            const poaBase = (import.meta as any).env?.VITE_POA_URL || 'http://localhost:5174';
            const poaUrl = new URL(`${poaBase.replace(/\/$/, '')}/start`);
            poaUrl.searchParams.set('userId', userId);
            poaUrl.searchParams.set('courseId', courseId);
            poaUrl.searchParams.set('lessonId', lessonId);
            poaUrl.searchParams.set('sessionId', sessionId);
            poaUrl.searchParams.set('videoUrl', course.videoUrl);
            poaUrl.searchParams.set('duration', course.duration.toString());
            poaUrl.searchParams.set('redirectUrl', window.location.href);

            console.log('📤 Redirecting to POA:', poaUrl.toString());
            window.location.href = poaUrl.toString();
        } catch (error) {
            console.error('Error starting course:', error);
            alert('Failed to start course. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="app">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    color: 'white',
                    fontSize: '1.2em'
                }}>
                    Loading courses...
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            {page === 'list' && (
                <CourseList courses={courses} onCourseClick={handleCourseClick} />
            )}
            {page === 'details' && selectedCourse && (
                <CourseDetails
                    course={selectedCourse}
                    onStart={() => handleStartCourse(selectedCourse)}
                    onBack={() => setPage('list')}
                />
            )}
            {page === 'proof' && proofs.length > 0 && (
                <ProofPage
                    proof={proofs[proofs.length - 1]}
                    onBack={() => setPage('list')}
                />
            )}
        </div>
    );
}
