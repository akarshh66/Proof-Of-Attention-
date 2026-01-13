import { useState, useEffect, useRef, useCallback } from 'react';

interface VideoPlayerProps {
    videoUrl: string;
    courseId: string;
    userId: string;
    duration: number;
    onComplete: (attentionScore: number) => void;
    onCancel: () => void;
}

interface YTPlayer {
    playVideo: () => void;
    pauseVideo: () => void;
    getPlayerState: () => number;
    getCurrentTime: () => number;
    getDuration: () => number;
    seekTo: (seconds: number) => void;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const MIN_SCORE_REQUIRED = 50;
const MAX_SCORE = 100;

export default function VideoPlayer({
    videoUrl,
    courseId,
    userId,
    onComplete,
    onCancel,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const youtubePlayerRef = useRef<YTPlayer | null>(null);
    const youtubeContainerRef = useRef<HTMLDivElement>(null);
    const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [attentionScore, setAttentionScore] = useState<number | null>(null);
    const [realTimeScore, setRealTimeScore] = useState<number>(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(true);
    const [isTabVisible, setIsTabVisible] = useState(true);
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [lastYouTubeTime, setLastYouTubeTime] = useState<number>(0);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [sessionExpired, setSessionExpired] = useState(false);
    const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));

    // Helper: Reset inactivity timer
    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }

