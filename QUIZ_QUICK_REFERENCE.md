# Quiz System - Quick Reference

## 🎯 What Was Implemented

A complete quiz system that:
1. Tracks attention while watching video (0-100 score)
2. Displays quiz after video completes
3. Scores quiz answers (0-100%)
4. Combines both scores: `(Video + Quiz) / 2`
5. Generates cryptographic proof

**Flow:** Video (Attention Tracked) → Quiz (Knowledge Tested) → Combined Score → Blockchain Proof

## 📋 Available Quizzes

| Course ID | Course Name | Questions | Difficulty |
|-----------|------------|-----------|------------|
| course_001 | Introduction to React | 5 | Easy-Medium |
| course_002 | Advanced TypeScript | 5 | Medium-Hard |

Add more in: `backend/src/data/quizzes.ts`

## 🔗 Key APIs

### Get Quiz Questions
```bash
GET /api/quiz/course_001
```

### Submit Quiz
```bash
POST /api/quiz/course_001/submit
{
  "answers": {"q1": 0, "q2": 1, "q3": 0, "q4": 1, "q5": 1},
  "sessionId": "SESSION_123",
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quizScore": 80,
    "correctCount": 4,
    "totalQuestions": 5,
    "passed": true
  }
}
```

## 📊 Scoring

### Attention Score (Video)
- Increments +1 per second of active watching
- Reduced by tab switching
- Cannot skip video
- **Range:** 0-100

### Quiz Score
- Percentage of correct answers
- Must pass 70% to qualify
- **Range:** 0-100

### Final Score
- **Formula:** `(Attention + Quiz) / 2`
- **Range:** 0-100
- **Shown:** On completion page

## 🚀 Testing

### Quick Test (1-2 minutes)
1. Go to `http://localhost:5173/lesson`
2. Watch video (click "Mark Complete" for YouTube)
3. Answer quiz (all correct answers are index 0, 1, 1, 1, 1)
4. See results page with scores

### Full Test (5-10 minutes)
1. Watch full video
2. Answer quiz questions thoughtfully
3. Verify each score component
4. Check combined score calculation
5. View proof details

### API Test
```bash
# 1. Get quiz
curl http://localhost:3001/api/quiz/course_001

# 2. Submit answers
curl -X POST http://localhost:3001/api/quiz/course_001/submit \
  -H "Content-Type: application/json" \
  -d '{"answers":{"q1":0,"q2":1,"q3":1,"q4":1,"q5":1},"sessionId":"test","userId":"test"}'
```

## 📁 Files Changed

| File | Changes |
|------|---------|
| `backend/src/routes/quiz.ts` | Added submit endpoint |
| `backend/src/types/quiz.ts` | Made fields optional |
| `frontend/src/pages/Lesson.tsx` | Full rewrite - added quiz flow |
| `frontend/src/pages/Complete.tsx` | Show video + quiz scores |

## 🔧 Add New Quiz

Edit `backend/src/data/quizzes.ts`:

```typescript
{
    courseId: 'course_003',
    courseName: 'My Course',
    questions: [
        {
            id: 'q1',
            question: 'What is...?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            explanation: 'Because...'
        }
        // Add more questions
    ]
}
```

Then use: `GET /api/quiz/course_003`

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| Quiz doesn't load | Check backend running (`http://localhost:3001/health`) |
| Can't submit | Must answer all questions first |
| Scores not combined | Check both video + quiz scores exist |
| Wrong endpoint | Use `/api/quiz/course_001` not `/api/courses/quiz` |
| CORS error | Already fixed in backend |

## 📝 Debug Logs

Look in browser console for:
```
📚 Loading quiz for course: course_001
✅ Quiz loaded
📝 Submitting quiz answers...
✅ Quiz submitted successfully
📦 Creating proof
✅ Proof saved to sessionStorage
🚀 Navigating to complete page...
```

## ✅ Proof Structure

```typescript
{
    attentionScore: 78,        // FINAL: Average of video + quiz
    videoAttentionScore: 75,   // Video only
    quizScore: 80,             // Quiz percentage
    sessionId: "SESSION_...",
    userId: "user_123",
    courseId: "course_001",
    proofId: "PROOF_...",
    timestamp: 1705084800000,
    verified: true
}
```

## 🎓 Scoring Examples

**Perfect Performance:**
- Video: 95 (excellent focus)
- Quiz: 100 (all correct)
- **Final: 97.5**

**Good Performance:**
- Video: 80 (some distraction)
- Quiz: 90 (one wrong)
- **Final: 85**

**Average Performance:**
- Video: 65 (multiple tab switches)
- Quiz: 75 (3 correct, 2 wrong)
- **Final: 70**

**Low Performance:**
- Video: 40 (mostly paused)
- Quiz: 50 (guessing)
- **Final: 45**

## 🔐 Security Notes

- Answers validated against backend
- Proof immutable once generated
- Blockchain anchoring (with Shardeum)
- Privacy-preserved with INCO encryption
- Session timeout: 15 minutes

## 📞 Support

- **Implementation docs:** See `QUIZ_IMPLEMENTATION.md`
- **Test guide:** See `QUIZ_TESTING.md`
- **Full changes:** See `QUIZ_CHANGES_SUMMARY.md`
- **API docs:** See `QUIZ_API_REFERENCE.md` (if exists)

## 🎯 Next Steps

After implementation is verified:

1. **Test thoroughly** - Use test guide
2. **Deploy backend** - Upload to production
3. **Deploy frontend** - Build and upload
4. **Monitor logs** - Watch for errors
5. **Add more quizzes** - Expand course content
6. **Enable blockchain** - Configure Shardeum
7. **Add analytics** - Track user performance

## 📊 Success Metrics

Track these metrics:
- % of videos completed
- Average video attention score
- Average quiz score
- % of users passing (>50% combined)
- Average combined score
- Time to complete full flow
- Quiz submission errors

---

**Version:** 1.0  
**Last Updated:** January 13, 2026  
**Status:** ✅ Complete and Ready for Testing
