import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAttentionTracker from "../hooks/useAttentionTracker";
import { proofApi } from "../services/api";
import VideoPlayer from "../components/VideoPlayer";

export default function Lesson() {
    const navigate = useNavigate();
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { timeSpent, focusEvents, idleEvents, activityCount } = useAttentionTracker();

    useEffect(() => {
        // Check for query params from course platform
        const params = new URLSearchParams(window.location.search);

        const userId = params.get('userId');
        const courseId = params.get('courseId');
        const videoUrl = params.get('videoUrl');
        const duration = params.get('duration');
        const redirectUrl = params.get('redirectUrl');
        const sessionId = params.get('sessionId');
        const lessonId = params.get('lessonId');

        // If coming from course platform, use those params
        if (userId && courseId) {
            const sessionData = {
                sessionId: sessionId || 'SESSION_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                userId: userId,
                courseId: courseId,
                lessonId: lessonId || 'LESSON_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
                duration: duration ? parseInt(duration) : 60,
                redirectUrl: redirectUrl || null,
            };
            sessionStorage.setItem("poaSession", JSON.stringify(sessionData));
            setSession(sessionData);
            setIsLoading(false);
        } else {
            // Original flow - get from session storage
            const sessionData = sessionStorage.getItem("poaSession");
            if (!sessionData) {
                // Fallback: create a test session with React course
                const testSession = {
                    sessionId: 'SESSION_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    userId: 'test_user',
                    courseId: 'course_001',
                    lessonId: 'LESSON_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk?si=iNyid_IBwPLvICh0',
                    duration: 600,
                    redirectUrl: null,
                };
                sessionStorage.setItem("poaSession", JSON.stringify(testSession));
                setSession(testSession);
                setIsLoading(false);
                return;
            }
            const parsed = JSON.parse(sessionData);

            // Ensure videoUrl and duration are set (in case old session data)
            if (!parsed.videoUrl) {
                parsed.videoUrl = 'https://www.youtube.com/embed/SqcY0GlETPk?si=iNyid_IBwPLvICh0';
            }
            if (!parsed.duration) {
                parsed.duration = 600;
            }

            setSession(parsed);
            setIsLoading(false);
        }
    }, []);

    const handleVideoComplete = async (attentionScore: number) => {
        console.log('🎉 handleVideoComplete called with score:', attentionScore);
        console.log('  Session data:', session);

        try {
            const attentionData = {
                sessionId: session?.sessionId,
                quizScore: attentionScore,
                timeSpent,
                focusEvents,
                idleEvents,
                activityCount,
            };

            // Create proof object with score
            const proof = {
                sessionId: session?.sessionId,
                userId: session?.userId,
                courseId: session?.courseId,
                lessonId: session?.lessonId,
                attentionScore: Math.round(attentionScore),
                proofId: 'PROOF_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
                verified: true,
            };

            console.log('📦 Creating proof:', proof);

            // Save proof with score immediately
            sessionStorage.setItem("poaProof", JSON.stringify(proof));
            console.log('✅ Proof saved to sessionStorage');

            // Try to generate proof via backend for blockchain anchoring
            if (session?.userId && session?.courseId) {
                console.log('📤 Sending to backend for blockchain anchoring...');
                try {
                    const response = await proofApi.generate(
                        session.sessionId,
                        session.userId,
                        session.courseId,
                        session.lessonId,
                        attentionData
                    );

                    console.log('Backend response:', response);

                    if (response.success && response.proof) {
                        // Update with backend-generated proof if available
                        const mergedProof = { ...proof, ...response.proof };
                        console.log('✅ Merged proof:', mergedProof);
                        sessionStorage.setItem("poaProof", JSON.stringify(mergedProof));
                    }
                } catch (proofError) {
                    console.warn("⚠️  Could not generate proof from backend:", proofError);
                    // Continue with local proof
                }
            }

            console.log('🚀 Navigating to complete page...');

            // Always navigate to complete page first to show proof
            // The redirectUrl will be used by the "Return to Course" button if user clicks it
            navigate("/complete");
        } catch (error) {
            console.error("❌ Unexpected error in handleVideoComplete:", error);
            // Still navigate even if there's an error
            navigate("/complete");
        }
    };

    if (!session || isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1>Loading lesson...</h1>
                    <p>If this takes too long, <a href="/" style={{ color: '#667eea' }}>go back to courses</a></p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>
            {/* Header */}
            <div style={{ background: '#0a0a0a', borderBottom: '1px solid #333', padding: '20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>📹 Video Lesson</h1>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '5px', margin: 0 }}>Watch and answer quiz questions</p>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
                {/* Video Player */}
                <div style={{ marginBottom: '30px' }}>
                    <VideoPlayer
                        videoUrl={session.videoUrl}
                        courseId={session.courseId}
                        userId={session.userId}
                        duration={session.duration}
                        onComplete={handleVideoComplete}
                        onCancel={() => navigate("/start")}
                    />
                </div>

                {/* Info Card */}
                <div style={{ background: '#0a0a0a', borderRadius: '8px', padding: '30px', border: '1px solid #333' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px', margin: 0 }}>How It Works</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', color: '#bbb' }}>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea', marginBottom: '10px' }}>1️⃣</div>
                            <p style={{ fontSize: '14px', margin: 0 }}>Watch the video attentively.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea', marginBottom: '10px' }}>2️⃣</div>
                            <p style={{ fontSize: '14px', margin: 0 }}>Answer quiz questions to prove attention.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea', marginBottom: '10px' }}>3️⃣</div>
                            <p style={{ fontSize: '14px', margin: 0 }}>Get your attention score verified.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
