// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * POA Proof Registry
 * Stores proof metadata on Shardeum blockchain
 */
contract POAProofRegistry {
    struct Proof {
        string sessionId;
        bytes32 proofHash;
        bool verified;
        uint256 attentionTime;
        uint256 timestamp;
    }

    mapping(string => Proof) public proofs;
    uint256 public proofCount;

    event ProofStored(
        string indexed proofId,
        string sessionId,
        bool verified,
        uint256 timestamp
    );

    /**
     * Store proof on blockchain
     */
    function storeProof(
        string calldata proofId,
        string calldata sessionId,
        bytes32 proofHash,
        bool verified,
        uint256 attentionTime
    ) external returns (bool) {
        require(proofs[proofId].timestamp == 0, "Proof already exists");

        proofs[proofId] = Proof({
            sessionId: sessionId,
            proofHash: proofHash,
            verified: verified,
            attentionTime: attentionTime,
            timestamp: block.timestamp
        });

        proofCount++;

        emit ProofStored(proofId, sessionId, verified, block.timestamp);
        return true;
    }

    /**
     * Get proof by ID
     */
    function getProof(string calldata proofId)
        external
        view
        returns (Proof memory)
    {
        require(proofs[proofId].timestamp != 0, "Proof not found");
        return proofs[proofId];
    }

    /**
     * Verify if proof exists and is valid
     */
    function verifyProof(string calldata proofId) external view returns (bool) {
        return proofs[proofId].verified && proofs[proofId].timestamp != 0;
    }

    /**
     * Get total proof count
     */
    function getTotalProofs() external view returns (uint256) {
        return proofCount;
    }
}
