import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Complete() {
    const navigate = useNavigate();
    const [proof, setProof] = useState<any>(null);
    const [score, setScore] = useState<number>(65);

    useEffect(() => {
        console.log('📄 Complete page mounted');
        const proofData = sessionStorage.getItem("poaProof");
        const sessionData = sessionStorage.getItem("poaSession");

        console.log('  poaProof from storage:', proofData);
        console.log('  poaSession from storage:', sessionData);

        if (proofData) {
            const parsed = JSON.parse(proofData);
            console.log('  Parsed proof:', parsed);
            setProof(parsed);
            if (parsed.attentionScore) {
                setScore(parsed.attentionScore);
                console.log('  Setting score to:', parsed.attentionScore);
            }
        } else if (sessionData) {
            // If we got here without proof, still show success page
            const session = JSON.parse(sessionData);
            console.log('  No proof found, creating from session:', session);
            setProof({
                sessionId: session.sessionId,
                courseId: session.courseId,
                attentionScore: score
            });
        } else {
            console.warn('  ⚠️ No proof or session data found in storage!');
        }
    }, []);

    const handleRedirect = () => {
        const sessionData = sessionStorage.getItem("poaSession");
        if (sessionData) {
            const session = JSON.parse(sessionData);
            if (session.redirectUrl) {
                window.location.href = session.redirectUrl;
                return;
            }
        }

        // Clear session data and go back to start
        sessionStorage.removeItem("poaSession");
        sessionStorage.removeItem("poaProof");
        navigate("/start");
    };

    if (!proof) {
        return (
            <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#999' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#0a0a0a', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', padding: '40px', maxWidth: '600px', width: '100%', border: '1px solid #333' }}>
                {/* Success Icon */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '3em', marginBottom: '20px' }}>✅</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '10px', margin: 0 }}>Attention Verified!</h1>
                    <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>Your proof of attention has been generated</p>
                </div>

                {/* Score Card */}
                <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '20px', marginBottom: '20px', textAlign: 'center', border: '1px solid #333' }}>
                    <p style={{ color: '#999', fontSize: '12px', marginBottom: '10px', margin: 0 }}>Your Attention Score</p>
                    <p style={{ fontSize: '3em', fontWeight: 'bold', color: '#667eea', margin: 0 }}>{Math.round(score)}/100</p>
                </div>

                {/* Proof Details */}
                <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '20px', marginBottom: '20px', border: '1px solid #333' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '15px', margin: 0 }}>Proof Details</h2>

                    <div style={{ fontSize: '13px', color: '#bbb', lineHeight: '1.8' }}>
                        {proof.proofId && (
                            <div style={{ marginBottom: '10px' }}>
                                <span style={{ color: '#999' }}>Proof ID:</span> <span style={{ color: '#667eea', wordBreak: 'break-all' }}>{proof.proofId}</span>
                            </div>
                        )}
                        {proof.sessionId && (
                            <div style={{ marginBottom: '10px' }}>
                                <span style={{ color: '#999' }}>Session ID:</span> <span style={{ color: '#667eea', wordBreak: 'break-all' }}>{proof.sessionId}</span>
                            </div>
                        )}
                        {proof.courseId && (
                            <div style={{ marginBottom: '10px' }}>
                                <span style={{ color: '#999' }}>Course ID:</span> <span style={{ color: '#667eea' }}>{proof.courseId}</span>
                            </div>
                        )}
                        {proof.blockchainTxHash && (
                            <div style={{ marginBottom: '10px' }}>
                                <span style={{ color: '#999' }}>Shardeum TX:</span> <span style={{ color: '#2d9cdb', wordBreak: 'break-all', fontSize: '11px' }}>{proof.blockchainTxHash.slice(0, 20)}...</span>
                            </div>
                        )}
                        <div>
                            <span style={{ color: '#999' }}>Timestamp:</span> <span style={{ color: '#667eea' }}>{new Date(proof.timestamp || Date.now()).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Success Info - Prominent Block */}
                <div style={{
                    background: 'linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 100%)',
                    border: '2px solid #4a9d4a',
                    borderRadius: '12px',
                    padding: '25px',
                    marginBottom: '20px',
                    boxShadow: '0 8px 20px rgba(45, 212, 96, 0.1)'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#4ade80', marginBottom: '15px', margin: 0 }}>✅ Success!</h3>
                    <div style={{ fontSize: '14px', color: '#86efac', lineHeight: '1.8' }}>
                        <div style={{ marginBottom: '8px' }}>🔐 Attention data encrypted and processed securely with INCO</div>
                        <div style={{ marginBottom: '8px' }}>⛓️ Privacy-preserving verification completed</div>
                        <div style={{ marginBottom: '8px' }}>🏆 Proof of Attention generated and stored on Shardeum blockchain</div>
                        <div style={{ color: '#22c55e', fontWeight: '600' }}>🔗 Your proof is now permanently anchored on-chain and publicly verifiable</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                        onClick={handleRedirect}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                        }}
                    >
                        Return to Course
                    </button>
                    <button
                        onClick={() => {
                            sessionStorage.removeItem("poaSession");
                            sessionStorage.removeItem("poaProof");
                            navigate("/");
                        }}
                        style={{
                            background: '#333',
                            color: '#aaa',
                            border: '1px solid #555',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                        }}
                    >
                        Back to Courses
                    </button>
                </div>

                {/* Privacy Note */}
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #333', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                        Your attention data is processed securely. Raw behavioral data is never publicly exposed.
                    </p>
                </div>
            </div>
        </div>
    );
}
