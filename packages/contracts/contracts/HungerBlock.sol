// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./RewardToken.sol";
import "./AchievementBadge.sol";

/**
 * @title HungerBlock
 * @dev Main contract for food donation tracking and matching
 * @notice This contract manages the entire donation lifecycle from creation to verification
 */
contract HungerBlock is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant NGO_ROLE = keccak256("NGO_ROLE");

    RewardToken public rewardToken;
    AchievementBadge public achievementBadge;

    enum DonationStatus {
        Active,
        Matched,
        Verified,
        Cancelled
    }

    enum RequestStatus {
        Open,
        Matched,
        Fulfilled,
        Cancelled
    }

    struct Donation {
        uint256 id;
        address donor;
        string foodType;
        uint256 quantity; // in servings/kg
        string ipfsHash; // Image and metadata on IPFS
        uint256 expiryTimestamp;
        string location;
        DonationStatus status;
        uint256 createdAt;
        uint256 matchedRequestId;
        uint8 freshnessScore; // 0-100 from AI
    }

    struct FoodRequest {
        uint256 id;
        address ngo;
        string foodType;
        uint256 quantityNeeded;
        string location;
        RequestStatus status;
        uint256 createdAt;
        uint256 urgencyLevel; // 1-5, 5 being most urgent
        uint256 matchedDonationId;
    }

    struct Match {
        uint256 donationId;
        uint256 requestId;
        uint256 matchedAt;
        bool verified;
        uint256 verifiedAt;
        address verifier;
    }

// State variables
uint256 public donationCounter;
uint256 public requestCounter;
uint256 public matchCounter;

