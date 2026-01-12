# POA Deployment Guide

## 🚀 Production Deployment Checklist

### Phase 1: Smart Contract Deployment

#### Deploy on INCO Network

1. **Setup INCO Environment**
```bash
# Install INCO SDK
npm install @inco-network/sdk

# Get testnet tokens from faucet
# Visit: docs.inco.org/faucet
```

2. **Create Smart Contract** (`contracts/POAVerification.sol`):
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@inco-network/contracts/FHE.sol";

contract POAVerification {
    // Store encrypted attention data
    mapping(bytes32 => euint32) private encryptedAttentionData;
    
    function storeEncryptedData(
        bytes32 sessionId, 
        euint32 calldata encryptedTime
    ) external {
        encryptedAttentionData[sessionId] = encryptedTime;
    }
    
    function verifyThreshold(
        bytes32 sessionId, 
        euint32 threshold
    ) external view returns (ebool) {
        return FHE.gte(encryptedAttentionData[sessionId], threshold);
    }
}
```

3. **Deploy to INCO Rivest Testnet:**
```bash
# Configure hardhat.config.js with INCO RPC
npx hardhat run scripts/deploy-inco.js --network inco-testnet
```

#### Deploy on Shardeum Network

1. **Setup Shardeum Environment**
```bash
# Get testnet SHM from faucet
# Visit: docs.shardeum.org/faucet
```

2. **Create Smart Contract** (`contracts/POAProofRegistry.sol`):
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract POAProofRegistry {
    struct Proof {
        string sessionId;
        bytes32 proofHash;
        bool verified;
        uint256 attentionTime;
        uint256 timestamp;
    }
    
    mapping(string => Proof) public proofs;
    
    event ProofStored(
        string indexed proofId,
        string sessionId,
        bool verified,
        uint256 timestamp
    );
    
    function storeProof(
        string calldata proofId,
        string calldata sessionId,
        bytes32 proofHash,
        bool verified,
        uint256 attentionTime
    ) external returns (bool) {
        require(proofs[proofId].timestamp == 0, "Proof already exists");
        
        proofs[proofId] = Proof({
            sessionId: sessionId,
            proofHash: proofHash,
            verified: verified,
            attentionTime: attentionTime,
            timestamp: block.timestamp
        });
        
        emit ProofStored(proofId, sessionId, verified, block.timestamp);
        return true;
    }
    
    function getProof(string calldata proofId) 
        external 
        view 
        returns (Proof memory) 
    {
        return proofs[proofId];
    }
    
    function verifyProof(string calldata proofId) 
        external 
        view 
        returns (bool) 
    {
        return proofs[proofId].verified && proofs[proofId].timestamp > 0;
    }
}
```

3. **Deploy to Shardeum Sphinx Testnet:**
```bash
# Configure hardhat.config.js with Shardeum RPC
npx hardhat run scripts/deploy-shardeum.js --network shardeum-testnet
```

### Phase 2: Backend Configuration

1. **Update Environment Variables** (`backend/.env`):
```env
PORT=3001
NODE_ENV=production

# INCO Configuration
INCO_RPC_URL=https://validator.rivest.inco.org
INCO_CHAIN_ID=9090
INCO_PRIVATE_KEY=<your_deployed_wallet_private_key>
INCO_CONTRACT_ADDRESS=<deployed_inco_contract_address>

# Shardeum Configuration
SHARDEUM_RPC_URL=https://api-mezame.shardeum.org
SHARDEUM_CHAIN_ID=8119
SHARDEUM_PRIVATE_KEY=<your_deployed_wallet_private_key>
POA_CONTRACT_ADDRESS=<deployed_shardeum_contract_address>

# Database (Production)
DATABASE_URL=postgresql://user:pass@host:5432/poa_db
REDIS_URL=redis://localhost:6379
```

2. **Add Production Dependencies:**
```bash
cd backend
npm install pg redis ioredis
```

3. **Update Services for Real Blockchain:**

Edit `backend/src/services/inco.ts`:
```typescript
import { FhenixClient } from '@inco-network/sdk';

// Initialize real INCO client
const fhenixClient = new FhenixClient({
  provider: process.env.INCO_RPC_URL
});

// Use real FHE encryption
const encrypted = await fhenixClient.encrypt(attentionData.timeSpent, 'uint32');
```

Edit `backend/src/services/shardeum.ts`:
```typescript
// Remove demo mode checks
// Use actual contract calls
const tx = await this.contract.storeProof(...);
const receipt = await tx.wait();
```

### Phase 3: Database Setup (Production)

1. **PostgreSQL Schema:**
```sql
CREATE TABLE sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    lesson_id VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    return_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proofs (
    proof_id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES sessions(session_id),
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    lesson_id VARCHAR(255) NOT NULL,
    verified BOOLEAN NOT NULL,
    attention_time INTEGER NOT NULL,
    proof_hash VARCHAR(255) NOT NULL,
    blockchain_tx_hash VARCHAR(255),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proofs_user ON proofs(user_id);
CREATE INDEX idx_proofs_course ON proofs(course_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);
```

