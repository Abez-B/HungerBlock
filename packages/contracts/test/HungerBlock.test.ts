import { expect } from "chai";
import { ethers } from "hardhat";
import { HungerBlock, RewardToken, AchievementBadge } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("HungerBlock", function () {
    let hungerBlock: HungerBlock;
    let rewardToken: RewardToken;
    let achievementBadge: AchievementBadge;
    let owner: SignerWithAddress;
    let donor: SignerWithAddress;
    let ngo: SignerWithAddress;
    let verifier: SignerWithAddress;
    let addr1: SignerWithAddress;

    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    const NGO_ROLE = ethers.keccak256(ethers.toUtf8Bytes("NGO_ROLE"));
    const VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"));

    beforeEach(async function () {
        [owner, donor, ngo, verifier, addr1] = await ethers.getSigners();

        // Deploy RewardToken
        const RewardToken = await ethers.getContractFactory("RewardToken");
        rewardToken = await RewardToken.deploy();
        await rewardToken.waitForDeployment();

        // Deploy AchievementBadge
        const AchievementBadge = await ethers.getContractFactory("AchievementBadge");
        achievementBadge = await AchievementBadge.deploy();
        await achievementBadge.waitForDeployment();

        // Deploy HungerBlock
        const HungerBlock = await ethers.getContractFactory("HungerBlock");
        hungerBlock = await HungerBlock.deploy(
            await rewardToken.getAddress(),
            await achievementBadge.getAddress()
        );
        await hungerBlock.waitForDeployment();

        // Grant roles
        await rewardToken.grantMinterRole(await hungerBlock.getAddress());
        await achievementBadge.grantMinterRole(await hungerBlock.getAddress());
        await hungerBlock.grantRole(NGO_ROLE, ngo.address);
        await hungerBlock.grantRole(VERIFIER_ROLE, verifier.address);
    });

    describe("Donation Management", function () {
        it("Should create a donation successfully", async function () {
            const expiryTime = (await time.latest()) + 86400; // +1 day

            await expect(
                hungerBlock.connect(donor).createDonation(
                    "Pizza",
                    50, // 50 servings
                    "QmTestHash123",
                    expiryTime,
                    "123 Main St",
                    85 // freshness score
                )
            )
                .to.emit(hungerBlock, "DonationCreated")
                .withArgs(1, donor.address, "Pizza", 50, "QmTestHash123");

            const donation = await hungerBlock.getDonation(1);
            expect(donation.donor).to.equal(donor.address);
            expect(donation.foodType).to.equal("Pizza");
            expect(donation.quantity).to.equal(50);
            expect(donation.freshnessScore).to.equal(85);
            expect(donation.status).to.equal(0); // Active
        });

        it("Should reject donation with invalid parameters", async function () {
            const pastTime = (await time.latest()) - 86400; // -1 day

            await expect(
                hungerBlock.connect(donor).createDonation(
                    "Bread",
                    0, // Invalid quantity
                    "QmHash",
                    (await time.latest()) + 86400,
                    "Location",
                    80
                )
            ).to.be.revertedWith("Quantity must be greater than 0");

            await expect(
                hungerBlock.connect(donor).createDonation(
                    "Bread",
                    10,
                    "QmHash",
                    pastTime, // Invalid expiry
                    "Location",
                    80
                )
            ).to.be.revertedWith("Expiry must be in future");

            await expect(
                hungerBlock.connect(donor).createDonation(
                    "Bread",
                    10,
                    "", // Missing IPFS hash
                    (await time.latest()) + 86400,
                    "Location",
                    80
                )
            ).to.be.revertedWith("IPFS hash required");
        });

        it("Should allow donor to cancel active donation", async function () {
            const expiryTime = (await time.latest()) + 86400;

            await hungerBlock.connect(donor).createDonation(
                "Salad",
                20,
                "QmHash456",
                expiryTime,
                "456 Oak Ave",
                90
            );

            await expect(hungerBlock.connect(donor).cancelDonation(1))
                .to.emit(hungerBlock, "DonationCancelled")
                .withArgs(1);

            const donation = await hungerBlock.getDonation(1);
            expect(donation.status).to.equal(3); // Cancelled
        });

        it("Should reject cancellation by non-owner", async function () {
            const expiryTime = (await time.latest()) + 86400;

            await hungerBlock.connect(donor).createDonation(
                "Pasta",
                30,
                "QmHash789",
                expiryTime,
                "789 Elm St",
                75
            );

            await expect(
                hungerBlock.connect(addr1).cancelDonation(1)
            ).to.be.revertedWith("Not donation owner");
        });
    });

    describe("Request Management", function () {
        it("Should allow NGO to create request", async function () {
            await expect(
                hungerBlock.connect(ngo).createRequest(
                    "Vegetables",
                    100,
                    "NGO Center",
                    5 // High urgency
                )
            )
                .to.emit(hungerBlock, "RequestCreated")
                .withArgs(1, ngo.address, "Vegetables", 100);

            const request = await hungerBlock.getRequest(1);
            expect(request.ngo).to.equal(ngo.address);
            expect(request.quantityNeeded).to.equal(100);
            expect(request.urgencyLevel).to.equal(5);
            expect(request.status).to.equal(0); // Open
        });

        it("Should reject request creation from non-NGO", async function () {
            await expect(
                hungerBlock.connect(donor).createRequest(
                    "Food",
                    50,
                    "Location",
                    3
                )
            ).to.be.reverted; // AccessControl error
        });

        it("Should reject invalid request parameters", async function () {
            await expect(
                hungerBlock.connect(ngo).createRequest(
                    "Food",
                    0, // Invalid quantity
                    "Location",
                    3
                )
            ).to.be.revertedWith("Quantity must be greater than 0");

            await expect(
                hungerBlock.connect(ngo).createRequest(
                    "Food",
                    50,
                    "Location",
                    6 // Invalid urgency level (> 5)
                )
            ).to.be.revertedWith("Invalid urgency level");
        });
    });

    describe("Matching and Verification", function () {
        beforeEach(async function () {
            // Create donation
            const expiryTime = (await time.latest()) + 86400;
            await hungerBlock.connect(donor).createDonation(
                "Mixed Food",
                200,
                "QmMatchHash",
                expiryTime,
                "Downtown",
                88
            );

            // Create request
            await hungerBlock.connect(ngo).createRequest(
                "Mixed Food",
                150,
                "Downtown",
                4
            );
        });

        it("Should match donation with request", async function () {
            await expect(hungerBlock.matchDonation(1, 1))
                .to.emit(hungerBlock, "DonationMatched")
                .withArgs(1, 1, 1);

            const donation = await hungerBlock.getDonation(1);
            const request = await hungerBlock.getRequest(1);

            expect(donation.status).to.equal(1); // Matched
            expect(donation.matchedRequestId).to.equal(1);
            expect(request.status).to.equal(1); // Matched
            expect(request.matchedDonationId).to.equal(1);
        });

        it("Should verify donation and distribute rewards", async function () {
            // Match first
            await hungerBlock.matchDonation(1, 1);

            // Verify
            await expect(hungerBlock.connect(verifier).verifyDonation(1))
                .to.emit(hungerBlock, "DonationVerified");

            const donation = await hungerBlock.getDonation(1);
            const request = await hungerBlock.getRequest(1);

            expect(donation.status).to.equal(2); // Verified
            expect(request.status).to.equal(2); // Fulfilled

            // Check rewards
            const rewardBalance = await rewardToken.balanceOf(donor.address);
            expect(rewardBalance).to.be.greaterThan(0);

            // Base reward: 200 servings * 10 tokens = 2000 tokens
            // Freshness bonus (score > 80): 200 * 5 = 1000 tokens
            // Total: 3000 tokens
            const expectedReward = ethers.parseEther("3000");
            expect(rewardBalance).to.equal(expectedReward);
        });

        it("Should mint achievement badge at milestone", async function () {
            // Match and verify to complete first donation
            await hungerBlock.matchDonation(1, 1);
            await hungerBlock.connect(verifier).verifyDonation(1);

            // Check if bronze badge (badge type 1) was minted
            const hasBadge = await achievementBadge.hasBadge(donor.address, 1);
            expect(hasBadge).to.be.true;
        });

        it("Should reject verification by non-verifier", async function () {
            await hungerBlock.matchDonation(1, 1);

            await expect(
                hungerBlock.connect(donor).verifyDonation(1)
            ).to.be.reverted; // AccessControl error
        });

        it("Should reject matching with insufficient quantity", async function () {
            // Create request with more quantity than donation
            await hungerBlock.connect(ngo).createRequest(
                "Food",
                250, // More than the 200 available
                "Location",
                3
            );

            await expect(
                hungerBlock.matchDonation(1, 2)
            ).to.be.revertedWith("Insufficient quantity");
        });
    });

    describe("Achievement System", function () {
        it("Should track donation count correctly", async function () {
            const expiryTime = (await time.latest()) + 86400;

            // Create multiple donations
            for (let i = 0; i < 5; i++) {
                await hungerBlock.connect(donor).createDonation(
                    "Food",
                    10,
                    `QmHash${i}`,
                    expiryTime,
                    "Location",
                    80
                );

                await hungerBlock.connect(ngo).createRequest(
                    "Food",
                    10,
                    "Location",
                    3
                );

                await hungerBlock.matchDonation(i + 1, i + 1);
                await hungerBlock.connect(verifier).verifyDonation(i + 1);
            }

            const donationCount = await hungerBlock.userDonationCount(donor.address);
            expect(donationCount).to.equal(5);
        });
    });

    describe("Admin Functions", function () {
        it("Should allow admin to update reward configuration", async function () {
            const newRewardPerServing = ethers.parseEther("15");
            const newFreshnessBonus = ethers.parseEther("7");

            await hungerBlock.updateRewardConfig(newRewardPerServing, newFreshnessBonus);

            expect(await hungerBlock.rewardPerServing()).to.equal(newRewardPerServing);
            expect(await hungerBlock.freshnessBonus()).to.equal(newFreshnessBonus);
        });

        it("Should allow admin to pause contract", async function () {
            await hungerBlock.pause();

            const expiryTime = (await time.latest()) + 86400;

            await expect(
                hungerBlock.connect(donor).createDonation(
                    "Food",
                    10,
                    "QmHash",
                    expiryTime,
                    "Location",
                    80
                )
            ).to.be.reverted; // Pausable error
        });

        it("Should allow admin to unpause contract", async function () {
            await hungerBlock.pause();
            await hungerBlock.unpause();

            const expiryTime = (await time.latest()) + 86400;

            await expect(
                hungerBlock.connect(donor).createDonation(
                    "Food",
                    10,
                    "QmHash",
                    expiryTime,
                    "Location",
                    80
                )
            ).to.not.be.reverted;
        });
    });

    describe("View Functions", function () {
        it("Should return donor donations correctly", async function () {
            const expiryTime = (await time.latest()) + 86400;

            await hungerBlock.connect(donor).createDonation(
                "Food1",
                10,
                "QmHash1",
                expiryTime,
                "Location",
                80
            );

            await hungerBlock.connect(donor).createDonation(
                "Food2",
                20,
                "QmHash2",
                expiryTime,
                "Location",
                85
            );

            const donorDonations = await hungerBlock.getDonorDonations(donor.address);
            expect(donorDonations.length).to.equal(2);
            expect(donorDonations[0]).to.equal(1);
            expect(donorDonations[1]).to.equal(2);
        });

        it("Should return NGO requests correctly", async function () {
            await hungerBlock.connect(ngo).createRequest("Food1", 50, "Loc1", 3);
            await hungerBlock.connect(ngo).createRequest("Food2", 100, "Loc2", 5);

            const ngoRequests = await hungerBlock.getNgoRequests(ngo.address);
            expect(ngoRequests.length).to.equal(2);
            expect(ngoRequests[0]).to.equal(1);
            expect(ngoRequests[1]).to.equal(2);
        });
    });
});
