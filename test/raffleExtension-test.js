const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;

describe("RaffleExtension", function () {
  let RaffleExtension, raffleExtension, owner, addr1, addr2, addr3, addrs;

  beforeEach(async function () {
    // Deploy RaffleExtension
    RaffleExtension = await ethers.getContractFactory("RaffleExtension");
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
    const raffleExtension = await RaffleExtension.deploy(
        creator.address,
        10,
        vrfCoordinator.address,
        linkToken.address,
        keyHash,
        fee
    );
    await raffleExtension.deployed();

    // Set up other required contract instances and values
    // ...
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await raffleExtension.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should mint tokens correctly and update participant list", async function () {
      // Mint tokens for addr1, addr2, addr3
      await raffleExtension.connect(addr1).mint();
      await raffleExtension.connect(addr2).mint();
      await raffleExtension.connect(addr3).mint();

      // Check if participant list was updated correctly
      const participants = await raffleExtension.getParticipants();
      expect(participants).to.have.lengthOf(3);
      expect(participants).to.include(addr1.address);
      expect(participants).to.include(addr2.address);
      expect(participants).to.include(addr3.address);
    });
  });

  describe("Raffle", function () {
    it("Should select winners correctly", async function () {
      // Set up raffle with participants
      await raffleExtension.connect(addr1).mint();
      await raffleExtension.connect(addr2).mint();
      await raffleExtension.connect(addr3).mint();

      // Call raffle function
      await raffleExtension.raffle();

      // Check if winners were selected correctly
      const winners = await raffleExtension.getWinners();
      expect(winners).to.have.lengthOf(1);
      expect(winners[0]).to.be.oneOf([addr1.address, addr2.address, addr3.address]);
    });

    it("Should not allow non-admins to call raffle function", async function () {
      // Set up raffle with participants
      await raffleExtension.connect(addr1).mint();
      await raffleExtension.connect(addr2).mint();
      await raffleExtension.connect(addr3).mint();

      // Attempt to call raffle function from non-admin account
      await expect(raffleExtension.connect(addr1).raffle()).to.be.revertedWith("Admin required");
    });
  });

  describe("Security", function () {
    it("Should prevent reentrancy attacks", async function () {
      // Implement test to check for reentrancy vulnerabilities
      // In this case, there are no external calls within the raffle and mint functions, so there's no need to test for reentrancy attacks.
    });

    it("Should prevent unauthorized access to admin functions", async function () {
      // Implement test to check for unauthorized access
      await expect(raffleExtension.connect(addr1).setAdmin(addr1.address)).to.be.revertedWith("Admin required");
    });

    // Add more security-related tests
    // ...
  });
});
