# HungerBlock

A Web3 Food Redistribution Platform on Polygon/Ethereum blockchain.

## Overview

HungerBlock connects surplus food from restaurants and hotels with NGOs who need it most. Every donation is transparent, verified by AI, and rewarded with blockchain tokens.

## Project Structure

This is a monorepo with multiple packages:

```
packages/
  frontend/     # React + Vite + TailwindCSS frontend (port 5000)
  backend/      # Express + Prisma + PostgreSQL + Redis backend (port 4000)
  contracts/    # Hardhat smart contracts (Solidity)
  ai-service/   # Flask AI food classification service (port 5001)
```

## Architecture

- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui
  - Web3 integration: wagmi + viem + RainbowKit + WalletConnect
  - State management: TanStack Query
  - Routing: React Router DOM v6

- **Backend**: Express + TypeScript + Prisma ORM
  - Database: PostgreSQL
  - Cache: Redis
  - Real-time: Socket.io WebSockets
  - Auth: SIWE (Sign-In With Ethereum) + JWT

- **Smart Contracts**: Hardhat + Solidity
  - Networks: Sepolia testnet, local Hardhat node
  - Contracts: HungerBlock (main), RewardToken (ERC20), AchievementBadge (ERC721)

- **AI Service**: Flask + Python
  - Food classification using Clarifai or OpenAI
  - Freshness score detection

## Development

### Frontend only (default)
The workflow `Start application` runs the frontend on port 5000.

### Environment Variables
Frontend env file at `packages/frontend/.env`:
- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID
- `VITE_BACKEND_URL` - Backend API URL (default: http://localhost:4000)
- `VITE_CONTRACT_ADDRESS` - Deployed smart contract address
- `VITE_CHAIN_ID` - Chain ID (11155111 for Sepolia)

## Key Files

- `packages/frontend/src/App.tsx` - Main React app with routing
- `packages/frontend/src/providers/Web3Provider.tsx` - Web3 wallet configuration
- `packages/frontend/src/pages/` - Page components
- `packages/frontend/src/components/` - Reusable UI components
- `packages/frontend/src/hooks/` - Custom React hooks
- `packages/frontend/src/lib/api.ts` - API client (axios)
- `packages/contracts/contracts/HungerBlock.sol` - Main smart contract
- `packages/backend/src/index.ts` - Backend entry point
- `packages/backend/prisma/schema.prisma` - Database schema

## Notes

- Contract ABI stub is at `packages/contracts/artifacts/contracts/HungerBlock.sol/HungerBlock.json`
- To use full blockchain functionality, compile contracts with Hardhat and update the artifact
- Backend requires PostgreSQL and Redis (see docker-compose.yml)
- Empty source map files in node_modules were patched to prevent build errors
