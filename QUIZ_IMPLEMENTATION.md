# Quiz System Implementation - Complete Guide

## Overview
The quiz system is now fully integrated into the Proof of Attention platform. It works as a multi-step verification process:

**Flow:** Video Watch → Quiz → Proof Generation

## Key Features Implemented

### 1. Backend Quiz Routes (`backend/src/routes/quiz.ts`)
- **GET `/api/quiz/:courseId`** - Fetch quiz questions for a course
- **POST `/api/quiz/:courseId/submit`** - Submit quiz answers and calculate score
- **POST `/api/quiz/submit-answer`** - Submit individual answers
- **POST `/api/quiz/calculate-score`** - Calculate attention score based on quiz attempts
- **GET `/api/quiz/session/:sessionId/score`** - Retrieve quiz score for a session

### 2. Quiz Data (`backend/src/data/quizzes.ts`)
- Pre-loaded quizzes for multiple courses
- Each quiz contains questions with:
  - Multiple choice options
  - Correct answer index
  - Detailed explanations
  
**Available Courses:**
- `course_001` - Introduction to React (5 questions)
- `course_002` - Advanced TypeScript (5 questions)

### 3. Frontend Integration

#### Lesson Page (`frontend/src/pages/Lesson.tsx`)
The lesson page now orchestrates the complete flow:

1. **Video Phase**
   - Display video player with attention tracking
   - Calculate real-time attention score
   - Prevent skipping and tab switching

2. **Quiz Phase** (After video completes)
   - Load quiz questions for the course
   - Display questions one at a time
   - Allow previous/next navigation
   - Require all questions answered before submission

3. **Proof Phase**
   - Combine video attention score + quiz score
   - Calculate final combined score (average of both)
   - Generate proof with all scores
   - Navigate to completion page

#### Key State Management:
```typescript
- videoComplete: Track if video is finished
- attentionScore: Video attention score (0-100)
- quiz: Quiz data fetched from backend
- currentQuestionIdx: Current quiz question
- answers: User answers mapping
- quizResults: Quiz submission results
```

### 4. Scoring System

#### Video Attention Score (0-100)
- +1 point per second of active watching
- Tab switching and pausing reduce scoring
- Real-time display during video

#### Quiz Score (0-100%)
- Based on correct answers
- Pass threshold: 70%

#### Combined Score (Final)
- **Formula:** `(Video Score + Quiz Score) / 2`
- Used for proof generation

### 5. Quiz Submission Flow

```typescript
POST /api/quiz/{courseId}/submit
{
    answers: { questionId: selectedOptionIndex },
    sessionId: string,
    userId: string
}

Response:
{
    success: true,
    data: {
        quizScore: number (0-100),
        correctCount: number,
        totalQuestions: number,
        passed: boolean,
        results: Array<{
            questionId: string,
            question: string,
            options: string[],
            userAnswer: number,
            correctAnswer: number,
            isCorrect: boolean,
            explanation: string
        }>
    }
}
```

### 6. Proof Generation
After quiz submission, the system generates a proof containing:
```typescript
{
    sessionId: string,
    userId: string,
    courseId: string,
    lessonId: string,
    attentionScore: number, // Combined score
    videoAttentionScore: number, // Video score only
    quizScore: number, // Quiz percentage
    proofId: string,
    timestamp: number,
    verified: true,
    blockchainTxHash?: string // If anchored on Shardeum
}
```

### 7. Completion Page (`frontend/src/pages/Complete.tsx`)
Displays:
- Combined attention score
- Video attention score
- Quiz score
- Proof ID and session details
- Blockchain transaction hash (if applicable)

## Usage Flow

### For Users
1. Navigate to lesson page
2. Watch video (scoring happens automatically)
3. Video completes → Quiz appears automatically
4. Answer all quiz questions
5. Submit quiz
6. View final proof with combined scores
7. Access blockchain proof

### For Developers

#### Adding a New Quiz
Edit `backend/src/data/quizzes.ts`:
```typescript
export const courseQuizzes: CourseQuiz[] = [
    {
        courseId: 'course_003',
        courseName: 'My New Course',
        questions: [
            {
                id: 'q1',
                question: 'What is...?',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 0,
                explanation: 'This is why option A is correct...'
            }
        ]
    }
];
```

#### Modifying Scoring
Edit scoring in `Lesson.tsx`:
```typescript
// In generateProof function
const combinedScore = Math.round((attentionScore + quizData.quizScore) / 2);
// Adjust weight as needed: (attentionScore * 0.7 + quizData.quizScore * 0.3)
```

## Technical Details

### State Flow
```
VideoPlayer (attention tracking)
    ↓
handleVideoComplete()
    ↓
setVideoComplete(true)
    ↓
useEffect loads quiz
    ↓
Quiz UI displays questions
    ↓
handleSubmitQuiz()
    ↓
generateProof()
    ↓
Navigate to /complete
```

### API Endpoints
All endpoints use JSON:
- Base URL: `http://localhost:3001`
- Quiz endpoints: `/api/quiz/*`
- Proof endpoints: `/api/proof/*`

### Error Handling
- Failed quiz loads: Display warning, allow retry
- Failed submissions: Show error message
- Fallback scores: Use default 65 if no attempts

## Testing Checklist

- [ ] Video plays and tracks attention
- [ ] Quiz loads after video completes
- [ ] All quiz questions display correctly
- [ ] Quiz answers are recorded
- [ ] Quiz submission calculates score correctly
- [ ] Combined score calculated as average
- [ ] Proof generated with all scores
- [ ] Complete page displays scores properly
- [ ] Blockchain proof generated (if backend enabled)

## Troubleshooting

### Quiz not loading after video
- Check browser console for errors
- Verify backend is running: `http://localhost:3001/health`
- Check that courseId matches one in `quizzes.ts`

### Scores not combining correctly
- Verify both `attentionScore` and `quizData.quizScore` are set
- Check formula in `generateProof` function
- See browser console for debug logs

### Quiz submission fails
- Verify all questions have answers (required)
- Check network tab for 400+ errors
- Check backend logs

## Files Modified

1. **Backend**
   - `src/routes/quiz.ts` - Added/updated endpoints
   - `src/types/quiz.ts` - Updated type definitions
   - `src/data/quizzes.ts` - Already had quiz data

2. **Frontend**
   - `src/pages/Lesson.tsx` - Complete rewrite with quiz integration
   - `src/pages/Complete.tsx` - Updated to show combined scores
   - `src/components/VideoPlayer.tsx` - No changes needed

## Security Considerations

- Quiz answers are stored in sessionStorage (client-side)
- Proof is generated after both video and quiz complete
- Blockchain anchoring provides immutable record
- INCO integration provides privacy preservation

## Performance

- Quiz loads after video completes (no initial delay)
- Questions rendered one at a time (minimal DOM)
- Answers stored efficiently in memory
- Scoring calculations are O(n) where n = number of questions

## Future Enhancements

- [ ] Quiz result explanations display
- [ ] Retake quiz option
- [ ] Leaderboards by score
- [ ] Time-based scoring (faster = higher)
- [ ] Difficulty-adjusted scoring
- [ ] Adaptive quiz questions
- [ ] Video resume from where stopped
- [ ] Partial credit system
