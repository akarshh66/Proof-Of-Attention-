# POA Backend

Backend API for POA (Proof of Attention) system with INCO and Shardeum blockchain integration.

## Features

- ✅ Session management
- ✅ Privacy-preserving attention verification (INCO)
- ✅ On-chain proof storage (Shardeum)
- ✅ RESTful API
- ✅ TypeScript

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your blockchain credentials

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## API Endpoints

### Session Management
- `POST /api/session/create` - Create new session
- `GET /api/session/:sessionId` - Get session details

### Attention Verification
- `POST /api/verify/verify` - Verify attention data
- `GET /api/verify/rules` - Get verification rules

### Proof Generation
- `POST /api/proof/generate` - Generate proof
- `GET /api/proof/verify/:proofId` - Verify proof
- `GET /api/proof/:proofId` - Get proof details

### System
- `GET /health` - Health check
- `GET /api/network` - Network information

## Integration

### INCO (Privacy Layer)
- Encrypts attention data
- Performs privacy-preserving computation
- Generates verification without exposing raw data

### Shardeum (Blockchain)
- Stores proof metadata on-chain
- Enables public verification
- Maintains proof integrity

## Demo Mode

If blockchain credentials are not configured, the server runs in demo mode with simulated blockchain interactions.
