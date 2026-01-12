import '../styles/pages.css';

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

interface ProofPageProps {
    proof: Proof;
    onBack: () => void;
}

export default function ProofPage({ proof, onBack }: ProofPageProps) {
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <div className="page proof-page">
            <div className="container">
                <div className="proof-container">
                    <div className={`proof-status ${proof.verified ? 'verified' : 'failed'}`}>
                        {proof.verified ? (
                            <>
                                <div className="checkmark">✓</div>
                                <h1>Course Completed!</h1>
                                <p>Your attention has been verified</p>
                            </>
                        ) : (
                            <>
                                <div className="x-mark">✗</div>
                                <h1>Verification Failed</h1>
                                <p>Your attention did not meet the requirements</p>
                            </>
                        )}
                    </div>

                    {proof.verified && (
                        <div className="proof-details">
                            <div className="detail-row">
                                <span className="label">Proof ID:</span>
                                <span className="value">{proof.proofId}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Session ID:</span>
                                <span className="value">{proof.sessionId}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Attention Score:</span>
                                <span className="value">{proof.attentionScore}/100</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Completed:</span>
                                <span className="value">{formatDate(proof.timestamp)}</span>
                            </div>

                            <div className="proof-certificate">
                                <h3>🎓 Certificate of Completion</h3>
                                <p>This certifies that you have successfully completed this course with verified attention.</p>
                                <div className="certificate-footer">
                                    <p>Blockchain Verified • Proof ID: {proof.proofId?.slice(0, 8)}...</p>
                                </div>
                            </div>

                            <button className="btn-primary btn-large" onClick={onBack}>
                                Continue Learning
                            </button>
                        </div>
                    )}

                    {!proof.verified && (
                        <div className="proof-details">
                            <p className="error-message">
                                Your attention score was below the required threshold. Please try again and focus on the course content.
                            </p>
                            <button className="btn-primary btn-large" onClick={onBack}>
                                Back to Courses
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
