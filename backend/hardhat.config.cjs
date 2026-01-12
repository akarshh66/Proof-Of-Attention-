require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");

// Prefer env-configurable RPC/chain for current Shardeum networks.
const rpcUrl = process.env.SHARDEUM_RPC_URL || "https://api-mezame.shardeum.org"; // testnet default
const chainId = Number(process.env.SHARDEUM_CHAIN_ID || "8119"); // mezame testnet chainId; override in .env for mainnet

/** @type import("hardhat/config").HardhatUserConfig */
const config = {
    solidity: "0.8.0",
    networks: {
        shardeum: {
            url: rpcUrl,
            accounts: process.env.SHARDEUM_PRIVATE_KEY ? [process.env.SHARDEUM_PRIVATE_KEY] : [],
            chainId,
        },
    },
    paths: {
        sources: "./contracts",
        artifacts: "./artifacts",
    },
};

module.exports = config;
