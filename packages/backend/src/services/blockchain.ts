import { ethers } from "ethers";
import { prisma } from "../index";
import { io } from "../index";

// Import contract ABIs (will be generated from Hardhat)
import HungerBlockABI from "../../../contracts/artifacts/contracts/HungerBlock.sol/HungerBlock.json";
import RewardTokenABI from "../../../contracts/artifacts/contracts/RewardToken.sol/RewardToken.json";
import AchievementBadgeABI from "../../../contracts/artifacts/contracts/AchievementBadge.sol/AchievementBadge.json";

const RPC_URL = process.env.ALCHEMY_RPC_URL || "http://localhost:8545";
const HUNGERBLOCK_ADDRESS = process.env.HUNGERBLOCK_ADDRESS || "";
const REWARD_TOKEN_ADDRESS = process.env.REWARD_TOKEN_ADDRESS || "";
const ACHIEVEMENT_BADGE_ADDRESS = process.env.ACHIEVEMENT_BADGE_ADDRESS || "";

class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private hungerBlockContract: ethers.Contract;
    private rewardTokenContract: ethers.Contract;
    private achievementBadgeContract: ethers.Contract;

    constructor() {
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
        const signer = this.getSigner(signerPrivateKey);
        const contract = this.hungerBlockContract.connect(signer);

        const tx = await (contract as any).createDonation(
            foodType,
            quantity,
            ipfsHash,
            expiryTimestamp,
            location,
            freshnessScore
        );

        const receipt = await tx.wait();

        // Parse event to get donation ID
        const event = receipt.logs.find((log: any) => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed?.name === "DonationCreated";
            } catch {
                return false;
            }
        });

        const parsedEvent = contract.interface.parseLog(event);
        const donationId = parsedEvent?.args.donationId;

        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            donationId: Number(donationId),
        };
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
        const signer = this.getSigner(signerPrivateKey);
        const contract = this.hungerBlockContract.connect(signer);

        const tx = await (contract as any).createRequest(
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

        const parsedEvent = contract.interface.parseLog(event);
        const requestId = parsedEvent?.args.requestId;

        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            requestId: Number(requestId),
        };
    }

    /**
     * Match donation with request (admin only)
     */
    async matchDonation(
        signerPrivateKey: string,
        donationId: number,
        requestId: number
    ) {
        const signer = this.getSigner(signerPrivateKey);
        const contract = this.hungerBlockContract.connect(signer);

        const tx = await (contract as any).matchDonation(donationId, requestId);
        const receipt = await tx.wait();

        const event = receipt.logs.find((log: any) => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed?.name === "DonationMatched";
            } catch {
                return false;
            }
        });

        const parsedEvent = contract.interface.parseLog(event);
        const matchId = parsedEvent?.args.matchId;

        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            matchId: Number(matchId),
        };
    }

    /**
     * Verify donation (verifier only)
     */
    async verifyDonation(signerPrivateKey: string, donationId: number) {
        const signer = this.getSigner(signerPrivateKey);
        const contract = this.hungerBlockContract.connect(signer);

        const tx = await (contract as any).verifyDonation(donationId);
        const receipt = await tx.wait();

        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
        };
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

    /**
     * Start listening to blockchain events
     */
    async startEventListeners() {
        // Listen for DonationCreated events
        this.hungerBlockContract.on("DonationCreated", async (donationId, donor, foodType, quantity, ipfsHash) => {
            console.log(`📦 New donation created: ID ${donationId}`);

            // Emit to WebSocket
            io.emit("donation:created", {
                donationId: Number(donationId),
                donor,
                foodType,
                quantity: Number(quantity),
            });
        });

        // Listen for DonationMatched events
        this.hungerBlockContract.on("DonationMatched", async (donationId, requestId, matchId) => {
            console.log(`🤝 Donation ${donationId} matched with request ${requestId}`);

            io.emit("donation:matched", {
                donationId: Number(donationId),
                requestId: Number(requestId),
                matchId: Number(matchId),
            });
        });

        // Listen for DonationVerified events
        this.hungerBlockContract.on("DonationVerified", async (donationId, verifier, rewardAmount) => {
            console.log(`✅ Donation ${donationId} verified`);

            io.emit("donation:verified", {
                donationId: Number(donationId),
                verifier,
                rewardAmount: ethers.formatEther(rewardAmount),
            });
        });

        console.log("📡 Blockchain event listeners active");
    }

    /**
     * Stop event listeners
     */
    stopEventListeners() {
        this.hungerBlockContract.removeAllListeners();
        console.log("🔇 Blockchain event listeners stopped");
    }
}

export const blockchainService = new BlockchainService();
