# Environment Variables Guide

This guide explains all environment variables used across the HungerBlock project.

## 🔐 Security Notes

- **NEVER** commit `.env` files to version control
- **NEVER** share private keys or secrets publicly
- **ROTATE** all exposed credentials immediately
- Use environment-specific `.env` files (`.env.development`, `.env.production`)

## packages/contracts/.env

```env
# Alchemy RPC URL for Sepolia (get free at https://www.alchemy.com/)
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Your MetaMask Private Key (DO NOT SHARE!)
# To export: MetaMask -> Account Details -> Export Private Key
PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# Optional: Etherscan API Key for contract verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Contract Addresses (after deployment)
HUNGERBLOCK_ADDRESS=0x
REWARD_TOKEN_ADDRESS=0x
ACHIEVEMENT_BADGE_ADDRESS=0x
```

## packages/backend/.env

```env
# Database Connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/hungerblock"

# Blockchain - Sepolia Testnet
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
HUNGERBLOCK_ADDRESS=0x
REWARD_TOKEN_ADDRESS=0x
ACHIEVEMENT_BADGE_ADDRESS=0x

# IPFS (Pinata) - Optional
PINATA_API_KEY=
PINATA_API_SECRET=
PINATA_GATEWAY=gateway.pinata.cloud

# JWT Secret (Generate a secure random string - min 32 chars)
# Use: openssl rand -base64 32
JWT_SECRET=YOUR_SECURE_RANDOM_SECRET_KEY_MIN_32_CHARS

# Redis
REDIS_URL=redis://localhost:6379

# API Port
PORT=4000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## packages/frontend/.env.local

```env
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
VITE_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID

# Backend API URL
VITE_BACKEND_URL=http://localhost:4000

# Smart Contract Address (after deployment)
VITE_CONTRACT_ADDRESS=0x

# Chain ID (11155111 for Sepolia)
VITE_CHAIN_ID=11155111
```

## Getting API Keys

### 1. Alchemy
1. Go to https://www.alchemy.com/
2. Sign up for free
3. Create a new app on Sepolia testnet
4. Copy the HTTP URL to your `.env`

### 2. WalletConnect
1. Go to https://cloud.walletconnect.com/
2. Create a new project
3. Copy the Project ID to your frontend `.env`

### 3. Pinata (Optional)
1. Go to https://www.pinata.cloud/
2. Sign up for free tier
3. Create API keys in Settings
4. Add to backend `.env`

### 4. Etherscan (Optional)
1. Go to https://etherscan.io/
2. Sign up for free account
3. Generate API key in Account Settings
4. Add to contracts `.env`

## Generating Secure Secrets

### JWT Secret
```bash
openssl rand -base64 32
```

### Private Key (from MetaMask)
1. Open MetaMask
2. Click 3 dots on account
3. Select "Account Details"
4. Click "Export Private Key"
5. Enter password
6. Copy the key (starts with hex digits)

## Production Deployment

For production, use:
- Separate RPC URLs with higher rate limits
- Production contract addresses
- Stronger JWT secrets
- HTTPS URLs for all services
- Proper CORS origins
