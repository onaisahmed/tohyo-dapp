const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = await hre.network;

  // Deployment configuration
  const VOTING_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", balance.toString());

  // Deploy the contract
  const VotingSystemFactory = await hre.ethers.getContractFactory("TohyoDapp");
  const votingSystem = await VotingSystemFactory.deploy(VOTING_DURATION);

  // Wait for deployment
  await votingSystem.waitForDeployment();
  const contractAddress = await votingSystem.getAddress();
  const abiFile = fs.readFileSync(
    "./artifacts/contracts/tohyo.sol/TohyoDapp.json",
    "utf8"
  );
  const abi = JSON.parse(abiFile).abi;

  console.log("Voting System deployed to:", contractAddress);
  console.log("Deployed on network:", network.name);

  // Prepare deployment information
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: network.name,
    chainId: network.chainId,
    deploymentTimestamp: Date.now(),
    votingDuration: VOTING_DURATION,
    abi,
  };

  // Save deployment details
  saveDeploymentDetails(deploymentInfo, network.name);

  // Optional: Add initial candidates (example)
  try {
    console.log("Adding initial candidates...");

    const candidates = [
      {
        name: "Candidate Alpha",
        description: "First candidate in the election",
        address: "0x1234567890123456789012345678901234567890",
      },
      {
        name: "Candidate Beta",
        description: "Second candidate in the election",
        address: "0x0987654321098765432109876543210987654321",
      },
    ];

    for (const candidate of candidates) {
      const tx = await votingSystem.addCandidate(
        candidate.name,
        candidate.description,
        candidate.address
      );
      await tx.wait();
      console.log(`Added candidate: ${candidate.name}`);
    }
  } catch (error) {
    console.error("Error adding candidates:", error);
  }
}

/**
 * Save deployment details to a JSON file
 * @param {Object} deploymentInfo - Deployment information
 * @param {string} networkName - Name of the network
 */
function saveDeploymentDetails(deploymentInfo, networkName) {
  const deploymentsDir = path.join(__dirname, "../../frontend/src/deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFileName = `${networkName}-deployment.json`;
  const deploymentFilePath = path.join(deploymentsDir, deploymentFileName);

  fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));

  console.log(`Deployment details saved to ${deploymentFilePath}`);
}

// Recommended pattern for handling async errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = main;