        inactivityTimerRef.current = setTimeout(() => {
            console.warn('⏱️ Session timeout - 15 minutes of inactivity');
            setSessionExpired(true);
        }, SESSION_TIMEOUT_MS);
    }, []);

    // Helper: Extract video ID from YouTube URL
    const getVideoId = useCallback((url: string): string => {
        const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        return match?.[1] || '';
    }, []);

    // Load YouTube IFrame API
    useEffect(() => {
        if (!isYouTube) return;

        // Check if API already loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
        } else {
            initializeYouTubePlayer();
        }

        return () => {
            // Cleanup - API ready callback handled
        };
    }, [isYouTube]);

    const initializeYouTubePlayer = () => {
        if (!youtubeContainerRef.current || !isYouTube || youtubePlayerRef.current) return;

        const videoId = getVideoId(videoUrl);
        if (!videoId) {
            console.error('❌ Could not extract video ID from URL:', videoUrl);
            return;
        }

        youtubePlayerRef.current = new window.YT.Player(youtubeContainerRef.current, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
                onError: onPlayerError,
            },
            playerVars: {
                controls: 1,
                modestbranding: 1,
                fs: 0, // Disable fullscreen
                rel: 0, // Don't show related videos
            },
        });

        console.log('🎬 YouTube player initialized for video:', videoId);
    };

    const onPlayerReady = () => {
        console.log('📺 YouTube player ready');
        setIsLoading(false);
        setIsVideoPlaying(true);
        resetInactivityTimer();

        // Get video duration for YouTube
        if (youtubePlayerRef.current?.getDuration) {
            const duration = youtubePlayerRef.current.getDuration();
            setVideoDuration(duration);
        }
    };

    const onPlayerStateChange = (event: any) => {
        // YT.PlayerState constants:
        // -1: Unstarted
        // 0: Ended
        // 1: Playing
        // 2: Paused
        // 3: Buffering
        // 5: Cued
        const state = event.data;
        const stateName = ['Unstarted', 'Playing', 'Paused', 'Buffering', 'Ended', 'Cued'][
            state + 1
        ];

        console.log(`📺 YouTube state changed: ${stateName} (${state})`);

        if (state === 1) {
            // Playing
            setIsVideoPlaying(true);
            console.log('▶️ Video playing');
        } else if (state === 2) {
            // Paused
            setIsVideoPlaying(false);
            console.log('⏸️ Video paused');
        } else if (state === 0) {
            // Ended
            handleVideoEnd();
        }
    };

    const onPlayerError = (event: any) => {
        console.error('❌ YouTube player error:', event.data);
    };

    // Monitor HTML5 video playback state
    useEffect(() => {
        if (isYouTube || isComplete) return;

        const interval = setInterval(() => {
            if (videoRef.current) {
                const isCurrentlyPlaying = !videoRef.current.paused;
                setIsVideoPlaying(isCurrentlyPlaying);
                console.log('📹 HTML5 Video paused:', videoRef.current.paused, '| Playing:', isCurrentlyPlaying);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [isYouTube, isComplete]);

    // Detect tab visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            const isHidden = document.hidden;
            setIsTabVisible(!isHidden);

            if (isHidden) {
                console.warn('⚠️ User switched tabs - reducing score by 10 points');
                setTabSwitchCount(prev => prev + 1);
                setRealTimeScore(prev => Math.max(0, prev - 10));
            } else {
                console.log('✅ User returned to tab');
                resetInactivityTimer();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [resetInactivityTimer]);

    // Simple linear scoring: +1 point per second if video playing and tab visible
    useEffect(() => {
        if (!isTabVisible || isComplete || sessionExpired) return;

        const interval = setInterval(() => {
            // Check video pause state directly
            const isVideoPaused = isYouTube
                ? !(youtubePlayerRef.current?.getPlayerState?.() === 1) // YouTube: 1 = playing
                : videoRef.current?.paused ?? true;
            const shouldScore = !isVideoPaused;

            // Update current time for HTML5 videos
            if (!isYouTube && videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
            }

            console.log(
                `🔍 Scoring tick: paused=${isVideoPaused}, shouldScore=${shouldScore}, YouTube=${isYouTube}`
            );

            if (shouldScore) {
                resetInactivityTimer(); // Reset timer when actively watching
                setRealTimeScore(prev => {
                    const newScore = Math.min(MAX_SCORE, prev + 1);
                    console.log(
                        '➕ Score +1 (video playing + tab visible) → Total:',
                        newScore
                    );
                    return newScore;
                });
            } else if (isVideoPaused) {
                console.log('⏸️ Video paused - score not incrementing');
            }
        }, 1000); // Increment by 1 every 1 second

        return () => clearInterval(interval);
    }, [isTabVisible, isComplete, sessionExpired, resetInactivityTimer]);

    // Monitor YouTube player for seek attempts (prevent skipping)
    useEffect(() => {
        if (!isYouTube || isComplete || !youtubePlayerRef.current) return;

        const interval = setInterval(() => {
            const currentPos = youtubePlayerRef.current?.getCurrentTime?.() ?? 0;

            // Check if user tried to skip (jumped more than 2 seconds ahead)
            if (currentPos - lastYouTubeTime > 2) {
                console.warn('❌ Skip attempt detected on YouTube. Resetting position.');
                youtubePlayerRef.current?.seekTo?.(lastYouTubeTime);
            }

            setLastYouTubeTime(currentPos);
        }, 500); // Check every 500ms

        return () => clearInterval(interval);
    }, [isYouTube, isComplete, lastYouTubeTime]);

    // Handle HTML5 video metadata loaded
    const handleVideoMetadataLoaded = useCallback(() => {
        if (videoRef.current) {
            setVideoDuration(videoRef.current.duration);
            setIsLoading(false);
            resetInactivityTimer();
            console.log('📹 Video metadata loaded, duration:', videoRef.current.duration);
        }
    }, [resetInactivityTimer]);

    // Handle video loading error
    const handleVideoError = useCallback(() => {
        setVideoError('Failed to load video. Please check your connection or try again.');
        setIsLoading(false);
        console.error('❌ Video loading error');
    }, []);

    // Handle video seeking (prevent skipping)
    const handleSeeking = useCallback(() => {
        if (videoRef.current) {
            console.warn('❌ Skipping is not allowed. Resetting to current position.');
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 2);
        }
    }, []);

    // Handle seeking end
    const handleSeeked = useCallback(() => {
        if (videoRef.current) {
            // Force reset if user managed to seek
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 2);
        }
    }, []);

    if (!videoUrl) {
        return <div style={{ color: 'white', padding: '20px', textAlign: 'center', background: '#000' }}>
            <p>No video URL provided</p>
            <p style={{ fontSize: '12px', color: '#999' }}>Debug: videoUrl = {JSON.stringify(videoUrl)}</p>
            <p style={{ fontSize: '12px', color: '#999' }}>courseId = {courseId}</p>
            <p style={{ fontSize: '12px', color: '#999' }}>userId = {userId}</p>
        </div>;
    }

    const handleVideoEnd = useCallback(() => {
        try {
            console.log('🎬 handleVideoEnd triggered');
            console.log('📊 Final score:', realTimeScore);
            console.log('🚫 Tab switches:', tabSwitchCount);

            // Use the accumulated real-time score
            setAttentionScore(realTimeScore);
            setIsVideoPlaying(false);
            setIsComplete(true);

            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        } catch (error) {
            console.error('❌ Error in handleVideoEnd:', error);
            setAttentionScore(0);
            setIsComplete(true);
        }
    }, [realTimeScore, tabSwitchCount]);

    const handleComplete = useCallback(() => {
        console.log('✅ Continue button clicked');
        console.log('  Current attentionScore:', attentionScore);
        console.log('  Score required:', MIN_SCORE_REQUIRED);

        if (attentionScore === null) {
            console.warn('⚠️ Score is null, using fallback 70');
            onComplete(70);
        } else {
            onComplete(attentionScore);
        }
    }, [attentionScore, onComplete]);

    const isMeetingCriteria = attentionScore !== null && attentionScore >= MIN_SCORE_REQUIRED;
    const watchPercentage = videoDuration > 0 ? Math.round((currentTime / videoDuration) * 100) : 0;

    return (
        <div style={{ width: '100%', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
            {/* Video Container */}
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', backgroundColor: '#000' }}>
                {isYouTube ? (
                    <div
                        ref={youtubeContainerRef}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                        }}
                    />
                ) : (
                    <video
                        ref={videoRef}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        controls
                        controlsList="nodownload"
                        onEnded={handleVideoEnd}
                        onLoadedMetadata={handleVideoMetadataLoaded}
                        onError={handleVideoError}
                        onSeeking={handleSeeking}
                        onSeeked={handleSeeked}
                        src={videoUrl}
                    >
                        Your browser does not support HTML5 video.
                    </video>
                )}

                {/* Loading State */}
                {isLoading && !videoError && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(0, 0, 0, 0.9)',
                        color: '#fff',
                        padding: '30px 40px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        zIndex: 60,
                    }}>
                        <div style={{ fontSize: '18px', marginBottom: '15px' }}>⏳ Loading video...</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>Please wait</div>
                    </div>
                )}

                {/* Error State */}
                {videoError && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(220, 53, 69, 0.9)',
                        color: '#fff',
                        padding: '30px 40px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        zIndex: 60,
                        maxWidth: '300px',
                    }}>
                        <div style={{ fontSize: '18px', marginBottom: '15px' }}>❌ {videoError}</div>
                        <button onClick={onCancel} style={{
                            marginTop: '15px',
                            padding: '8px 16px',
                            background: '#fff',
                            color: '#dc3545',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '600',
                        }}>
                            Go Back
                        </button>
                    </div>
                )}

                {/* Session Expired */}
                {sessionExpired && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(255, 193, 7, 0.95)',
                        color: '#000',
                        padding: '30px 40px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        zIndex: 60,
                        maxWidth: '300px',
                    }}>
                        <div style={{ fontSize: '18px', marginBottom: '15px' }}>⏱️ Session Expired</div>
                        <div style={{ fontSize: '14px', marginBottom: '20px', color: '#333' }}>
                            Your session has expired due to inactivity (15 minutes).
                        </div>
                        <button onClick={onCancel} style={{
                            padding: '10px 20px',
                            background: '#000',
                            color: '#ffc107',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '600',
                        }}>
                            Return to Course
                        </button>
                    </div>
                )}

                {/* Real-Time Score Display - Visible During Playback */}
                {!isComplete && !sessionExpired && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        background: 'rgba(0, 0, 0, 0.85)',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        padding: '15px 20px',
                        zIndex: 50,
                        minWidth: '200px',
                    }}>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>📊 Attention Score</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
                            {Math.round(realTimeScore)}/{MAX_SCORE}
                        </div>

                        {/* Score Progress Bar */}
                        <div style={{
                            marginTop: '10px',
                            height: '6px',
                            background: '#333',
                            borderRadius: '3px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                height: '100%',
                                background: realTimeScore >= MIN_SCORE_REQUIRED ? '#4caf50' : '#667eea',
                                width: `${(realTimeScore / MAX_SCORE) * 100}%`,
                                transition: 'width 0.3s ease',
                            }} />
                        </div>

                        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '12px' }}>
                            {realTimeScore >= MIN_SCORE_REQUIRED
                                ? '✅ Criteria met - Ready to continue'
                                : `📍 Need ${MIN_SCORE_REQUIRED - Math.round(realTimeScore)} more points`
                            }
                        </div>

                        {/* Watch Progress (for HTML5) */}
                        {!isYouTube && videoDuration > 0 && (
                            <div style={{ fontSize: '9px', color: '#666', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #333' }}>
                                Video: {watchPercentage}% watched
                            </div>
                        )}

                        {/* Debug Stats */}
                        <div style={{ fontSize: '8px', color: '#555', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #2a2a2a' }}>
                            Playing: {String(isVideoPlaying)} | Tab: {String(isTabVisible)} | Switches: {tabSwitchCount}
                        </div>
                    </div>
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

                    {/* Debug Info */}
                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '20px', padding: '10px', background: '#111', borderRadius: '4px' }}>
                        <div>isComplete: {String(isComplete)}</div>
                        <div>attentionScore: {attentionScore}</div>
                        <div>Score !== null: {String(attentionScore !== null)}</div>
                    </div>

                    <div style={{
                        background: '#1a1a1a',
                        padding: '30px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                    }}>
                        <p style={{ color: '#aaa', marginBottom: '10px' }}>Your Attention Score</p>
                        <p style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#667eea' }}>
                            {attentionScore !== null ? `${Math.round(attentionScore)}/100` : `${Math.round(realTimeScore)}/100`}
                        </p>
                        {attentionScore === null && (
                            <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                                📊 Real-time tracking in progress
                            </p>
                        )}
                    </div>
                    <p style={{ marginBottom: '20px', fontSize: '1.1em' }}>
                        {attentionScore !== null ? (
                            isMeetingCriteria
                                ? '🌟 Excellent! Score criteria met.'
                                : `⚠️ Score ${Math.round(attentionScore)}/100 - Need at least ${MIN_SCORE_REQUIRED} to continue. Watch more of the video.`
                        ) : (
                            'Computing your attention score...'
                        )}
                    </p>

                    {/* Stats Display */}
                    <div style={{
                        background: '#1a1a1a',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '12px',
                        color: '#aaa',
                    }}>
                        <div>📊 Tab Switches: {tabSwitchCount}</div>
                        {!isYouTube && videoDuration > 0 && (
                            <div>▶️ Video: {watchPercentage}% watched</div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                            onClick={handleComplete}
                            disabled={attentionScore === null || !isMeetingCriteria}
                            style={{
                                background: !isMeetingCriteria ? '#888' : '#667eea',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                cursor: !isMeetingCriteria ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                fontSize: '16px',
                                opacity: !isMeetingCriteria ? 0.5 : 1,
                            }}
                            title={!isMeetingCriteria ? `Attention score must be at least ${MIN_SCORE_REQUIRED} (current: ${attentionScore})` : 'Continue to proof'}
                        >
                            {attentionScore === null
                                ? 'Calculating...'
                                : !isMeetingCriteria
                                    ? `Score too low (${Math.round(attentionScore)}/${MIN_SCORE_REQUIRED})`
                                    : 'Continue to Proof'
                            }
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
