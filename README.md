# 🍽️ Hunger Block - Web3 Food Redistribution Platform

<div align="center">

![Hunger Block](https://img.shields.io/badge/Blockchain-Polygon-8247E5?style=for-the-badge&logo=polygon&logoColor=white)
![Testnet](https://img.shields.io/badge/Network-Mumbai-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A decentralized platform connecting food donors with NGOs to redistribute surplus food, powered by blockchain transparency and AI verification.

</div>

---

## 🌟 Overview

**Hunger Block** leverages Web3 technology to solve food waste and hunger simultaneously. Restaurants, hotels, and events can donate surplus food to verified NGOs, with every transaction recorded on the Polygon blockchain for transparency. AI-powered food quality verification ensures safety, while smart contracts automate reward distribution.

### Key Features

- 🔗 **Polygon Blockchain** - Transparent, immutable donation tracking
- 🔐 **MetaMask Integration** - Secure Web3 authentication
- 🤖 **AI Verification** - Food classification and freshness detection
- 📦 **IPFS Storage** - Decentralized image and metadata storage
- 🪙 **ERC-20 Rewards** - Incentivize donations with reward tokens
- 🏆 **ERC-721 Badges** - Achievement NFTs for milestones
- ⚡ **Real-time Updates** - WebSocket notifications
- 🗳️ **DAO Governance** - Community-driven platform rules

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Frontend
        A[Next.js 14 + TypeScript]
        B[RainbowKit + Wagmi]
        C[Tailwind CSS + Framer Motion]
    end
    
    subgraph Backend
        D[Express API]
        E[Prisma ORM]
        F[Socket.io]
        G[PostgreSQL]
        H[Redis Cache]
    end
    
    subgraph Blockchain
        I[Smart Contracts]
        J[Hardhat]
        K[Polygon Mumbai]
    end
    
    subgraph AI Service
        L[Flask API]
        M[MobileNetV2]
        N[OpenCV]
    end
    
    subgraph Storage
        O[IPFS/Pinata]
        P[Metadata]
    end
    
    A --> D
    A --> I
    B --> I
    D --> E
    D --> F
    D --> L
    D --> O
    E --> G
    F --> H
    I --> K
    L --> M
    L --> N
    O --> P
</mermaid>

---

## 📦 Project Structure

```
HungerBlock/
├── packages/
│   ├── contracts/          # Smart contracts (Hardhat + Solidity)
│   │   ├── contracts/
│   │   │   ├── HungerBlock.sol
│   │   │   ├── RewardToken.sol
│   │   │   ├── AchievementBadge.sol
│   │   │   └── Governance.sol
│   │   └── test/
│   │
│   ├── backend/            # Node.js API (Express + Prisma)
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   └── websocket/
│   │   └── prisma/
│   │
│   ├── frontend/           # Next.js 14 application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   └── public/
│   │
│   └── ai-service/         # Python Flask AI service
│       ├── models/
│       ├── routes/
│       └── app.py
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.10+
- **Docker** and Docker Compose
- **MetaMask** browser extension
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/HungerBlock.git
cd HungerBlock
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install package dependencies
npm install --workspaces
```

### 3. Set Up Environment Variables

Create `.env` files in each package (see [setup_credentials.md](docs/setup_credentials.md) for details):

```bash
# packages/contracts/.env
ALCHEMY_RPC_URL="https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY"
PRIVATE_KEY="your_wallet_private_key"
POLYGONSCAN_API_KEY="your_polygonscan_api_key"

# packages/backend/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hungerblock"
REDIS_URL="redis://localhost:6379"
ALCHEMY_RPC_URL="https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY"
PINATA_API_KEY="your_pinata_key"
PINATA_API_SECRET="your_pinata_secret"
JWT_SECRET="your_random_secret"

# packages/frontend/.env.local
NEXT_PUBLIC_ALCHEMY_ID="your_alchemy_api_key"
NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"
NEXT_PUBLIC_CHAIN_ID="80001"
```

### 4. Start Docker Services

```bash
npm run docker:up
```

This starts PostgreSQL and Redis containers.

### 5. Deploy Smart Contracts

```bash
# Start local Hardhat node (in separate terminal)
cd packages/contracts
npx hardhat node

# Deploy to local network (in another terminal)
npx hardhat run scripts/deploy.ts --network localhost

# Or deploy to Mumbai testnet
npx hardhat run scripts/deploy.ts --network mumbai
```

### 6. Run Database Migrations

```bash
cd packages/backend
npx prisma migrate dev
npx prisma generate
```

### 7. Start Development Servers

```bash
# From root directory
npm run dev
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **AI Service**: http://localhost:5000

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific packages
npm run test:contracts
npm run test:backend
npm run test:frontend

# Smart contract coverage
cd packages/contracts
npm run coverage
```

---

## 🔑 User Roles

| Role | Capabilities |
|------|-------------|
| **Donor** (Restaurant/Hotel) | Create donations, upload food images, view impact metrics, earn rewards |
| **Recipient** (NGO) | Create food requests, accept matches, schedule pickups |
| **Verifier** | Confirm successful deliveries, trigger reward distribution |
| **Admin** | Platform management, user verification, governance |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Ethers.js v6, RainbowKit, Wagmi
- **Animations**: Framer Motion
- **State**: React Context + Hooks

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Real-time**: Socket.io
- **Blockchain**: Ethers.js

### Blockchain
- **Network**: Polygon (Mumbai Testnet)
- **Language**: Solidity 0.8.19
- **Framework**: Hardhat
- **Libraries**: OpenZeppelin Contracts
- **Testing**: Chai, Ethers.js

### AI Service
- **Framework**: Flask (Python)
- **ML**: TensorFlow + MobileNetV2
- **CV**: OpenCV
- **Image Processing**: Pillow, NumPy

### Storage
- **Decentralized**: IPFS (Pinata)
- **Backup**: AWS S3 (optional)

### DevOps
- **Containers**: Docker
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (frontend), DigitalOcean (backend)

---

## 📚 Documentation

- [Setup Credentials Guide](docs/setup_credentials.md) - External services and API keys
- [Implementation Plan](docs/implementation_plan.md) - Detailed technical roadmap
- [Smart Contract Docs](packages/contracts/README.md) - Contract architecture
- [API Documentation](packages/backend/README.md) - Backend endpoints
- [Frontend Guide](packages/frontend/README.md) - UI components and hooks

---

## 🤝 Contributing

This is a learning project for Web3 development. Contributions welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenZeppelin** - Secure smart contract libraries
- **Polygon** - Scalable blockchain infrastructure
- **Pinata** - IPFS storage solution
- **Alchemy** - Blockchain development platform

---

<div align="center">

**Built with ❤️ for a sustainable future**

[Website](#) • [Documentation](#) • [Discord](#) • [Twitter](#)

</div>
