import { ethers } from 'ethers';
import { Proof } from '../types/index.js';

/**
 * Shardeum Service - On-chain Proof Storage
 * 
 * Stores proof metadata on Shardeum blockchain
 * Does NOT store raw attention data - only verification results
 */
export class ShardeumService {
    private provider: ethers.JsonRpcProvider | null = null;
    private wallet: ethers.Wallet | null = null;
    private contract: ethers.Contract | null = null;

    // POA Smart Contract ABI (minimal for demo)
    private readonly CONTRACT_ABI = [
        'function storeProof(string sessionId, string proofId, bytes32 proofHash, bool verified, uint256 attentionTime) external returns (bool)',
        'function getProof(string proofId) external view returns (string sessionId, bytes32 proofHash, bool verified, uint256 attentionTime, uint256 timestamp)',
        'function verifyProof(string proofId) external view returns (bool)',
        'event ProofStored(string indexed proofId, string sessionId, bool verified, uint256 timestamp)'
    ];

    constructor() {
        this.initialize();
    }

    private initialize() {
        try {
            const rpcUrl = process.env.SHARDEUM_RPC_URL;
            const privateKey = process.env.SHARDEUM_PRIVATE_KEY;
            const contractAddress = process.env.POA_CONTRACT_ADDRESS;

            if (!rpcUrl) {
                console.warn('⚠️  Shardeum RPC URL not configured. Running in demo mode.');
                return;
            }

            this.provider = new ethers.JsonRpcProvider(rpcUrl);

            if (privateKey && privateKey.length > 0) {
                this.wallet = new ethers.Wallet(privateKey, this.provider);
            }

            if (contractAddress && this.wallet) {
                this.contract = new ethers.Contract(
                    contractAddress,
                    this.CONTRACT_ABI,
                    this.wallet
                );
                console.log('✅ Shardeum service initialized');
            } else {
                console.log('ℹ️  Shardeum contract not deployed yet. Use demo mode.');
            }
        } catch (error) {
            console.error('Failed to initialize Shardeum service:', error);
        }
    }

    /**
     * Store proof on Shardeum blockchain
     * Only stores metadata, not raw attention data
     */
    async storeProof(proof: Proof): Promise<string | null> {
        try {
            // Demo mode: Simulate blockchain storage
            if (!this.contract || !this.wallet) {
                console.log('📝 [DEMO MODE] Storing proof on Shardeum:', {
                    proofId: proof.proofId,
                    sessionId: proof.sessionId,
                    verified: proof.verified,
                    proofHash: proof.proofHash.slice(0, 10) + '...',
                });

                // Return mock transaction hash
                return '0x' + Array(64).fill(0).map(() =>
                    Math.floor(Math.random() * 16).toString(16)
                ).join('');
            }

            // Production: Store on actual Shardeum blockchain
            const proofHashBytes = ethers.keccak256(ethers.toUtf8Bytes(proof.proofHash));

            const tx = await this.contract.storeProof(
                proof.sessionId,
                proof.proofId,
                proofHashBytes,
                proof.verified,
                proof.attentionTime
            );

            console.log('⛓️  Proof transaction sent:', tx.hash);

            const receipt = await tx.wait();
            console.log('✅ Proof stored on Shardeum:', receipt.hash);

            return receipt.hash;
        } catch (error) {
            console.error('Failed to store proof on Shardeum:', error);
            return null;
        }
    }

    /**
     * Verify proof exists on blockchain
     */
    async verifyProof(proofId: string): Promise<boolean> {
        try {
            if (!this.contract) {
                // Demo mode: Always return true for demo
                console.log('📝 [DEMO MODE] Verifying proof:', proofId);
                return true;
            }

            const verified = await this.contract.verifyProof(proofId);
            return verified;
        } catch (error) {
            console.error('Failed to verify proof:', error);
            return false;
        }
    }

    /**
     * Get proof details from blockchain
     */
    async getProof(proofId: string): Promise<any | null> {
        try {
            if (!this.contract) {
                console.log('📝 [DEMO MODE] Getting proof:', proofId);
                return null;
            }

            const proof = await this.contract.getProof(proofId);
            return {
                sessionId: proof[0],
                proofHash: proof[1],
                verified: proof[2],
                attentionTime: proof[3].toString(),
                timestamp: proof[4].toString(),
            };
        } catch (error) {
            console.error('Failed to get proof:', error);
            return null;
        }
    }

    /**
     * Get wallet address
     */
    getAddress(): string | null {
        return this.wallet?.address || null;
    }

    /**
     * Get network info
     */
    async getNetworkInfo(): Promise<any> {
        if (!this.provider) {
            return { network: 'demo', status: 'not configured' };
        }

        try {
            const network = await this.provider.getNetwork();
            const balance = this.wallet ? await this.provider.getBalance(this.wallet.address) : 0n;

            return {
                network: network.name,
                chainId: network.chainId.toString(),
                balance: ethers.formatEther(balance),
                address: this.wallet?.address,
            };
        } catch (error) {
            return { network: 'error', status: error };
        }
    }
}

export const shardeumService = new ShardeumService();
