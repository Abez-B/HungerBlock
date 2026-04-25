import { ethers } from "ethers";
import { prisma } from "../index";
import { io } from "../index";

// Import contract ABIs (will be generated from Hardhat)
import HungerBlockABI from "../../../contracts/artifacts/contracts/HungerBlock.sol/HungerBlock.json";
import RewardTokenABI from "../../../contracts/artifacts/contracts/RewardToken.sol/RewardToken.json";
import AchievementBadgeABI from "../../../contracts/artifacts/contracts/AchievementBadge.sol/AchievementBadge.json";

const RPC_URL = process.env.ALCHEMY_RPC_URL;
const HUNGERBLOCK_ADDRESS = process.env.HUNGERBLOCK_ADDRESS;
const REWARD_TOKEN_ADDRESS = process.env.REWARD_TOKEN_ADDRESS;
const ACHIEVEMENT_BADGE_ADDRESS = process.env.ACHIEVEMENT_BADGE_ADDRESS;

if (!RPC_URL || !HUNGERBLOCK_ADDRESS || !REWARD_TOKEN_ADDRESS || !ACHIEVEMENT_BADGE_ADDRESS) {
  console.warn("⚠️  Blockchain environment variables not fully configured. Some features may not work.");
}

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private hungerBlockContract: ethers.Contract;
  private rewardTokenContract: ethers.Contract;
  private achievementBadgeContract: ethers.Contract;
  private eventListenersStarted: boolean = false;

  constructor() {
    if (!RPC_URL || !HUNGERBLOCK_ADDRESS || !REWARD_TOKEN_ADDRESS || !ACHIEVEMENT_BADGE_ADDRESS) {
      console.warn("⚠️  Blockchain service initialized with missing config");
      this.provider = new ethers.JsonRpcProvider(RPC_URL || "http://localhost:8545");
      this.hungerBlockContract = new ethers.Contract(
        HUNGERBLOCK_ADDRESS || "0x0000000000000000000000000000000000000000",
        HungerBlockABI.abi,
        this.provider
      );
      this.rewardTokenContract = new ethers.Contract(
        REWARD_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
        RewardTokenABI.abi,
        this.provider
      );
      this.achievementBadgeContract = new ethers.Contract(
        ACHIEVEMENT_BADGE_ADDRESS || "0x0000000000000000000000000000000000000000",
        AchievementBadgeABI.abi,
        this.provider
      );
      return;
    }

    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    
    this.hungerBlockContract = new ethers.Contract(
      HUNGERBLOCK_ADDRESS,
      HungerBlockABI.abi,
      this.provider
    );

    this.rewardTokenContract = new ethers.Contract(
      REWARD_TOKEN_ADDRESS,
      RewardTokenABI.abi,
      this.provider
    );

    this.achievementBadgeContract = new ethers.Contract(
      ACHIEVEMENT_BADGE_ADDRESS,
      AchievementBadgeABI.abi,
      this.provider
    );
  }

    /**
     * Get signer for transaction signing
     */
    private getSigner(privateKey: string): ethers.Wallet {
        return new ethers.Wallet(privateKey, this.provider);
    }

    /**
     * Create donation on-chain
     */
async createDonation(
  signerPrivateKey: string,
  foodType: string,
  quantity: number,
  ipfsHash: string,
  expiryTimestamp: number,
  location: string,
  freshnessScore: number
) {
  try {
    const signer = this.getSigner(signerPrivateKey);
    const contract = this.hungerBlockContract.connect(signer);
    
    const tx = await (this.hungerBlockContract as any).createDonation(
      foodType,
      quantity,
      ipfsHash,
      expiryTimestamp,
      location,
      freshnessScore
    );
    
    const receipt = await tx.wait();
    
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === "DonationCreated";
      } catch {
        return false;
      }
    });
    
    const parsedEvent = event ? contract.interface.parseLog(event) : null;
    const donationId = parsedEvent?.args.donationId;
    
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      donationId: donationId ? Number(donationId) : 0,
    };
  } catch (error: any) {
    console.error('Error creating donation:', error);
    if (error.code === 'CALL_EXCEPTION') {
      throw new Error('Transaction failed - check quantity, expiry, and freshness score');
    }
    throw error;
  }
}

    /**
     * Create request on-chain
     */
async createRequest(
  signerPrivateKey: string,
  foodType: string,
  quantityNeeded: number,
  location: string,
  urgencyLevel: number
) {
  try {
    const signer = this.getSigner(signerPrivateKey);
    const contract = this.hungerBlockContract.connect(signer);
    
    const tx = await (this.hungerBlockContract as any).createRequest(
      foodType,
      quantityNeeded,
      location,
      urgencyLevel
    );
    
    const receipt = await tx.wait();
    
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === "RequestCreated";
      } catch {
        return false;
      }
    });
    
    const parsedEvent = event ? contract.interface.parseLog(event) : null;
    const requestId = parsedEvent?.args.requestId;
    
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      requestId: requestId ? Number(requestId) : 0,
    };
  } catch (error: any) {
    console.error('Error creating request:', error);
    if (error.code === 'CALL_EXCEPTION') {
      throw new Error('Transaction failed - check if you have NGO_ROLE');
    }
    throw error;
  }
}

    /**
     * Match donation with request (admin only)
     */
