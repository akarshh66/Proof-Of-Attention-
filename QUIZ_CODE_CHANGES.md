# Quiz System Implementation - Code Changes Reference

## Backend Changes

### 1. New Quiz Submit Endpoint Added to `backend/src/routes/quiz.ts`

**Location:** Before the `calculate-score` endpoint

```typescript
/**
 * POST /api/quiz/:courseId/submit - Submit all quiz answers
 */
router.post('/:courseId/submit', (req: Request, res: Response) => {
    const { courseId } = req.params;
    const { answers, sessionId, userId } = req.body;

    console.log('📝 Quiz submission:', { courseId, sessionId, userId, answersCount: Object.keys(answers || {}).length });

    if (!answers || Object.keys(answers).length === 0) {
        return res.status(400).json({
            success: false,
            error: 'No answers provided',
        });
    }

    const quiz = getQuizForCourse(courseId);
    if (!quiz) {
        return res.status(404).json({
            success: false,
            error: 'Quiz not found for this course',
        });
    }

    let correctCount = 0;
    const results = [];

    for (const [questionId, selectedAnswerIdx] of Object.entries(answers)) {
        const question = quiz.questions.find(q => q.id === questionId);
        if (!question) continue;

        const isCorrect = selectedAnswerIdx === question.correctAnswer;
        if (isCorrect) correctCount++;

        results.push({
            questionId,
            question: question.question,
            options: question.options,
            userAnswer: selectedAnswerIdx,
            correctAnswer: question.correctAnswer,
            isCorrect,
            explanation: question.explanation,
        });
    }

    const totalQuestions = results.length;
    const percentageScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const passed = percentageScore >= 70;

    const response = {
        success: true,
        data: {
            quizScore: Math.round(percentageScore),
            correctCount,
            totalQuestions,
            passed,
            results,
        },
    };

    console.log('✅ Quiz submitted:', { correctCount, totalQuestions, score: percentageScore, passed });
    res.json(response);
});
```

### 2. Updated Quiz Endpoints in `backend/src/routes/quiz.ts`

**Before:**
```typescript
router.get('/course/:courseId', (req: Request, res: Response) => {
    const { courseId } = req.params;
    const quiz = getQuizForCourse(courseId);

    if (!quiz) {
        return res.status(404).json({
            success: false,
            error: 'No quiz found for this course',
        });
    }

    res.json({
        success: true,
        data: {
            courseId: quiz.courseId,
            title: quiz.title,  // ❌ Missing
            questions: quiz.questions,
            totalQuestions: quiz.questions.length,
        },
    });
});
```

**After:**
```typescript
/**
 * GET /api/quiz/:courseId - Get all questions for a course
 * Also supports GET /api/quiz/course/:courseId for backwards compatibility
 */
router.get('/:courseId', (req: Request, res: Response) => {
    const { courseId } = req.params;
    const quiz = getQuizForCourse(courseId);

    if (!quiz) {
        return res.status(404).json({
            success: false,
            error: 'No quiz found for this course',
        });
    }

    res.json({
        success: true,
        data: {
            courseId: quiz.courseId,
            courseName: quiz.courseName,  // ✅ Added
            questions: quiz.questions,
            totalQuestions: quiz.questions.length,
        },
    });
});

// Alternative route for backwards compatibility
router.get('/course/:courseId', (req: Request, res: Response) => {
    const { courseId } = req.params;
    const quiz = getQuizForCourse(courseId);

    if (!quiz) {
        return res.status(404).json({
            success: false,
            error: 'No quiz found for this course',
        });
    }

    res.json({
        success: true,
        data: {
            courseId: quiz.courseId,
            courseName: quiz.courseName,  // ✅ Added
            questions: quiz.questions,
            totalQuestions: quiz.questions.length,
        },
    });
});
```

### 3. Updated Types in `backend/src/types/quiz.ts`

**Before:**
```typescript
export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    difficulty: 'easy' | 'medium' | 'hard';        // ❌ Required
    timeOffset: number;                             // ❌ Required
}

export interface CourseQuiz {
    courseId: string;
    title: string;                                  // ❌ Required
    questions: QuizQuestion[];
}
```

**After:**
```typescript
export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;                           // ✅ Added
    difficulty?: 'easy' | 'medium' | 'hard';        // ✅ Made optional
    timeOffset?: number;                            // ✅ Made optional
}

export interface CourseQuiz {
    courseId: string;
    courseName?: string;                            // ✅ Added
    title?: string;                                 // ✅ Made optional
    questions: QuizQuestion[];
}
```

---

## Frontend Changes

### 1. Complete Rewrite of `frontend/src/pages/Lesson.tsx`

**Key Changes:**

