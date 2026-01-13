# Quiz System Testing Guide

## Quick Start Testing

### Prerequisites
- Backend running on `http://localhost:3001`
- Frontend running on `http://localhost:5173` (or configured port)

### Step-by-Step Test

#### 1. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### 2. Navigate to Lesson Page
```
http://localhost:5173/lesson
```

You should see:
- ✅ Video player with attention score display
- ✅ Real-time score counter (0-100)
- ✅ "Skip Prevention Notice"
- ✅ "How It Works" info card

#### 3. Complete Video
- Watch video until completion (or click "Mark Complete" for YouTube videos)
- You should see the completion screen showing your attention score
- Click "Continue to Proof"

#### 4. Answer Quiz
You should automatically see the quiz appear with:
- ✅ Course name: "Introduction to React" (for course_001)
- ✅ Question 1 of 5
- ✅ Multiple choice options
- ✅ Progress bar at top

**Expected Questions:**
1. "What is a React component?"
2. "Which hook is used to manage state?"
3. "What does JSX stand for?"
4. "When does a component re-render?"
5. "What is the purpose of the key prop?"

Answer all questions and click "Submit Quiz"

#### 5. View Results
On the completion page (/complete), you should see:
- ✅ Combined Attention Score (e.g., 82/100)
- ✅ Video Attention Score (e.g., 85/100)
- ✅ Quiz Score (e.g., 80%)
- ✅ Proof details with timestamps
- ✅ Success message about blockchain proof

### Test Scenarios

#### Scenario 1: High Attention Score
1. Watch entire video actively (no tab switches)
2. Answer all quiz questions correctly
3. **Expected:** Combined score 90+/100

#### Scenario 2: Partial Attention
1. Watch video with some tab switches
2. Answer quiz with ~60% correct
3. **Expected:** Combined score 60-70/100

#### Scenario 3: Low Attention
1. Briefly watch video, mostly pause/tab switch
2. Answer quiz with ~40% correct
3. **Expected:** Combined score 40-50/100

### API Testing with cURL

#### Get Quiz Questions
```bash
curl http://localhost:3001/api/quiz/course_001
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "courseId": "course_001",
    "courseName": "Introduction to React",
    "questions": [
      {
        "id": "q1",
        "question": "What is a React component?",
        "options": ["A function that returns JSX elements", ...],
        "correctAnswer": 0,
        "explanation": "React components are..."
      }
    ],
    "totalQuestions": 5
  }
}
```

#### Submit Quiz
```bash
curl -X POST http://localhost:3001/api/quiz/course_001/submit \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "q1": 0,
      "q2": 1,
      "q3": 1,
      "q4": 1,
      "q5": 1
    },
    "sessionId": "test-session",
    "userId": "test-user"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "quizScore": 100,
    "correctCount": 5,
    "totalQuestions": 5,
    "passed": true,
    "results": [...]
  }
}
```

### Browser Console Checks

Open DevTools (F12) and check Console for these log messages:

After video completes:
```
✅ Continue button clicked
✅ Proof saved to sessionStorage
🚀 Navigating to complete page...
```

During quiz:
```
📚 Loading quiz for course: course_001
✅ Quiz loaded: {...}
📝 Submitting quiz answers...
✅ Quiz submitted successfully: {...}
📦 Creating proof: {...}
```

### Debugging Tips

#### If quiz doesn't appear after video:
1. Check console for: `📚 Loading quiz for course:`
2. Verify `courseId` matches one in `backend/src/data/quizzes.ts`
3. Check network tab (F12 → Network) for failed requests

#### If scores seem wrong:
1. Check browser console for actual values:
   ```
   attentionScore: 75
   quizData.quizScore: 80
   combinedScore: 77
   ```
2. Verify formula in `Lesson.tsx` generateProof function
3. Check that both scores are being used

#### If submission fails:
1. Check all questions are answered (required)
2. Check network tab for error response
3. Look at backend terminal for logs
4. Verify backend is running

### Automated Testing

#### Test Script
```javascript
// Run in browser console on Lesson page

// Wait for quiz to load after video
setInterval(() => {
  const buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
    if (btn.textContent.includes('Next') || 
        btn.textContent.includes('Submit')) {
      console.log('Quiz loaded, proceeding...');
      // Auto-answer first option of each question
      const optionButtons = Array.from(document.querySelectorAll('button'))
        .filter(b => b.textContent.match(/^[A-D]\./));
      if (optionButtons.length > 0) {
        optionButtons[0].click();
        console.log('Selected option A');
      }
    }
  });
}, 1000);
```

### Performance Metrics

Expected timings:
- Video load: < 2s
- Quiz load: < 1s
- Quiz submit: < 2s
- Proof generation: < 1s
- Page navigation: < 1s

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Quiz doesn't load | Backend not running | Start backend: `npm start` |
| CORS errors | Missing CORS setup | Already configured in server.ts |
| Questions not visible | CSS issue | Check browser zoom (should be 100%) |
| Scores not calculating | Quiz data missing | Verify `quizzes.ts` has course_001 |
| Answers not saving | State not updating | Check React DevTools |

### Success Checklist

- [ ] Video loads and plays
- [ ] Attention score increments
- [ ] Video completes successfully
- [ ] Quiz appears automatically
- [ ] All 5 questions display
- [ ] Can select answers
- [ ] Can navigate between questions
- [ ] Quiz submits successfully
- [ ] Scores display on completion page
- [ ] Combined score is reasonable
- [ ] No console errors
- [ ] No network errors (all 200 status codes)
