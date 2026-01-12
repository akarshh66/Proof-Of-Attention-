import hardhat from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("\n🚀 Deploying POA Proof Registry to Shardeum...\n");

    // Get signer
    const { ethers } = hardhat;

    const [deployer] = await ethers.getSigners();
    console.log(`📝 Deploying with account: ${deployer.address}`);

    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log(`💰 Account balance: ${ethers.formatEther(balance)} SHM\n`);

    // Deploy contract
    const POAProofRegistry = await ethers.getContractFactory("POAProofRegistry");
    console.log("⏳ Deploying contract...");

    const proofRegistry = await POAProofRegistry.deploy();
    await proofRegistry.waitForDeployment();

    const contractAddress = await proofRegistry.getAddress();

    console.log(`✅ Contract deployed to: ${contractAddress}\n`);

    // Save contract address to file
    // Resolve .env from project root (works in ESM and hardhat)
    const envPath = path.resolve(process.cwd(), ".env");

    // Seed .env if missing so we don't crash on readFileSync
    if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, "", { encoding: "utf-8" });
    }

    let envContent = fs.readFileSync(envPath, "utf-8");

    // Update or add POA_CONTRACT_ADDRESS
    if (envContent.includes("POA_CONTRACT_ADDRESS=")) {
        envContent = envContent.replace(
            /POA_CONTRACT_ADDRESS=.*/,
            `POA_CONTRACT_ADDRESS=${contractAddress}`
        );
    } else {
        envContent += `\nPOA_CONTRACT_ADDRESS=${contractAddress}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log("📄 Contract address saved to .env\n");

    // Verify deployment
    console.log("🔍 Verifying contract...");
    try {
        const proofCount = await proofRegistry.getTotalProofs();
        console.log(`✅ Contract verified. Total proofs: ${proofCount}\n`);
    } catch (error) {
        console.error("❌ Verification failed:", error);
    }

    console.log("🎉 Deployment complete!");
    console.log(`\n📋 Next steps:`);
    console.log(`1. Restart your backend: npm run dev`);
    console.log(`2. Visit http://localhost:5174 to test`);
    console.log(`3. Your proofs will now be stored on Shardeum!\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
