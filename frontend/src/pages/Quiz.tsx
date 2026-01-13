import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
}

interface QuizData {
    courseId: string;
    courseName: string;
    totalQuestions: number;
    questions: QuizQuestion[];
}

export default function Quiz() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const courseId = searchParams.get('courseId');
    const attentionScore = searchParams.get('attentionScore');
    const sessionId = sessionStorage.getItem('sessionId');
    const userId = sessionStorage.getItem('userId');

    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [showResults, setShowResults] = useState(false);
    const [quizScore, setQuizScore] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch quiz questions
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3001/api/quiz/${courseId}`);
                const result = await response.json();

                if (result.success) {
                    setQuiz(result.data);
                } else {
                    setError(result.error || 'Failed to load quiz');
                }
            } catch (err) {
                console.error('Error fetching quiz:', err);
                setError('Failed to load quiz. Check your connection.');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchQuiz();
        }
    }, [courseId]);

    const handleAnswerSelect = (optionIndex: number) => {
        if (quiz) {
            const questionId = quiz.questions[currentQuestion].id;
            setAnswers(prev => ({
                ...prev,
                [questionId]: optionIndex,
            }));
        }
    };

    const handleNextQuestion = () => {
        if (quiz && currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        try {
            setSubmitting(true);
            const response = await fetch(`http://localhost:3001/api/quiz/${courseId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            });

            const result = await response.json();

            if (result.success) {
                setQuizScore(result.data);
                setShowResults(true);
                console.log('✅ Quiz submitted successfully:', result.data);
            } else {
                setError(result.error || 'Failed to submit quiz');
            }
        } catch (err) {
            console.error('Error submitting quiz:', err);
            setError('Failed to submit quiz');
        } finally {
            setSubmitting(false);
        }
    };

    const handleContinueToProof = () => {
        sessionStorage.setItem('quizScore', quizScore.quizScore);
        sessionStorage.setItem('quizCorrect', quizScore.correctCount);
        navigate('/complete');
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', marginBottom: '15px' }}>⏳ Loading quiz...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', background: '#dc3545', padding: '30px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '18px', marginBottom: '15px' }}>❌ {error}</div>
                    <button
                        onClick={() => navigate('/courses')}
                        style={{
                            padding: '10px 20px',
                            background: '#fff',
                            color: '#dc3545',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '600',
                        }}
                    >
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return <div style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>Quiz not found</div>;
    }

    if (showResults && quizScore) {
        const combined = (parseInt(attentionScore || '0') + quizScore.quizScore) / 2;
        const passed = quizScore.passed && parseInt(attentionScore || '0') >= 50;

        return (
            <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '40px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2.5em' }}>
                        🎓 Quiz Complete!
                    </h1>

                    <div style={{
                        background: '#1a1a1a',
                        padding: '30px',
                        borderRadius: '8px',
                        marginBottom: '30px',
                        border: '2px solid #667eea',
                    }}>
                        <div style={{ marginBottom: '25px' }}>
                            <div style={{ color: '#999', marginBottom: '8px', fontSize: '12px' }}>📊 Attention Score</div>
                            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#667eea' }}>
                                {parseInt(attentionScore || '0')}/100
                            </div>
                        </div>

                        <div style={{ marginBottom: '25px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                            <div style={{ color: '#999', marginBottom: '8px', fontSize: '12px' }}>✍️ Quiz Score</div>
                            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#4caf50' }}>
                                {quizScore.quizScore}%
                            </div>
                            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>
                                {quizScore.correctCount}/{quizScore.totalQuestions} correct
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #333', paddingTop: '20px' }}>
                            <div style={{ color: '#999', marginBottom: '8px', fontSize: '12px' }}>🎯 Combined Score</div>
                            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#ffc107' }}>
                                {Math.round(combined)}/100
                            </div>
                        </div>
                    </div>

                    {/* Results Detail */}
                    <div style={{
                        background: '#1a1a1a',
                        padding: '30px',
                        borderRadius: '8px',
                        marginBottom: '30px',
                    }}>
                        <h2 style={{ marginBottom: '20px', fontSize: '1.3em' }}>📝 Quiz Results</h2>
                        {quizScore.results.map((result: any, idx: number) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '15px',
                                    marginBottom: '10px',
                                    background: result.isCorrect ? '#0d3d0d' : '#3d0d0d',
                                    border: `1px solid ${result.isCorrect ? '#4caf50' : '#dc3545'}`,
                                    borderRadius: '4px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '16px', marginRight: '10px' }}>
                                        {result.isCorrect ? '✅' : '❌'}
                                    </span>
                                    <span style={{ fontWeight: '600' }}>{result.question}</span>
                                </div>
                                {!result.isCorrect && (
                                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
                                        Your answer: <span style={{ color: '#ffc107' }}>{result.options[result.userAnswer]}</span>
                                    </div>
                                )}
                                <div style={{ fontSize: '12px', color: '#4caf50' }}>
                                    Correct answer: <span style={{ fontWeight: '600' }}>{result.options[result.correctAnswer]}</span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#999', marginTop: '8px', fontStyle: 'italic' }}>
                                    {result.explanation}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Status and Action */}
                    <div style={{
                        background: passed ? '#0d3d0d' : '#3d0d0d',
                        border: `2px solid ${passed ? '#4caf50' : '#dc3545'}`,
                        padding: '30px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        marginBottom: '30px',
                    }}>
                        <h2 style={{ fontSize: '1.5em', marginBottom: '15px' }}>
                            {passed ? '🎉 You Passed!' : '⚠️ You Did Not Pass'}
                        </h2>
                        <p style={{ color: '#aaa', marginBottom: '15px' }}>
                            {passed
                                ? `Congratulations! Your combined score of ${Math.round(combined)} qualifies you for the certificate.`
                                : `You need a combined score of at least 75 to pass. Your combined score: ${Math.round(combined)}`}
                        </p>
                        <button
                            onClick={handleContinueToProof}
                            disabled={!passed}
                            style={{
                                padding: '12px 30px',
                                background: passed ? '#667eea' : '#888',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: passed ? 'pointer' : 'not-allowed',
                                fontWeight: '600',
                                fontSize: '16px',
                                opacity: passed ? 1 : 0.5,
                            }}
                        >
                            {passed ? 'Continue to Proof' : 'Score Too Low'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!quiz.questions.length) {
        return <div style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>No questions in quiz</div>;
    }

    const currentQ = quiz.questions[currentQuestion];
    const answerSelected = answers[currentQ.id] !== undefined;
    const allAnswered = Object.keys(answers).length === quiz.questions.length;

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '40px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '10px', fontSize: '2em' }}>📚 {quiz.courseName}</h1>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '30px' }}>
                    Question {currentQuestion + 1} of {quiz.questions.length}
                </div>

                {/* Progress Bar */}
                <div style={{
                    height: '8px',
                    background: '#333',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '30px',
                }}>
                    <div style={{
                        height: '100%',
                        background: '#667eea',
                        width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
                        transition: 'width 0.3s ease',
                    }} />
                </div>

                {/* Question */}
                <div style={{
                    background: '#1a1a1a',
                    padding: '30px',
                    borderRadius: '8px',
                    marginBottom: '30px',
                    border: '2px solid #333',
                }}>
                    <h2 style={{ fontSize: '1.3em', marginBottom: '25px' }}>{currentQ.question}</h2>

                    {/* Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {currentQ.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswerSelect(idx)}
                                style={{
                                    padding: '15px 20px',
                                    background: answers[currentQ.id] === idx ? '#667eea' : '#111',
                                    color: answers[currentQ.id] === idx ? '#fff' : '#aaa',
                                    border: `2px solid ${answers[currentQ.id] === idx ? '#667eea' : '#333'}`,
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseOver={(e) => {
                                    if (answers[currentQ.id] !== idx) {
                                        (e.target as HTMLButtonElement).style.borderColor = '#667eea';
                                        (e.target as HTMLButtonElement).style.background = '#1a1a1a';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (answers[currentQ.id] !== idx) {
                                        (e.target as HTMLButtonElement).style.borderColor = '#333';
                                        (e.target as HTMLButtonElement).style.background = '#111';
                                    }
                                }}
                            >
                                <span style={{ marginRight: '10px' }}>{String.fromCharCode(65 + idx)}.</span>
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                    <button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestion === 0}
                        style={{
                            padding: '12px 24px',
                            background: currentQuestion === 0 ? '#888' : '#333',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            opacity: currentQuestion === 0 ? 0.5 : 1,
                        }}
                    >
                        ← Previous
                    </button>

                    {currentQuestion === quiz.questions.length - 1 ? (
                        <button
                            onClick={handleSubmitQuiz}
                            disabled={!allAnswered || submitting}
                            style={{
                                padding: '12px 30px',
                                background: allAnswered ? '#4caf50' : '#888',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: allAnswered && !submitting ? 'pointer' : 'not-allowed',
                                fontWeight: '600',
                                fontSize: '16px',
                                opacity: allAnswered ? 1 : 0.5,
                            }}
                        >
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            disabled={!answerSelected}
                            style={{
                                padding: '12px 24px',
                                background: answerSelected ? '#667eea' : '#888',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: answerSelected ? 'pointer' : 'not-allowed',
                                fontWeight: '600',
                                opacity: answerSelected ? 1 : 0.5,
                            }}
                        >
                            Next →
                        </button>
                    )}
                </div>

                {/* Question Map */}
                <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #333' }}>
                    <p style={{ fontSize: '12px', color: '#999', marginBottom: '15px' }}>Question Map</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '8px' }}>
                        {quiz.questions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestion(idx)}
                                style={{
                                    padding: '8px',
                                    background: idx === currentQuestion ? '#667eea' : answers[q.id] !== undefined ? '#4caf50' : '#333',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                }}
                                title={`Question ${idx + 1}`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
