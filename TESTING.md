# POA Testing Guide

## Testing the Complete Flow

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Server runs on: http://localhost:5174

### 2. Test the User Flow

Visit this URL in your browser:
```
http://localhost:5174/start?userId=U123&courseId=C101&lessonId=L5
```

**Expected Flow:**
1. ✅ "Creating Session" screen appears
2. ✅ Automatically redirected to Lesson page
3. ✅ See attention tracking UI with:
   - Progress bar (0-100%)
   - Time counter
   - Focus indicator
   - Idle indicator
4. ✅ Wait 60 seconds while staying active
5. ✅ "Complete Lesson" button becomes enabled
6. ✅ Click button → See "Generating Proof..." message
7. ✅ Redirected to Complete page with:
   - Proof ID
   - Session details
   - Blockchain transaction hash (demo)
   - INCO encryption confirmation

### 3. Test Backend APIs Directly

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Create Session:**
```bash
curl -X POST http://localhost:3001/api/session/create \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"U123\",\"courseId\":\"C101\",\"lessonId\":\"L5\"}"
```

**Verify Attention:**
```bash
curl -X POST http://localhost:3001/api/verify/verify \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"test\",\"timeSpent\":65,\"focusEvents\":[],\"idleEvents\":[],\"activityCount\":10}"
```

**Generate Proof:**
```bash
curl -X POST http://localhost:3001/api/proof/generate \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"test\",\"userId\":\"U123\",\"courseId\":\"C101\",\"lessonId\":\"L5\",\"attentionData\":{\"sessionId\":\"test\",\"timeSpent\":65,\"focusEvents\":[],\"idleEvents\":[],\"activityCount\":10}}"
```

### 4. What to Look For

**Frontend Console (Browser DevTools):**
- Session creation logs
- Attention tracking updates
- API call responses
- Proof generation success

**Backend Console (Terminal):**
```
✅ Session created: session_xxx
🔐 Verifying attention for session: session_xxx
✅ Verification result: { verified: true, score: 85 }
🎯 Generating proof for session: session_xxx
📝 [DEMO MODE] Storing proof on Shardeum
✅ Proof generated: proof_xxx
```

### 5. Testing Attention Rules

**Test Case 1: Too Little Time**
- Leave page after 30 seconds
- Button should remain disabled
- Message: "Attention Verification in Progress..."

**Test Case 2: Lost Focus**
- Switch to another tab
- Focus indicator shows ✗ Unfocused
- Warning message appears
- Time counter pauses

**Test Case 3: Idle Detection**
- Don't move mouse for 5+ seconds
- Idle indicator shows ⏸ Idle
- Warning message appears
- Time counter pauses

**Test Case 4: Success**
- Stay focused for 60+ seconds
- Move mouse occasionally
- Button becomes green: "✓ Complete Lesson"
- Click to generate proof

### 6. Verify Blockchain Integration

When proof is generated, check the Complete page shows:
- ✅ Proof Hash (SHA-256)
- ✅ Blockchain TX Hash (mock in demo mode)
- ✅ "Stored on Shardeum" confirmation
- ✅ "Encrypted with INCO" message

### 7. Demo Mode Notes

The system runs in **demo mode** by default:
- ✅ INCO: Simulates privacy-preserving computation
- ✅ Shardeum: Generates mock transaction hashes
- ✅ All logic works identically
- ✅ Perfect for testing and development

To enable real blockchain:
1. Get INCO testnet private key from docs.inco.org
2. Get Shardeum Sphinx testnet SHM from docs.shardeum.org
3. Deploy smart contract (see backend/README.md)
4. Update backend/.env with credentials

### 8. Integration Testing

Simulate course platform integration:
```
Step 1: Course platform redirects user
→ http://localhost:5174/start?userId=U123&courseId=AI-101&lessonId=5

Step 2: User completes attention requirements
→ POA tracks and verifies

Step 3: POA redirects back with proof
→ https://course-platform.com/lesson-complete?proofId=proof_xxx

Step 4: Course platform verifies proof
→ GET http://localhost:3001/api/proof/verify/proof_xxx
→ Response: { verified: true, ... }
```

---

## Troubleshooting

**Port already in use:**
- Frontend: Change VITE port in vite.config.ts
- Backend: Change PORT in backend/.env

**CORS errors:**
- Backend CORS is enabled for all origins
- Check frontend .env has correct API_URL

**API connection failed:**
- Ensure backend is running on port 3001
- Check backend terminal for errors
- Verify frontend/.env has VITE_API_URL

**Attention not tracking:**
- Open browser DevTools console
- Check for JavaScript errors
- Ensure page has focus
- Move mouse to trigger activity

---

## Success Criteria

✅ Frontend loads without errors  
✅ Backend API responds to health check  
✅ Session creation works  
✅ Attention tracking displays real-time data  
✅ 60-second countdown completes  
✅ Complete button enables after requirements met  
✅ Proof generation succeeds  
✅ Complete page shows blockchain details  
✅ Demo mode confirms INCO and Shardeum integration  

**Your POA MVP is fully functional!** 🎉
