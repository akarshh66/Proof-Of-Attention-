# ⚡ POA Quick Start Guide

## 🚀 Start the Application (2 Commands)

### Terminal 1: Backend
```bash
cd c:\POA2\backend
npm run dev
```
✅ Backend running on **http://localhost:3001**

### Terminal 2: Frontend
```bash
cd c:\POA2\frontend
npm run dev
```
✅ Frontend running on **http://localhost:5174**

---

## 🧪 Test the System (1 URL)

Open your browser and visit:
```
http://localhost:5174/start?userId=U123&courseId=C101&lessonId=L5
```

### Expected Behavior:
1. ✅ "Creating Session" screen (1 second)
2. ✅ Redirects to Lesson page
3. ✅ See attention tracking:
   - ⏱️ Time counter (starts at 0s)
   - 👁️ Focus indicator (✓ Focused)
   - 🖱️ Activity indicator (▶ Active)
   - 📊 Progress bar (0% → 100%)
4. ✅ Wait 60 seconds (keep page focused, move mouse occasionally)
5. ✅ Button turns green: "✓ Complete Lesson"
6. ✅ Click button → "🔐 Generating Proof..."
7. ✅ Redirected to Complete page
8. ✅ See proof details with blockchain TX hash

**Total time: ~60 seconds**

---

## 📋 Quick Health Checks

### Backend Health
```bash
# Windows PowerShell
Invoke-WebRequest http://localhost:3001/health

# Or open in browser
http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T...",
  "service": "POA Backend"
}
```

### Backend Endpoints
```
http://localhost:3001/
```
Shows all available API endpoints.

### Network Info
```
http://localhost:3001/api/network
```
Shows INCO and Shardeum status (demo mode).

---

## 🎯 Testing Different Scenarios

### Scenario 1: Not Enough Time
1. Visit start URL
2. Wait only 30 seconds
3. Try to click Complete
4. ❌ Button stays disabled
5. ✅ Message: "Attention Verification in Progress..."

### Scenario 2: Lost Focus
1. Visit start URL
2. Wait 20 seconds
3. Switch to another browser tab
4. ✅ Focus indicator changes to ✗ Unfocused
5. ✅ Warning message appears
6. ✅ Time counter pauses
7. Switch back to POA tab
8. ✅ Tracking resumes

### Scenario 3: Idle Detection
1. Visit start URL
2. Wait 10 seconds
3. Don't move mouse for 5+ seconds
4. ✅ Idle indicator changes to ⏸ Idle
5. ✅ Warning message appears
6. Move mouse
7. ✅ Returns to ▶ Active

### Scenario 4: Success Path
1. Visit start URL
2. Keep POA tab focused
3. Move mouse occasionally
4. Wait full 60 seconds
5. ✅ Button turns green
6. Click Complete
7. ✅ Proof generated
8. ✅ Complete page shows all details

---

## 🐛 Troubleshooting

### Frontend won't start
```bash
# Solution 1: Restart
cd c:\POA2\frontend
npm install
npm run dev

# Solution 2: Clear cache
rd /s /q node_modules
npm install
npm run dev

# Solution 3: Check port
# If port 5174 busy, Vite will use next port (5175)
```

### Backend won't start
```bash
# Solution 1: Restart
cd c:\POA2\backend
npm install
npm run dev

# Solution 2: Check port
# Change PORT in backend/.env if 3001 is busy

# Solution 3: Check logs
# Look for error messages in terminal
```

### "Cannot connect to backend"
```bash
# Check 1: Backend running?
# Look for: "✅ Ready to receive requests" in terminal

# Check 2: Correct URL?
# frontend/.env should have:
VITE_API_URL=http://localhost:3001/api

# Check 3: Restart frontend
# Stop frontend (Ctrl+C)
# Start again: npm run dev
```

### Attention tracker not working
```bash
# Solution 1: Browser console
# Open DevTools (F12)
# Check for JavaScript errors

# Solution 2: Hard refresh
# Ctrl + F5 to clear cache

# Solution 3: Check focus
# Make sure POA tab is active (not background)
```

---

## 📖 Documentation Quick Links

