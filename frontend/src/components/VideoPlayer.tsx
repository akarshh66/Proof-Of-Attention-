import { useState } from 'react';

interface VideoPlayerProps {
    videoUrl: string;
    courseId: string;
    sessionId: string;
    userId: string;
    duration: number;
    onComplete: (attentionScore: number) => void;
    onCancel: () => void;
}

export default function VideoPlayer({
    videoUrl,
    courseId,
    userId,
    duration,
    onComplete,
    onCancel,
}: VideoPlayerProps) {
    const [isComplete, setIsComplete] = useState(false);
    const [attentionScore, setAttentionScore] = useState<number | null>(null);
    const [videoStartTime] = useState(Date.now());
    const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));

    if (!videoUrl) {
        return <div style={{ color: 'white', padding: '20px', textAlign: 'center', background: '#000' }}>
            <p>No video URL provided</p>
            <p style={{ fontSize: '12px', color: '#999' }}>Debug: videoUrl = {JSON.stringify(videoUrl)}</p>
            <p style={{ fontSize: '12px', color: '#999' }}>courseId = {courseId}</p>
            <p style={{ fontSize: '12px', color: '#999' }}>userId = {userId}</p>
        </div>;
    }

    const handleVideoEnd = async () => {
        try {
            // Calculate attention score based on multiple factors
            let calculatedScore = 75; // Base score

            // Time-based scoring: 5-30 minutes watched = better score
            const timeSpent = Math.floor((Date.now() - videoStartTime) / 1000);
            if (timeSpent >= duration * 0.8) {
                calculatedScore += 15; // Watched most of the video
            } else if (timeSpent >= duration * 0.5) {
                calculatedScore += 10; // Watched half
            } else if (timeSpent >= duration * 0.2) {
                calculatedScore += 5; // Watched some
            }

            // Cap at 100
            calculatedScore = Math.min(100, calculatedScore);

            console.log('📺 Video Completion Analysis:');
            console.log('  ⏱️ Time spent:', timeSpent, 'seconds');
            console.log('  📊 Video duration:', duration, 'seconds');
            console.log('  📈 Percentage watched:', Math.round((timeSpent / duration) * 100), '%');
            console.log('  🎯 Calculated attention score:', calculatedScore);

            // For now, use the calculated time-based score
            // (Quiz score would require active quiz interactions which aren't being collected)
            setAttentionScore(calculatedScore);
            console.log('✅ Final attention score:', calculatedScore);

            setIsComplete(true);
        } catch (error) {
            console.error('❌ Error calculating score:', error);
            setAttentionScore(70); // Safe fallback
            setIsComplete(true);
        }
    };

    const handleComplete = () => {
        console.log('Continue button clicked, calling onComplete with score:', attentionScore);
        if (attentionScore !== null) {
            onComplete(attentionScore);
        }
    };

    return (
        <div style={{ width: '100%', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
            {/* Video Container */}
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', backgroundColor: '#000' }}>
                {isYouTube ? (
                    <iframe
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        src={videoUrl.includes('embed') ? videoUrl : videoUrl.replace('youtu.be/', 'youtube.com/embed/').split('?')[0]}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video Lesson"
                    />
                ) : (
                    <video
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        controls
                        onEnded={handleVideoEnd}
                        src={videoUrl}
                    >
                        Your browser does not support HTML5 video.
                    </video>
                )}

                {/* Mark Complete Button for YouTube */}
                {isYouTube && !isComplete && (
                    <button
                        onClick={handleVideoEnd}
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            zIndex: 100,
                        }}
                    >
                        ✓ Mark Complete
                    </button>
                )}
            </div>

            {/* Completion Screen */}
            {isComplete && (
                <div style={{
                    background: '#000',
                    color: 'white',
                    padding: '40px',
                    textAlign: 'center',
                }}>
                    <h2 style={{ marginBottom: '20px' }}>🎓 Course Complete!</h2>
                    <div style={{
                        background: '#1a1a1a',
                        padding: '30px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                    }}>
                        <p style={{ color: '#aaa', marginBottom: '10px' }}>Your Attention Score</p>
                        <p style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#667eea' }}>
                            {attentionScore !== null ? `${Math.round(attentionScore)}/100` : 'Calculating...'}
                        </p>
                    </div>
                    <p style={{ marginBottom: '20px', fontSize: '1.1em' }}>
                        {attentionScore !== null ? (
                            attentionScore >= 80
                                ? '🌟 Excellent! Proof verified.'
                                : attentionScore >= 60
                                    ? '👍 Good job!'
                                    : '⚠️ Try again.'
                        ) : (
                            'Computing your attention score...'
                        )}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                            onClick={handleComplete}
                            disabled={attentionScore === null}
                            style={{
                                background: attentionScore === null ? '#ccc' : '#667eea',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                cursor: attentionScore === null ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                            }}
                        >
                            {attentionScore === null ? 'Calculating...' : 'Continue'}
                        </button>
                        <button
                            onClick={onCancel}
                            style={{
                                background: '#333',
                                color: '#aaa',
                                border: '1px solid #555',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                            }}
                        >
                            Back
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
