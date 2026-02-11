# Backend API

Backend API for Hunger Block platform built with Node.js, Express, TypeScript, and Prisma.

## Features

- 🔐 **Authentication**: SIWE (Sign-In with Ethereum) + JWT
- 🗄️ **Database**: PostgreSQL with Prisma ORM
- ⚡ **Real-time**: Socket.io for live updates
- 🔗 **Blockchain**: Ethers.js integration with smart contracts
- 📦 **IPFS**: Pinata integration for decentralized storage
- 🤖 ** AI Proxy**: Routes to AI microservice
- 🛡️ **Security**: Helmet, CORS, rate limiting
- 📝 **Validation**: Zod schemas

## Setup

### Prerequisites

- Node.js v18+
- PostgreSQL database running
- Redis running
- Smart contracts deployed

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create `.env` file:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/hungerblock"
REDIS_URL="redis://localhost:6379"
PORT=4000

# Blockchain
ALCHEMY_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
HUNGERBLOCK_ADDRESS="0x..."
REWARD_TOKEN_ADDRESS="0x..."
ACHIEVEMENT_BADGE_ADDRESS="0x..."

# IPFS
PINATA_API_KEY="your_pinata_api_key"
PINATA_API_SECRET="your_pinata_secret"
PINATA_GATEWAY="gateway.pinata.cloud"

# JWT
JWT_SECRET="your_random_secret_key"

# Frontend
FRONTEND_URL="http://localhost:3000"

# AI Service
AI_SERVICE_URL="http://localhost:5000"
```

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - SIWE login
- `POST /api/auth/register` - Register user
- `GET /api/auth/nonce` - Get nonce for SIWE

### Users
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update profile
- `GET /api/users/:address/stats` - User statistics

### Donations
- `POST /api/donations` - Create donation
- `GET /api/donations` - List donations
- `GET /api/donations/:id` - Get donation
- `PATCH /api/donations/:id/cancel` - Cancel donation

### Requests
- `POST /api/requests` - Create request (NGO)
- `GET /api/requests` - List requests
- `GET /api/requests/:id` - Get request
- `PATCH /api/requests/:id/cancel` - Cancel request

### Matches
- `POST /api/matches` - Create match (Admin)
- `GET /api/matches` - List matches
- `POST /api/matches/:id/verify` - Verify match (Verifier)
- `GET /api/matches/suggest` - Get suggested matches

### AI
- `POST /api/ai/classify` - Classify food image
- `POST /api/ai/freshness` - Detect freshness

## WebSocket Events

### Client → Server
- `subscribe:donation` - Subscribe to donation updates
- `subscribe:request` - Subscribe to request updates

### Server → Client
- `donation:created` - New donation created
- `donation:matched` - Donation matched
- `donation:verified` - Donation verified
- `request:created` - New request created
- `match:created` - New match created
- `match:verified` - Match verified