mapping(uint256 => Donation) public donations;
mapping(uint256 => FoodRequest) public requests;
mapping(uint256 => Match) public matches;
mapping(address => uint256[]) public donorDonations;
mapping(address => uint256[]) public ngoRequests;
mapping(address => uint256) public userDonationCount;
mapping(uint256 => uint256) public matchByDonation;
mapping(uint256 => uint256) public matchByRequest;

    // Reward configuration
    uint256 public rewardPerServing = 10 * 10**18; // 10 tokens per serving
    uint256 public freshnessBonus = 5 * 10**18; // Bonus for high freshness

    // Events
    event DonationCreated(
        uint256 indexed donationId,
        address indexed donor,
        string foodType,
        uint256 quantity,
        string ipfsHash
    );

    event RequestCreated(
        uint256 indexed requestId,
        address indexed ngo,
        string foodType,
        uint256 quantityNeeded
    );

    event DonationMatched(
        uint256 indexed donationId,
        uint256 indexed requestId,
        uint256 matchId
    );

    event DonationVerified(
        uint256 indexed donationId,
        address indexed verifier,
        uint256 rewardAmount
    );

    event DonationCancelled(uint256 indexed donationId);
    event RequestCancelled(uint256 indexed requestId);

    constructor(address _rewardToken, address _achievementBadge) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);

        rewardToken = RewardToken(_rewardToken);
        achievementBadge = AchievementBadge(_achievementBadge);
    }

    /**
     * @dev Create a new food donation
     * @param _foodType Type of food being donated
     * @param _quantity Quantity in servings or kg
     * @param _ipfsHash IPFS hash containing image and metadata
     * @param _expiryTimestamp When the food expires
     * @param _location Pickup location
     * @param _freshnessScore AI-generated freshness score (0-100)
     */
    function createDonation(
        string memory _foodType,
        uint256 _quantity,
        string memory _ipfsHash,
        uint256 _expiryTimestamp,
        string memory _location,
        uint8 _freshnessScore
    ) external whenNotPaused returns (uint256) {
        require(_quantity > 0, "Quantity must be greater than 0");
        require(_expiryTimestamp > block.timestamp, "Expiry must be in future");
        require(_freshnessScore <= 100, "Invalid freshness score");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");

        donationCounter++;
        uint256 donationId = donationCounter;

        donations[donationId] = Donation({
            id: donationId,
            donor: msg.sender,
            foodType: _foodType,
            quantity: _quantity,
            ipfsHash: _ipfsHash,
            expiryTimestamp: _expiryTimestamp,
            location: _location,
            status: DonationStatus.Active,
            createdAt: block.timestamp,
            matchedRequestId: 0,
            freshnessScore: _freshnessScore
        });

        donorDonations[msg.sender].push(donationId);

        emit DonationCreated(
            donationId,
            msg.sender,
            _foodType,
            _quantity,
            _ipfsHash
        );

        return donationId;
    }

    /**
     * @dev Create a food request (NGOs only)
     * @param _foodType Type of food needed
     * @param _quantityNeeded Quantity needed
     * @param _location Delivery location
     * @param _urgencyLevel Urgency from 1-5
     */
    function createRequest(
        string memory _foodType,
        uint256 _quantityNeeded,
        string memory _location,
        uint256 _urgencyLevel
    ) external onlyRole(NGO_ROLE) whenNotPaused returns (uint256) {
        require(_quantityNeeded > 0, "Quantity must be greater than 0");
        require(_urgencyLevel >= 1 && _urgencyLevel <= 5, "Invalid urgency level");

        requestCounter++;
        uint256 requestId = requestCounter;

        requests[requestId] = FoodRequest({
            id: requestId,
            ngo: msg.sender,
            foodType: _foodType,
            quantityNeeded: _quantityNeeded,
            location: _location,
            status: RequestStatus.Open,
            createdAt: block.timestamp,
            urgencyLevel: _urgencyLevel,
            matchedDonationId: 0
        });

        ngoRequests[msg.sender].push(requestId);

        emit RequestCreated(requestId, msg.sender, _foodType, _quantityNeeded);

        return requestId;
    }

    /**
     * @dev Match a donation with a request
     * @param _donationId ID of the donation
     * @param _requestId ID of the request
     */
    function matchDonation(uint256 _donationId, uint256 _requestId)
        external
        onlyRole(ADMIN_ROLE)
        whenNotPaused
        returns (uint256)
    {
        Donation storage donation = donations[_donationId];
        FoodRequest storage request = requests[_requestId];

        require(donation.status == DonationStatus.Active, "Donation not available");
        require(request.status == RequestStatus.Open, "Request not available");
        require(
            donation.quantity >= request.quantityNeeded,
            "Insufficient quantity"
        );

        // Update statuses
        donation.status = DonationStatus.Matched;
        donation.matchedRequestId = _requestId;
        request.status = RequestStatus.Matched;
        request.matchedDonationId = _donationId;

matchCounter++;
uint256 matchId = matchCounter;

matches[matchId] = Match({
  donationId: _donationId,
  requestId: _requestId,
  matchedAt: block.timestamp,
  verified: false,
  verifiedAt: 0,
  verifier: address(0)
});

matchByDonation[_donationId] = matchId;
matchByRequest[_requestId] = matchId;

emit DonationMatched(_donationId, _requestId, matchId);

return matchId;
    }

    /**
     * @dev Verify a donation delivery (Verifiers only)
     * @param _donationId ID of the donation to verify
     */
