import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAttentionTracker from "../hooks/useAttentionTracker";
import { proofApi } from "../services/api";

export default function Lesson() {
    const navigate = useNavigate();
    const [session, setSession] = useState<any>(null);
    const [isGeneratingProof, setIsGeneratingProof] = useState(false);
    const { timeSpent, isFocused, isIdle, progressPercent, focusEvents, idleEvents, activityCount } = useAttentionTracker();

    const canComplete = timeSpent >= 60 && isFocused && !isIdle;

    useEffect(() => {
        const sessionData = sessionStorage.getItem("poaSession");
        if (!sessionData) {
            navigate("/start");
            return;
        }
        setSession(JSON.parse(sessionData));
    }, [navigate]);

    const handleComplete = async () => {
        if (!canComplete || isGeneratingProof) return;

        setIsGeneratingProof(true);

        try {
            // Prepare attention data for backend
            const attentionData = {
                sessionId: session.sessionId,
                timeSpent,
                focusEvents,
                idleEvents,
                activityCount,
            };

            console.log('📤 Sending attention data:', attentionData);

            // Generate proof via backend (INCO + Shardeum)
            const response = await proofApi.generate(
                session.sessionId,
                session.userId,
                session.courseId,
                session.lessonId,
                attentionData
            );

            console.log('✅ Proof response:', response);

            if (response.success) {
                // Store proof data
                sessionStorage.setItem("poaProof", JSON.stringify(response.proof));
                navigate("/complete");
            } else {
                alert(`Proof generation failed: ${response.error}`);
            }
        } catch (error) {
            console.error("Proof generation error:", error);
            alert("Failed to generate proof. Please try again.");
        } finally {
            setIsGeneratingProof(false);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <h1 className="text-xl font-semibold text-gray-900">POA — Proof of Attention</h1>
                    <p className="text-sm text-gray-600 mt-1">Attention verification in progress</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Attention Status Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Attention Status</h2>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm font-semibold text-gray-900">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum 60 seconds of active attention required</p>
                    </div>

                    {/* Status Indicators */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{timeSpent}s</div>
                            <div className="text-xs text-gray-600 mt-1">Time Spent</div>
                        </div>

                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className={`text-2xl font-bold ${isFocused ? "text-green-600" : "text-red-600"
                                }`}>
                                {isFocused ? "✓" : "✗"}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                {isFocused ? "Focused" : "Unfocused"}
                            </div>
                        </div>

                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className={`text-2xl font-bold ${isIdle ? "text-orange-600" : "text-green-600"
                                }`}>
                                {isIdle ? "⏸" : "▶"}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                {isIdle ? "Idle" : "Active"}
                            </div>
                        </div>
                    </div>

                    {/* Warning Messages */}
                    {!isFocused && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Please keep this tab focused to continue tracking attention
                            </p>
                        </div>
                    )}

                    {isIdle && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-800">
                                ⚠️ No activity detected. Move your mouse or interact with the page.
                            </p>
                        </div>
                    )}
                </div>

                {/* Lesson Content Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson Content</h2>

                    <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 mb-4">
                            <strong>Course:</strong> {session.courseId} | <strong>Lesson:</strong> {session.lessonId}
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Understanding Proof of Attention</h3>

                        <p className="text-gray-700 mb-4">
                            This system verifies real learner attention using measurable engagement signals
                            before allowing lesson completion.
                        </p>

                        <h4 className="text-lg font-semibold text-gray-900 mb-2">What We Track:</h4>
                        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                            <li><strong>Active Time:</strong> Time spent with the browser tab focused</li>
                            <li><strong>Tab Focus:</strong> Whether you're viewing this page or switched away</li>
                            <li><strong>User Activity:</strong> Mouse movement, keyboard input, scrolling</li>
                        </ul>

                        <h4 className="text-lg font-semibold text-gray-900 mb-2">What We Don't Track:</h4>
                        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                            <li>No webcam or eye tracking</li>
                            <li>No AI-based attention claims</li>
                            <li>No personal behavior monitoring</li>
                        </ul>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
                            <p className="text-sm text-blue-900">
                                <strong>Privacy Note:</strong> Your raw attention data is computed securely and
                                never exposed publicly. Only the verification result is recorded.
                            </p>
                        </div>

                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Completion Requirements:</h4>
                        <p className="text-gray-700 mb-2">
                            To complete this lesson, you must:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2">
                            <li>Spend at least 60 seconds actively engaged</li>
                            <li>Keep this tab focused (don't switch to other tabs)</li>
                            <li>Show activity (move mouse, scroll, type)</li>
                        </ul>
                    </div>
                </div>

                {/* Complete Button */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <button
                        onClick={handleComplete}
                        disabled={!canComplete || isGeneratingProof}
                        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${canComplete && !isGeneratingProof
                            ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        {isGeneratingProof ? "🔐 Generating Proof..." : canComplete ? "✓ Complete Lesson" : "⏳ Attention Verification in Progress..."}
                    </button>

                    {!canComplete && !isGeneratingProof && (
                        <p className="text-center text-sm text-gray-600 mt-3">
                            Complete the attention requirements above to unlock this button
                        </p>
                    )}
                    {isGeneratingProof && (
                        <p className="text-center text-sm text-blue-600 mt-3">
                            🔐 Encrypting attention data with INCO & storing proof on Shardeum...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
