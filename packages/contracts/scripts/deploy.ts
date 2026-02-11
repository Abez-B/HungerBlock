import { ethers } from "hardhat";
import { TimelockController } from "@openzeppelin/contracts/governance/TimelockController.sol";

async function main() {
    console.log("🚀 Deploying HungerBlock contracts...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC\n");

    // 1. Deploy RewardToken
    console.log("📝 Deploying RewardToken...");
    const RewardToken = await ethers.getContractFactory("RewardToken");
    const rewardToken = await RewardToken.deploy();
    await rewardToken.waitForDeployment();
    const rewardTokenAddress = await rewardToken.getAddress();
    console.log("✅ RewardToken deployed to:", rewardTokenAddress, "\n");

    // 2. Deploy AchievementBadge
    console.log("🏆 Deploying AchievementBadge...");
    const AchievementBadge = await ethers.getContractFactory("AchievementBadge");
    const achievementBadge = await AchievementBadge.deploy();
    await achievementBadge.waitForDeployment();
    const achievementBadgeAddress = await achievementBadge.getAddress();
    console.log("✅ AchievementBadge deployed to:", achievementBadgeAddress, "\n");

    // 3. Deploy HungerBlock main contract
    console.log("🍽️  Deploying HungerBlock...");
    const HungerBlock = await ethers.getContractFactory("HungerBlock");
    const hungerBlock = await HungerBlock.deploy(rewardTokenAddress, achievementBadgeAddress);
    await hungerBlock.waitForDeployment();
    const hungerBlockAddress = await hungerBlock.getAddress();
    console.log("✅ HungerBlock deployed to:", hungerBlockAddress, "\n");

    // 4. Grant minter roles
    console.log("🔑 Granting minter roles...");
    const minterRole = await rewardToken.MINTER_ROLE();
    await rewardToken.grantRole(minterRole, hungerBlockAddress);
    console.log("✅ RewardToken minter role granted to HungerBlock");

    await achievementBadge.grantMinterRole(hungerBlockAddress);
    console.log("✅ AchievementBadge minter role granted to HungerBlock\n");

    // 5. Deploy Timelock for Governance
    console.log("⏰ Deploying TimelockController...");
    const minDelay = 2 * 24 * 60 * 60; // 2 days
    const proposers: string[] = [];
    const executors: string[] = [];
    const admin = deployer.address;

    const TimelockControllerFactory = await ethers.getContractFactory("TimelockController");
    const timelock = await TimelockControllerFactory.deploy(minDelay, proposers, executors, admin);
    await timelock.waitForDeployment();
    const timelockAddress = await timelock.getAddress();
    console.log("✅ TimelockController deployed to:", timelockAddress, "\n");

    // 6. Deploy Governance
    console.log("🗳️  Deploying HungerBlockGovernance...");
    const Governance = await ethers.getContractFactory("HungerBlockGovernance");
    const governance = await Governance.deploy(rewardTokenAddress, timelockAddress);
    await governance.waitForDeployment();
    const governanceAddress = await governance.getAddress();
    console.log("✅ Governance deployed to:", governanceAddress, "\n");

    // 7. Setup governance roles
    console.log("🔧 Setting up governance roles...");
    const proposerRole = await timelock.PROPOSER_ROLE();
    const executorRole = await timelock.EXECUTOR_ROLE();

    await timelock.grantRole(proposerRole, governanceAddress);
    await timelock.grantRole(executorRole, ethers.ZeroAddress); // Anyone can execute
    console.log("✅ Governance roles configured\n");

    // Print deployment summary
    console.log("=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 Contract Addresses:");
    console.log("─".repeat(60));
    console.log("RewardToken:", rewardTokenAddress);
    console.log("AchievementBadge:", achievementBadgeAddress);
    console.log("HungerBlock:", hungerBlockAddress);
    console.log("TimelockController:", timelockAddress);
    console.log("Governance:", governanceAddress);
    console.log("=".repeat(60));
    console.log("\n💾 Save these addresses to your .env file:");
    console.log(`REWARD_TOKEN_ADDRESS=${rewardTokenAddress}`);
    console.log(`ACHIEVEMENT_BADGE_ADDRESS=${achievementBadgeAddress}`);
    console.log(`HUNGERBLOCK_ADDRESS=${hungerBlockAddress}`);
    console.log(`TIMELOCK_ADDRESS=${timelockAddress}`);
    console.log(`GOVERNANCE_ADDRESS=${governanceAddress}`);
    console.log("\n🔍 Verify contracts on Etherscan:");
    console.log(`npx hardhat verify --network sepolia ${rewardTokenAddress}`);
    console.log(`npx hardhat verify --network sepolia ${achievementBadgeAddress}`);
    console.log(`npx hardhat verify --network sepolia ${hungerBlockAddress} ${rewardTokenAddress} ${achievementBadgeAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
