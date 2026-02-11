// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AchievementBadge
 * @dev Soul-bound NFT badges for donor achievements
 * Cannot be transferred after minting
 */
contract AchievementBadge is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Badge types
    enum BadgeType {
        FIRST_DONATION,       // First successful donation
        CONSISTENT_DONOR,     // 10 donations
        IMPACT_MAKER,         // 50 donations
        HUNGER_HERO,          // 100 donations
        QUALITY_CHAMPION,     // 20 high-freshness donations
        VERIFIED_VETERAN      // 50 verified donations
    }

    struct Badge {
        BadgeType badgeType;
        uint256 timestamp;
        address recipient;
        string metadata;
    }

    uint256 private _nextTokenId;

    mapping(uint256 => Badge) public badges;
    mapping(address => uint256) public userBadgeCount;

    event BadgeMinted(uint256 indexed tokenId, address indexed recipient, BadgeType badgeType, string metadataURI);

    constructor() ERC721("Hunger Block - Achievement Badge", "HBA") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * Mint new achievement badge
     */
    function mintBadge(
        address recipient,
        BadgeType badgeType,
        string memory metadataURI
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, metadataURI);

        badges[tokenId] = Badge({
            badgeType: badgeType,
            timestamp: block.timestamp,
            recipient: recipient,
            metadata: metadataURI
        });

        userBadgeCount[recipient]++;

        emit BadgeMinted(tokenId, recipient, badgeType, metadataURI);

        return tokenId;
    }

    /**
     * Get all badges for a user
     */
    function getUserBadges(address user) external view returns (uint256[] memory) {
        uint256 badgeCount = userBadgeCount[user];
        uint256[] memory userBadgeIds = new uint256[](badgeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (_ownerOf(i) == user) {
                userBadgeIds[index] = i;
                index++;
            }
        }

        return userBadgeIds;
    }

    /**
     * Get badge details
     */
    function getBadge(uint256 tokenId) external view returns (Badge memory) {
        require(_ownerOf(tokenId) != address(0), "Badge does not exist");
        return badges[tokenId];
    }

    /**
     * @dev Grant minter role to HungerBlock contract
     * @param minter Address to grant minter role to
     */
    function grantMinterRole(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, minter);
    }

    /**
     * Override transfer functions to make soul-bound
     * Badges cannot be transferred except during minting
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0)) but not transfers
        if (from != address(0) && to != address(0)) {
            revert("AchievementBadge: Soul-bound tokens cannot be transferred");
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * Disable approvals
     */
    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert("AchievementBadge: Soul-bound tokens cannot be approved");
    }

    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert("AchievementBadge: Soul-bound tokens cannot be approved");
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
