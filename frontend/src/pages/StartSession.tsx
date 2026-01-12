import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function StartSession() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    useEffect(() => {
        const userId = searchParams.get("userId");
        const courseId = searchParams.get("courseId");
        const lessonId = searchParams.get("lessonId");
        const videoUrl = searchParams.get("videoUrl");
        const duration = searchParams.get("duration");
        const redirectUrl = searchParams.get("redirectUrl");
        const sessionId = searchParams.get("sessionId");

        console.log("URL Params:", { userId, courseId, lessonId, videoUrl, duration, redirectUrl, sessionId });
        console.log("Full search params:", searchParams.toString());

        // If no params, show error with example
        if (!userId || !courseId || !lessonId) {
            setError("Missing required parameters: userId, courseId, lessonId");
            return;
        }

        // Generate unique sessionId if not provided
        const finalSessionId = sessionId || `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Store session data - include ALL params from course platform
        const sessionData = {
            sessionId: finalSessionId,
            userId,
            courseId,
            lessonId,
            videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
            duration: duration ? parseInt(duration) : 60,
            redirectUrl: redirectUrl || null,
            startTime: new Date().toISOString(),
        };

        console.log("Storing session data:", sessionData);
        sessionStorage.setItem("poaSession", JSON.stringify(sessionData));

        // Redirect to lesson page
        setTimeout(() => {
            navigate("/lesson");
        }, 1000);
    }, [searchParams, navigate]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
                    <div className="text-red-600 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-xl font-semibold mb-2">Invalid Request</h2>
                        <p className="text-gray-600 mb-6">{error}</p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mt-6">
                            <h3 className="font-semibold text-blue-900 mb-3">Expected URL format:</h3>
                            <code className="text-sm text-blue-900 break-all block mb-4 p-3 bg-white rounded border border-blue-200">
                                http://localhost:5174/start?userId=USER123&courseId=COURSE101&lessonId=LESSON5
                            </code>

                            <h3 className="font-semibold text-blue-900 mb-2">Example:</h3>
                            <a
                                href="?userId=U123&courseId=C101&lessonId=L5"
                                className="text-blue-600 hover:text-blue-800 underline block mb-4 break-all"
                            >
                                Click here to start with demo parameters
                            </a>

                            <h3 className="font-semibold text-blue-900 mb-2">Required parameters:</h3>
                            <ul className="text-left text-blue-900 space-y-1 text-sm">
                                <li>• <strong>userId</strong> - User identifier (e.g., U123)</li>
                                <li>• <strong>courseId</strong> - Course identifier (e.g., C101)</li>
                                <li>• <strong>lessonId</strong> - Lesson identifier (e.g., L5)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <div className="text-center">
                    <div className="mb-6">
                        <div className="inline-block p-4 bg-blue-100 rounded-full">
                            <svg className="w-12 h-12 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Creating Session</h1>
                    <p className="text-gray-600">Setting up your attention verification session...</p>
                </div>
            </div>
        </div>
    );
}
