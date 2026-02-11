# Smart Contracts

This package contains the Solidity smart contracts for the Hunger Block platform.

## Contracts

### HungerBlock.sol
Main contract managing the donation lifecycle:
- Donation creation with IPFS metadata
- Food request management for NGOs
- Donation-request matching
- Verification and reward distribution
- Achievement milestone tracking

### RewardToken.sol
ERC-20 token (`HBR`) for incentivizing donors:
- Minted upon successful donation verification
- Reward amount based on quantity and freshness
- Used for DAO governance voting

### AchievementBadge.sol
ERC-721 NFT badges for donor achievements:
- Soul-bound (non-transferable) tokens
- Milestone-based minting (1, 10, 50, 100 donations)
- IPFS metadata for badge images

### Governance.sol
DAO governance using OpenZeppelin Governor:
- Token-weighted voting (HBR tokens)
- 10% quorum requirement
- 2-day timelock for execution
- 100 token proposal threshold

## Development

### Install Dependencies
```bash
npm install
```

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run coverage
```

### Deploy to Local Network
```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy contracts
npm run deploy:local
```

### Deploy to Sepolia Testnet
```bash
# Set up .env file first
npm run deploy:sepolia
```

### Verify on Etherscan
```bash
npm run verify:sepolia
```

## Environment Variables

Create a `.env` file:

```bash
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Contract Addresses

After deployment, save these addresses to your backend `.env`:

- `REWARD_TOKEN_ADDRESS`
- `ACHIEVEMENT_BADGE_ADDRESS`
- `HUNGERBLOCK_ADDRESS`
- `TIMELOCK_ADDRESS`
- `GOVERNANCE_ADDRESS`