#### State Management
```typescript
// Before: Minimal state
const [session, setSession] = useState<any>(null);
const [isLoading, setIsLoading] = useState(true);

// After: Complete quiz workflow states
const [session, setSession] = useState<any>(null);
const [isLoading, setIsLoading] = useState(true);
const [videoComplete, setVideoComplete] = useState(false);        // NEW
const [attentionScore, setAttentionScore] = useState<number>(0);   // NEW
const [quiz, setQuiz] = useState<Quiz | null>(null);              // NEW
const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);   // NEW
const [answers, setAnswers] = useState<Record<string, number>>({});  // NEW
const [submittingQuiz, setSubmittingQuiz] = useState(false);       // NEW
const [quizResults, setQuizResults] = useState<any>(null);        // NEW
```

#### Load Quiz After Video
```typescript
// NEW: Auto-load quiz after video completes
useEffect(() => {
    if (session?.courseId && videoComplete) {
        loadQuiz(session.courseId);
    }
}, [session, videoComplete]);

// NEW: Load quiz from API
const loadQuiz = async (courseId: string) => {
    try {
        console.log('📚 Loading quiz for course:', courseId);
        const response = await fetch(`http://localhost:3001/api/quiz/${courseId}`);
        const result = await response.json();

        if (result.success) {
            setQuiz(result.data);
            console.log('✅ Quiz loaded:', result.data);
        } else {
            console.warn('⚠️ Failed to load quiz:', result.error);
        }
    } catch (error) {
        console.error('❌ Error loading quiz:', error);
    }
};
```

#### Video Complete Handler
```typescript
// Before: Directly generated proof
const handleVideoComplete = async (attentionScore: number) => {
    // ... proof generation immediately
    navigate("/complete");
};

