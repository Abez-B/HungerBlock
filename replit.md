# HungerBlock

A Web3 Food Redistribution Platform on Polygon/Ethereum blockchain, with both a web app and a mobile app.

## Overview

HungerBlock connects surplus food from restaurants and hotels with NGOs who need it most. Every donation is transparent, verified by AI, and rewarded with blockchain tokens.

## Project Structure

```
packages/
  frontend/     # React + Vite + TailwindCSS frontend (port 5000)
  backend/      # Express + Prisma + PostgreSQL + Redis backend (port 4000)
  contracts/    # Hardhat smart contracts (Solidity)
  ai-service/   # Flask AI food classification service (port 5001)

mobile/         # Expo (React Native) mobile app (port 8080)
```

## Mobile App (Expo)

Located at `mobile/` — an Expo + React Native app with 4 tabs:

- **Home** — Impact stats, quick actions, recent donations feed, urgent request banner
- **Donations** — Searchable/filterable list of active food donations
- **Requests** — NGO food requests with urgency-level filtering
- **Profile** — Wallet connection, achievements, personal stats, settings

Modal screens:
- **Donate** — 3-step donation flow (select food → details → review)
- **Request** — Single-step request form with urgency selector

**Design tokens** match the web app: forest green primary (#047A52), orange gradient (#E05D04→#F5891A), Inter font, 12px radius cards.

**Workflow**: `Start Mobile` — `cd mobile && npx expo start --web --port 8080`
**Preview**: Switch the preview pane to port 8080 to see the web version of the mobile app.
**Physical device**: Scan the QR code shown in the `Start Mobile` console with the Expo Go app.

## Web Architecture

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

## Workflows

- `Start application` — Web frontend on port 5000 (webview)
- `Start Mobile` — Expo mobile app on port 8080 (console, QR code for Expo Go)

## Key Files

### Web
- `packages/frontend/src/App.tsx` - Main React app with routing
- `packages/frontend/src/providers/Web3Provider.tsx` - Web3 wallet configuration
- `packages/frontend/src/pages/` - Page components
- `packages/frontend/src/components/` - Reusable UI components
- `packages/contracts/contracts/HungerBlock.sol` - Main smart contract

### Mobile
- `mobile/app/_layout.tsx` - Root layout with providers
- `mobile/app/(tabs)/` - Tab screens (index, donations, requests, profile)
- `mobile/app/donate.tsx` - Donate modal screen
- `mobile/app/request.tsx` - Request modal screen
- `mobile/constants/colors.ts` - Design tokens (synced with web CSS)
- `mobile/constants/mockData.ts` - Mock data (donations, requests, stats)
- `mobile/components/` - DonationCard, RequestCard, StatCard, ErrorBoundary

## Notes

- Contract ABI stub is at `packages/contracts/artifacts/contracts/HungerBlock.sol/HungerBlock.json`
- Backend requires PostgreSQL and Redis (see docker-compose.yml)
- Mobile app uses mock data — no backend required to run
- Mobile can be tested on a physical device via Expo Go (scan QR code from Start Mobile console)
