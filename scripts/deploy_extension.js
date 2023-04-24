// scripts/deploy.js

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const CreatorCore = await ethers.getContractFactory("ERC721CreatorCore");
    const creatorCore = await CreatorCore.deploy();
    await creatorCore.deployed();
  
    console.log("CreatorCore deployed at:", creatorCore.address);
  
    const RaffleExtension = await ethers.getContractFactory("RaffleExtension");
    const maxEntries = 10;
  
    // Set these values according to your Chainlink environment
    const vrfCoordinator = "0x...";
    const linkToken = "0x...";
    const keyHash = "0x...";
    const fee = "100000000000000000";
  
    const raffleExtension = await RaffleExtension.deploy(
      creatorCore.address,
      maxEntries,
      vrfCoordinator,
      linkToken,
      keyHash,
      fee
    );
    await raffleExtension.deployed();
  
    console.log("RaffleExtension deployed at:", raffleExtension.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  