async matchDonation(
  signerPrivateKey: string,
  donationId: number,
  requestId: number
) {
  try {
    const signer = this.getSigner(signerPrivateKey);
    const contract = this.hungerBlockContract.connect(signer);
    
    const tx = await (this.hungerBlockContract as any).matchDonation(donationId, requestId);
    const receipt = await tx.wait();
    
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === "DonationMatched";
      } catch {
        return false;
      }
    });
    
    const parsedEvent = event ? contract.interface.parseLog(event) : null;
    const matchId = parsedEvent?.args.matchId;
    
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      matchId: matchId ? Number(matchId) : 0,
    };
  } catch (error: any) {
    console.error(`Error matching donation ${donationId}:`, error);
    if (error.code === 'CALL_EXCEPTION') {
      throw new Error('Transaction failed - check if you have ADMIN_ROLE and donation/request are available');
    }
    throw error;
  }
}

    /**
     * Verify donation (verifier only)
     */
async verifyDonation(signerPrivateKey: string, donationId: number) {
  try {
    const signer = this.getSigner(signerPrivateKey);
    const contract = this.hungerBlockContract.connect(signer);
    
    const tx = await (this.hungerBlockContract as any).verifyDonation(donationId);
    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error: any) {
    console.error(`Error verifying donation ${donationId}:`, error);
    if (error.code === 'CALL_EXCEPTION') {
      throw new Error('Transaction failed - check if you have VERIFIER_ROLE');
    }
    throw error;
  }
}

    /**
     * Get donation from blockchain
     */
    async getDonation(donationId: number) {
        const donation = await this.hungerBlockContract.getDonation(donationId);
        return donation;
    }

    /**
     * Get request from blockchain
     */
    async getRequest(requestId: number) {
        const request = await this.hungerBlockContract.getRequest(requestId);
        return request;
    }

    /**
     * Get user's reward token balance
     */
    async getRewardBalance(address: string): Promise<string> {
        const balance = await this.rewardTokenContract.balanceOf(address);
        return ethers.formatEther(balance);
    }

    /**
     * Check if user has achievement badge
     */
    async hasBadge(address: string, badgeType: number): Promise<boolean> {
        return await this.achievementBadgeContract.hasBadge(address, badgeType);
    }

async startEventListeners() {
  if (this.eventListenersStarted) {
    console.log("📡 Blockchain event listeners already running");
    return;
  }

  try {
    await this.provider.getNetwork();
    this.eventListenersStarted = true;

    this.hungerBlockContract.on("DonationCreated", async (donationId, donor, foodType, quantity, ipfsHash) => {
      console.log(`📦 New donation created: ID ${donationId}`);
      io.emit("donation:created", {
        donationId: Number(donationId),
        donor,
        foodType,
        quantity: Number(quantity),
      });
    });

    this.hungerBlockContract.on("DonationMatched", async (donationId, requestId, matchId) => {
      console.log(`🤝 Donation ${donationId} matched with request ${requestId}`);
      io.emit("donation:matched", {
        donationId: Number(donationId),
        requestId: Number(requestId),
        matchId: Number(matchId),
      });
    });

    this.hungerBlockContract.on("DonationVerified", async (donationId, verifier, rewardAmount) => {
      console.log(`✅ Donation ${donationId} verified`);
      io.emit("donation:verified", {
        donationId: Number(donationId),
        verifier,
        rewardAmount: ethers.formatEther(rewardAmount),
      });
    });

    console.log("📡 Blockchain event listeners active");
  } catch (error) {
    console.error("❌ Failed to start blockchain event listeners:", error);
    this.eventListenersStarted = false;
  }
}

    /**
     * Stop event listeners
     */
stopEventListeners() {
  if (this.eventListenersStarted) {
    this.hungerBlockContract.removeAllListeners();
    this.eventListenersStarted = false;
    console.log("🔇 Blockchain event listeners stopped");
  }
}

async getDonationWithStatus(donationId: number) {
  try {
    const donation = await this.hungerBlockContract.getDonation(donationId);
    return {
      id: Number(donation.id),
      donor: donation.donor,
      foodType: donation.foodType,
      quantity: Number(donation.quantity),
      ipfsHash: donation.ipfsHash,
      expiryTimestamp: Number(donation.expiryTimestamp),
      location: donation.location,
      status: donation.status,
      createdAt: Number(donation.createdAt),
      matchedRequestId: Number(donation.matchedRequestId),
      freshnessScore: donation.freshnessScore,
    };
  } catch (error) {
    console.error(`Error fetching donation ${donationId}:`, error);
    throw error;
  }
}

async getRequestWithStatus(requestId: number) {
  try {
    const request = await this.hungerBlockContract.getRequest(requestId);
    return {
      id: Number(request.id),
      ngo: request.ngo,
      foodType: request.foodType,
      quantityNeeded: Number(request.quantityNeeded),
      location: request.location,
      status: request.status,
      createdAt: Number(request.createdAt),
      urgencyLevel: Number(request.urgencyLevel),
      matchedDonationId: Number(request.matchedDonationId),
    };
  } catch (error) {
    console.error(`Error fetching request ${requestId}:`, error);
    throw error;
  }
}
}

export const blockchainService = new BlockchainService();