- **Project Overview:** `README.md`
- **Complete Status:** `PROJECT_SUMMARY.md`
- **File Structure:** `FILE_STRUCTURE.md`
- **Testing Guide:** `TESTING.md`
- **Deployment:** `DEPLOYMENT.md`

---

## 🔑 Key URLs

### Development
- Frontend: http://localhost:5174
- Backend: http://localhost:3001
- Health: http://localhost:3001/health
- API Docs: http://localhost:3001/

### Test Flow
```
http://localhost:5174/start?userId=U123&courseId=C101&lessonId=L5
```

---

## 🎨 Visual Indicators Explained

### Progress Bar
- **Gray (0%):** Just started
- **Blue (1-99%):** In progress
- **Green (100%):** Requirement met

### Focus Status
- **✓ Green:** Tab is focused
- **✗ Red:** Tab is not focused (switched away)

### Activity Status
- **▶ Green:** User is active (moving mouse, typing)
- **⏸ Orange:** User is idle (no activity for 5+ seconds)

### Complete Button
- **Gray (disabled):** Requirements not met
- **Green (enabled):** Ready to complete
- **Blue (processing):** Generating proof

---

## 📊 Attention Rules

| Requirement | Value | Status Check |
|-------------|-------|--------------|
| **Minimum Time** | 60 seconds | timeSpent >= 60 |
| **Focus Percentage** | 80% | focusTime / totalTime >= 0.8 |
| **Maximum Idle** | 10 seconds | maxIdle <= 10 |

All three must be met to complete.

---

## 🔐 What Happens Behind the Scenes

### When You Click Complete:

1. **Frontend** collects attention data:
```javascript
{
  sessionId: "session_xxx",
  timeSpent: 65,
  focusEvents: [...],
  idleEvents: [...],
  activityCount: 13
}
```

2. **Backend** processes:
```
POST /api/proof/generate
  ↓
INCO Service: Encrypt + Verify
  ↓
Shardeum Service: Store on blockchain
  ↓
Return proof with TX hash
```

3. **Frontend** displays:
```
✅ Proof ID: proof_xxx
✅ Blockchain TX: 0xabc...
✅ Encrypted with INCO
✅ Stored on Shardeum
```

---

## 🎯 Success Indicators

You know it's working when you see:

### In Browser:
- ✅ Progress bar moves smoothly
- ✅ Time counter increments every second
- ✅ Focus indicator responds to tab changes
- ✅ Idle indicator responds to mouse movement
- ✅ Button becomes enabled at 60s
- ✅ Proof page shows blockchain TX

### In Backend Terminal:
```
✅ Session created: session_xxx
🔐 Verifying attention for session: session_xxx
✅ Verification result: { verified: true, score: 85 }
🎯 Generating proof for session: session_xxx
📝 [DEMO MODE] Storing proof on Shardeum
✅ Proof generated: proof_xxx
```

---

## 💡 Pro Tips

1. **Keep POA tab focused** - Switching tabs pauses tracking
2. **Move mouse occasionally** - Prevents idle detection
3. **Don't refresh page** - Resets progress
4. **Check both terminals** - Backend logs show what's happening
5. **Use DevTools Console** - See API responses in browser
6. **Test edge cases** - Try losing focus, going idle, etc.

---

## 🎉 Quick Demo Script (30 seconds)

For showing someone quickly:

1. Open both terminals ✓
2. Start backend: `npm run dev` ✓
3. Start frontend: `npm run dev` ✓
4. Open test URL in browser ✓
5. Point out: "See time counting, progress bar, status indicators" ✓
6. Wait 60 seconds (or skip ahead) ✓
7. Click Complete ✓
8. Show proof page: "Blockchain TX, INCO encryption" ✓
9. Done! ✓

---

## 📞 Need Help?

Check these in order:
1. **Browser console** (F12) - JavaScript errors?
2. **Backend terminal** - Server errors?
3. **Frontend terminal** - Build errors?
4. **Network tab** (DevTools) - API calls failing?
5. **Documentation** - README.md, TESTING.md

---

**That's it! You're ready to use POA! 🚀**

**Test URL to copy-paste:**
```
http://localhost:5174/start?userId=U123&courseId=C101&lessonId=L5
```

**Happy testing! 🎊**