function verifyDonation(uint256 _donationId)
  external
  onlyRole(VERIFIER_ROLE)
  whenNotPaused
  nonReentrant
{
  Donation storage donation = donations[_donationId];
  require(donation.status == DonationStatus.Matched, "Donation not matched");

  uint256 requestId = donation.matchedRequestId;
  FoodRequest storage request = requests[requestId];

  donation.status = DonationStatus.Verified;
  request.status = RequestStatus.Fulfilled;

  uint256 matchId = matchByDonation[_donationId];
  require(matchId > 0, "Match not found");
  
  Match storage matchData = matches[matchId];
  matchData.verified = true;
  matchData.verifiedAt = block.timestamp;
  matchData.verifier = msg.sender;

  uint256 rewardAmount = calculateReward(donation);
  rewardToken.mint(donation.donor, rewardAmount);

  userDonationCount[donation.donor]++;

  _checkAndMintAchievements(donation.donor);

  emit DonationVerified(_donationId, msg.sender, rewardAmount);
}

    /**
     * @dev Calculate reward based on quantity and freshness
     * @param donation The donation to calculate rewards for
     */
    function calculateReward(Donation memory donation)
        internal
        view
        returns (uint256)
    {
        uint256 baseReward = donation.quantity * rewardPerServing;

        // Bonus for high freshness (score > 80)
        if (donation.freshnessScore > 80) {
            baseReward += (donation.quantity * freshnessBonus);
        }

        return baseReward;
    }

    /**
     * @dev Check and mint achievement badges based on milestones
     * @param user Address to check achievements for
     */
    function _checkAndMintAchievements(address user) internal {
        uint256 count = userDonationCount[user];

        // First donation
        if (count == 1) {
            achievementBadge.mintBadge(user, AchievementBadge.BadgeType.FIRST_DONATION, "ipfs://bronze"); // First donation
        }
        // 10 donations
        else if (count == 10) {
            achievementBadge.mintBadge(user, AchievementBadge.BadgeType.CONSISTENT_DONOR, "ipfs://silver"); // 10 donations
        }
        // 50 donations
        else if (count == 50) {
            achievementBadge.mintBadge(user, AchievementBadge.BadgeType.IMPACT_MAKER, "ipfs://gold"); // 50 donations
        }
        // 100 donations
        else if (count == 100) {
            achievementBadge.mintBadge(user, AchievementBadge.BadgeType.HUNGER_HERO, "ipfs://diamond"); // 100 donations
        }
    }

    /**
     * @dev Cancel a donation (donor only)
     * @param _donationId ID of donation to cancel
     */
    function cancelDonation(uint256 _donationId) external {
        Donation storage donation = donations[_donationId];
        require(donation.donor == msg.sender, "Not donation owner");
        require(donation.status == DonationStatus.Active, "Cannot cancel");

        donation.status = DonationStatus.Cancelled;
        emit DonationCancelled(_donationId);
    }

    /**
     * @dev Cancel a request (NGO only)
     * @param _requestId ID of request to cancel
     */
    function cancelRequest(uint256 _requestId) external {
        FoodRequest storage request = requests[_requestId];
        require(request.ngo == msg.sender, "Not request owner");
        require(request.status == RequestStatus.Open, "Cannot cancel");

        request.status = RequestStatus.Cancelled;
        emit RequestCancelled(_requestId);
    }

    // View functions
    function getDonation(uint256 _donationId)
        external
        view
        returns (Donation memory)
    {
        return donations[_donationId];
    }

    function getRequest(uint256 _requestId)
        external
        view
        returns (FoodRequest memory)
    {
        return requests[_requestId];
    }

    function getDonorDonations(address _donor)
        external
        view
        returns (uint256[] memory)
    {
        return donorDonations[_donor];
    }

    function getNgoRequests(address _ngo)
        external
        view
        returns (uint256[] memory)
    {
        return ngoRequests[_ngo];
    }

    // Admin functions
    function updateRewardConfig(uint256 _rewardPerServing, uint256 _freshnessBonus)
        external
        onlyRole(ADMIN_ROLE)
    {
        rewardPerServing = _rewardPerServing;
        freshnessBonus = _freshnessBonus;
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

function unpause() external onlyRole(ADMIN_ROLE) {
  _unpause();
}

function emergencyWithdraw(address token, uint256 amount) external onlyRole(ADMIN_ROLE) {
  if (token == address(0)) {
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
  } else {
    IERC20(token).transfer(msg.sender, amount);
  }
}

function getMatchIdByDonation(uint256 _donationId) external view returns (uint256) {
  return matchByDonation[_donationId];
}

function getMatchIdByRequest(uint256 _requestId) external view returns (uint256) {
  return matchByRequest[_requestId];
}
}