2. **Redis Setup:**
```bash
# Install Redis
# Ubuntu: sudo apt-get install redis-server
# Mac: brew install redis
# Windows: Use Docker

# Start Redis
redis-server
```

### Phase 4: Frontend Deployment

1. **Build Frontend:**
```bash
cd frontend
npm run build
```

2. **Environment Configuration:**
```env
VITE_API_URL=https://api.poa-verify.com/api
```

3. **Deploy Options:**

**Option A: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option B: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Option C: Static Hosting**
- Upload `dist/` folder to any static host
- Configure environment variables

### Phase 5: Backend Deployment

1. **Build Backend:**
```bash
cd backend
npm run build
```

2. **Deploy Options:**

**Option A: Railway**
```bash
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
```

**Option B: Render**
```yaml
# render.yaml
services:
  - type: web
    name: poa-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```

**Option C: VPS (DigitalOcean, AWS, etc.)**
```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start dist/server.js --name poa-backend

# Setup auto-restart
pm2 startup
pm2 save
```

### Phase 6: Domain & SSL

1. **Configure Domains:**
- Frontend: `https://poa-verify.com`
- Backend: `https://api.poa-verify.com`

2. **SSL Certificates:**
- Use Let's Encrypt (free)
- Or use platform-provided SSL (Vercel, Netlify)

3. **Update CORS:**
```typescript
app.use(cors({
  origin: ['https://poa-verify.com'],
  credentials: true
}));
```

### Phase 7: Monitoring & Analytics

1. **Add Logging:**
```bash
npm install winston
```

2. **Add Monitoring:**
```bash
# Sentry for error tracking
npm install @sentry/node

# DataDog for metrics
npm install dd-trace
```

3. **Add Analytics:**
```typescript
// Track important events
- Session creations
- Verification attempts
- Proof generations
- Blockchain transactions
```

### Phase 8: Security Hardening

1. **Rate Limiting:**
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

2. **Input Validation:**
```bash
npm install joi
```

3. **Helmet for Security Headers:**
```bash
npm install helmet
```

```typescript
import helmet from 'helmet';
app.use(helmet());
```

### Phase 9: Testing in Production

1. **Test Complete Flow:**
```
Production URL: https://poa-verify.com/start?userId=test&courseId=test&lessonId=1
```

2. **Verify Blockchain Transactions:**
- Check INCO Explorer: explorer.inco.org
- Check Shardeum Explorer: https://explorer-mezame.shardeum.org/

3. **Monitor Backend:**
```bash
# Check logs
pm2 logs poa-backend

# Check status
pm2 status
```

### Phase 10: Documentation for Partners

1. **Create Integration Guide:**
```markdown
# Integrating with POA

## Step 1: Redirect User
When user starts lesson:
https://poa-verify.com/start?userId={userId}&courseId={courseId}&lessonId={lessonId}&returnUrl={yourDomain}

## Step 2: Receive Callback
POA redirects back to:
{returnUrl}/lesson-complete?proofId={proofId}

## Step 3: Verify Proof
GET https://api.poa-verify.com/api/proof/verify/{proofId}

Response:
{
  "success": true,
  "verified": true,
  "proof": { ... }
}
```

---

## 🎯 Production Checklist

### Before Launch:
- [ ] Smart contracts deployed and verified
- [ ] Backend environment variables configured
- [ ] Database schema created
- [ ] Redis configured
- [ ] Frontend built and deployed
- [ ] Backend deployed with PM2/similar
- [ ] SSL certificates active
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Monitoring tools setup
- [ ] Error tracking configured
- [ ] Documentation complete
- [ ] Integration guide ready
- [ ] Test transactions successful

### After Launch:
- [ ] Monitor error rates
- [ ] Check blockchain transaction success
- [ ] Verify proof generation working
- [ ] Monitor API response times
- [ ] Track user completion rates
- [ ] Gather feedback
- [ ] Optimize performance
- [ ] Scale as needed

---

## 📊 Cost Estimates (Monthly)

### Testnet (Free)
- INCO: Free testnet tokens
- Shardeum: Free testnet SHM
- Hosting: ~$20-50 (Render/Railway)

### Mainnet
- INCO gas fees: Variable
- Shardeum gas fees: ~$0.001 per transaction
- VPS hosting: $10-50
- Database: $15-30
- Monitoring: $0-50
- Total: ~$50-200/month

---

## 🔄 Migrating to Thinkroot (No-Code)

Since you'll rebuild with Thinkroot later:

1. **Keep APIs Intact:**
   - Thinkroot frontend calls same backend APIs
   - No changes needed to backend

2. **Recreate UI in Thinkroot:**
   - Start Session page
   - Lesson page
   - Complete page

3. **Connect to Backend:**
   - Use Thinkroot's API connector
   - Point to your Express backend

4. **Same Architecture:**
```
Thinkroot UI → Express Backend → INCO + Shardeum
```

---

**Your POA system is now production-ready!** 🚀
