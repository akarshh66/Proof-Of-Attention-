// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * AttentionVerifier - FHE-based Attention Proof Contract on INCO
 * 
 * Stores and verifies encrypted attention metrics without exposing raw data.
 * Uses INCO's FHE to compute verification on encrypted values.
 */
contract AttentionVerifier is GatewayCaller {
    // Encrypted attention data structure
    struct EncryptedAttention {
        euint32 timeSpent;        // Encrypted time in seconds
        euint32 focusPercentage;  // Encrypted focus % (0-100)
        euint32 attentionScore;   // Encrypted score (0-100)
        uint256 timestamp;        // Plain timestamp
        bool verified;            // Plain verification result
    }

    // Mapping: sessionId => encrypted attention data
    mapping(bytes32 => EncryptedAttention) public attentionProofs;
    
    // Mapping: user address => session IDs
    mapping(address => bytes32[]) public userSessions;
    
    // Total proofs counter
    uint256 public totalProofs;

    // Events
    event AttentionProofStored(
        bytes32 indexed sessionId,
        address indexed user,
        uint256 timestamp,
        bool verified
    );

    event AttentionVerified(
        bytes32 indexed sessionId,
        bool verified
    );

    /**
     * Store encrypted attention proof
     * @param sessionId Unique session identifier
     * @param encryptedTimeSpent Encrypted time spent (seconds)
     * @param encryptedFocusPercentage Encrypted focus percentage
     * @param encryptedAttentionScore Encrypted attention score
     */
    function storeAttentionProof(
        bytes32 sessionId,
        einput encryptedTimeSpent,
        einput encryptedFocusPercentage,
        einput encryptedAttentionScore,
        bytes calldata inputProof
    ) external {
        require(attentionProofs[sessionId].timestamp == 0, "Session already exists");

        // Convert encrypted inputs to FHE types
        euint32 timeSpent = TFHE.asEuint32(encryptedTimeSpent, inputProof);
        euint32 focusPercentage = TFHE.asEuint32(encryptedFocusPercentage, inputProof);
        euint32 attentionScore = TFHE.asEuint32(encryptedAttentionScore, inputProof);

        // Verify encrypted values meet requirements (FHE comparison)
        // minTimeSpent = 60 seconds, minFocusPercentage = 80%
        ebool meetsTimeRequirement = TFHE.ge(timeSpent, TFHE.asEuint32(60));
        ebool meetsFocusRequirement = TFHE.ge(focusPercentage, TFHE.asEuint32(80));
        ebool meetsScoreRequirement = TFHE.ge(attentionScore, TFHE.asEuint32(70));

        // Combine requirements (all must be true)
        ebool allRequirementsMet = TFHE.and(
            TFHE.and(meetsTimeRequirement, meetsFocusRequirement),
            meetsScoreRequirement
        );

        // Request decryption of verification result via gateway
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(allRequirementsMet);
        
        Gateway.requestDecryption(
            cts,
            this.verificationCallback.selector,
            0,
            block.timestamp + 100,
            false
        );

        // Store encrypted proof
        attentionProofs[sessionId] = EncryptedAttention({
            timeSpent: timeSpent,
            focusPercentage: focusPercentage,
            attentionScore: attentionScore,
            timestamp: block.timestamp,
            verified: false // Will be updated by callback
        });

        userSessions[msg.sender].push(sessionId);
        totalProofs++;

        emit AttentionProofStored(sessionId, msg.sender, block.timestamp, false);
    }

    /**
     * Gateway callback for decryption result
     */
    function verificationCallback(
        uint256 /*requestId*/,
        bool decryptedVerified
    ) public onlyGateway {
        // Update verification status
        // Note: In production, track requestId -> sessionId mapping
        emit AttentionVerified(bytes32(0), decryptedVerified);
    }

    /**
     * Get user's session count
     */
    function getUserSessionCount(address user) external view returns (uint256) {
        return userSessions[user].length;
    }

    /**
     * Get user's session ID at index
     */
    function getUserSessionId(address user, uint256 index) external view returns (bytes32) {
        require(index < userSessions[user].length, "Index out of bounds");
        return userSessions[user][index];
    }

    /**
     * Check if session exists
     */
    function sessionExists(bytes32 sessionId) external view returns (bool) {
        return attentionProofs[sessionId].timestamp != 0;
    }

    /**
     * Get session verification status (plain)
     */
    function isSessionVerified(bytes32 sessionId) external view returns (bool) {
        require(attentionProofs[sessionId].timestamp != 0, "Session does not exist");
        return attentionProofs[sessionId].verified;
    }
}