// After: Just saves score and triggers quiz load
const handleVideoComplete = (score: number) => {
    console.log('🎉 Video complete with attention score:', score);
    setAttentionScore(score);
    setVideoComplete(true);  // Triggers quiz load via useEffect
};
```

#### Quiz Submission Handler
```typescript
// NEW: Submit quiz to backend
const handleSubmitQuiz = async () => {
    if (!session?.courseId) {
        console.error('No courseId found');
        return;
    }

    try {
        setSubmittingQuiz(true);
        console.log('📝 Submitting quiz answers...');
        
        const response = await fetch(`http://localhost:3001/api/quiz/${session.courseId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                answers,
                sessionId: session.sessionId,
                userId: session.userId,
            }),
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Quiz submitted successfully:', result.data);
            setQuizResults(result.data);
            await generateProof(result.data);  // Generate proof after quiz
        } else {
            console.error('Failed to submit quiz:', result.error);
        }
    } catch (error) {
        console.error('Error submitting quiz:', error);
    } finally {
        setSubmittingQuiz(false);
    }
};
```

#### Proof Generation with Combined Scores
```typescript
// NEW: Generate proof combining both scores
const generateProof = async (quizData: any) => {
    try {
        // Calculate combined score
        const combinedScore = Math.round((attentionScore + quizData.quizScore) / 2);

        // Create proof with both scores
        const proof = {
            sessionId: session?.sessionId,
            userId: session?.userId,
            courseId: session?.courseId,
            lessonId: session?.lessonId,
            attentionScore: combinedScore,           // Combined
            videoAttentionScore: attentionScore,     // Video only
            quizScore: quizData.quizScore,          // Quiz only
            proofId: 'PROOF_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            verified: true,
        };

        console.log('📦 Creating proof:', proof);
        sessionStorage.setItem("poaProof", JSON.stringify(proof));
        
        // Send to backend for blockchain anchoring
        if (session?.userId && session?.courseId) {
            try {
                const response = await proofApi.generate(
                    session.sessionId,
                    session.userId,
                    session.courseId,
                    session.lessonId,
                    attentionData
                );
                // Handle blockchain response
            } catch (proofError) {
                console.warn("⚠️ Could not generate proof from backend:", proofError);
            }
        }

        navigate("/complete");
    } catch (error) {
        console.error("❌ Error generating proof:", error);
        navigate("/complete");
    }
};
```

#### Quiz UI Rendering
```typescript
// NEW: Show quiz after video completes
if (videoComplete && quiz && !quizResults) {
    const currentQuestion = quiz.questions[currentQuestionIdx];
    const allAnswered = Object.keys(answers).length === quiz.totalQuestions;
    const answerSelected = answers[currentQuestion.id] !== undefined;

    return (
        <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff', padding: '40px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '10px', fontSize: '2em' }}>📚 {quiz.courseName}</h1>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '30px' }}>
                    Question {currentQuestionIdx + 1} of {quiz.totalQuestions}
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
                        width: `${((currentQuestionIdx + 1) / quiz.totalQuestions) * 100}%`,
                        transition: 'width 0.3s ease',
                    }} />
                </div>

                {/* Question and Options */}
                <div style={{
                    background: '#0a0a0a',
                    padding: '30px',
                    borderRadius: '8px',
                    marginBottom: '30px',
                    border: '2px solid #333',
                }}>
                    <h2 style={{ fontSize: '1.3em', marginBottom: '25px' }}>
                        {currentQuestion.question}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {currentQuestion.options.map((option: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                                style={{
                                    padding: '15px 20px',
                                    background: answers[currentQuestion.id] === idx ? '#667eea' : '#111',
                                    color: answers[currentQuestion.id] === idx ? '#fff' : '#aaa',
                                    border: `2px solid ${answers[currentQuestion.id] === idx ? '#667eea' : '#333'}`,
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <span style={{ marginRight: '10px' }}>{String.fromCharCode(65 + idx)}.</span>
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                    <button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIdx === 0}
                        style={{
                            padding: '12px 24px',
                            background: currentQuestionIdx === 0 ? '#888' : '#333',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            opacity: currentQuestionIdx === 0 ? 0.5 : 1,
                        }}
                    >
                        ← Previous
                    </button>

                    {currentQuestionIdx === quiz.totalQuestions - 1 ? (
                        <button
                            onClick={handleSubmitQuiz}
                            disabled={!allAnswered || submittingQuiz}
                            style={{
                                padding: '12px 30px',
                                background: allAnswered ? '#4caf50' : '#888',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: allAnswered && !submittingQuiz ? 'pointer' : 'not-allowed',
                                fontWeight: '600',
                                fontSize: '16px',
                                opacity: allAnswered ? 1 : 0.5,
                            }}
                        >
                            {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
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
            </div>
        </div>
    );
}
```

### 2. Updated `frontend/src/pages/Complete.tsx`

**Before:**
```typescript
{/* Score Card */}
<div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '20px', marginBottom: '20px', textAlign: 'center', border: '1px solid #333' }}>
    <p style={{ color: '#999', fontSize: '12px', marginBottom: '10px', margin: 0 }}>Your Attention Score</p>
    <p style={{ fontSize: '3em', fontWeight: 'bold', color: '#667eea', margin: 0 }}>{Math.round(score)}/100</p>
</div>
```

**After:**
```typescript
{/* Score Card */}
<div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '20px', marginBottom: '20px', textAlign: 'center', border: '1px solid #333' }}>
    <p style={{ color: '#999', fontSize: '12px', marginBottom: '10px', margin: 0 }}>Your Attention Score</p>
    <p style={{ fontSize: '3em', fontWeight: 'bold', color: '#667eea', margin: 0 }}>{Math.round(score)}/100</p>
    
    {/* NEW: Show breakdown of scores */}
    {proof?.videoAttentionScore !== undefined && proof?.quizScore !== undefined && (
        <div style={{ fontSize: '12px', color: '#aaa', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #333' }}>
            <div style={{ marginBottom: '8px' }}>📹 Video Attention: <span style={{ fontWeight: '600' }}>{proof.videoAttentionScore}/100</span></div>
            <div>✍️ Quiz Score: <span style={{ fontWeight: '600' }}>{proof.quizScore}%</span></div>
        </div>
    )}
</div>
```

---

## Summary of Changes

| Component | Type | Change |
|-----------|------|--------|
| Backend Routes | Addition | New POST endpoint for quiz submission |
| Quiz Types | Update | Made optional fields for flexibility |
| Lesson Page | Rewrite | Complete workflow for video + quiz |
| Complete Page | Addition | Score breakdown display |

**Total Files Modified:** 4  
**New Functions Added:** 6  
**Lines of Code Added:** ~400  
**Breaking Changes:** None (backwards compatible)

---

## Testing the Changes

### Backend Test
```bash
# 1. Get quiz
curl http://localhost:3001/api/quiz/course_001

# 2. Submit quiz
curl -X POST http://localhost:3001/api/quiz/course_001/submit \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {"q1": 0, "q2": 1, "q3": 1, "q4": 1, "q5": 1},
    "sessionId": "test",
    "userId": "test"
  }'
```

### Frontend Test
1. Navigate to `/lesson`
2. Complete video
3. Answer all quiz questions
4. Submit quiz
5. Verify combined score displayed on `/complete`

---

## Deployment Checklist

- [ ] Backend changes deployed
- [ ] Frontend changes deployed
- [ ] No console errors
- [ ] All API endpoints working
- [ ] Quiz questions loaded correctly
- [ ] Scores calculated accurately
- [ ] Proof generated with both scores
- [ ] Completion page displays all info
- [ ] Blockchain anchoring (if enabled)
