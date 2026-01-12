import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Complete() {
    const navigate = useNavigate();
    const [proof, setProof] = useState<any>(null);
    const [redirectUrl, setRedirectUrl] = useState("");

    useEffect(() => {
        const proofData = sessionStorage.getItem("poaProof");
        if (!proofData) {
            navigate("/start");
            return;
        }

        const parsed = JSON.parse(proofData);
        setProof(parsed);

        // In real implementation, this would redirect back to course platform
        // Format: https://course-platform.com/lesson-complete?proofId=XYZ
        const mockRedirectUrl = `https://course-platform.com/lesson-complete?proofId=${parsed.proofId}`;
        setRedirectUrl(mockRedirectUrl);
    }, [navigate]);

    const handleRedirect = () => {
        // In production, this would redirect to the actual course platform
        alert(`In production, you would be redirected to:\n${redirectUrl}`);

        // Clear session data
        sessionStorage.removeItem("poaSession");
        sessionStorage.removeItem("poaProof");

        // For demo, go back to start
        navigate("/start");
    };

    if (!proof) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
                {/* Success Icon */}
                <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                        <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Attention Verified!</h1>
                    <p className="text-gray-600">Your proof of attention has been generated</p>
                </div>

                {/* Proof Details */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Proof Details</h2>

                    <div className="space-y-3">
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-600">Proof ID:</span>
                            <span className="text-sm font-mono text-gray-900 text-right break-all ml-4">{proof.proofId}</span>
                        </div>

                        <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-600">Session ID:</span>
                            <span className="text-sm font-mono text-gray-900 text-right break-all ml-4">{proof.sessionId}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">User ID:</span>
                            <span className="text-sm text-gray-900">{proof.userId}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Course ID:</span>
                            <span className="text-sm text-gray-900">{proof.courseId}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Lesson ID:</span>
                            <span className="text-sm text-gray-900">{proof.lessonId}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Attention Time:</span>
                            <span className="text-sm font-semibold text-green-600">{proof.attentionTime} seconds</span>
                        </div>

                        {proof.proofHash && (
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-gray-600">Proof Hash:</span>
                                <span className="text-sm font-mono text-gray-900 text-right break-all ml-4">
                                    {proof.proofHash.slice(0, 16)}...
                                </span>
                            </div>
                        )}

                        {proof.blockchainTxHash && (
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-gray-600">Blockchain TX:</span>
                                <span className="text-sm font-mono text-blue-600 text-right break-all ml-4">
                                    {proof.blockchainTxHash.slice(0, 16)}...
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Completed At:</span>
                            <span className="text-sm text-gray-900">{new Date(proof.timestamp).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Blockchain Status */}
                {proof.blockchainTxHash && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-semibold text-green-900 mb-1">✅ Stored on Shardeum</h3>
                                <p className="text-xs text-green-800">
                                    Your proof has been anchored on the blockchain and is publicly verifiable.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* What Happens Next */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">What Happened:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ Attention data encrypted with INCO (privacy-preserving)</li>
                        <li>✓ Verification computed without exposing raw data</li>
                        <li>✓ Proof metadata stored on Shardeum blockchain</li>
                        <li>• You'll be redirected back to your course platform</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleRedirect}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Return to Course Platform
                    </button>

                    <div className="text-center">
                        <a
                            href={redirectUrl}
                            className="text-sm text-gray-600 hover:text-gray-900 underline"
                            onClick={(e) => e.preventDefault()}
                        >
                            {redirectUrl}
                        </a>
                    </div>
                </div>

                {/* Privacy Note */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        Your attention data is processed securely. Only the proof metadata is stored on-chain.
                        Raw behavioral data is never publicly exposed.
                    </p>
                </div>
            </div>
        </div>
    );
}
