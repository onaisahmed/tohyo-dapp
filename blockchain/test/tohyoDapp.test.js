const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Advanced Voting System", function () {
  let votingSystem;
  let owner;
  let voter1, voter2, voter3;
  let candidate1, candidate2;

  // Helper function to convert Solidity enum to JS
  const VotingStage = {
    Registration: 0,
    Voting: 1,
    Tallying: 2,
    Completed: 3,
  };

  beforeEach(async function () {
    [owner, voter1, voter2, voter3, candidate1, candidate2] =
      await ethers.getSigners();

    const VotingSystemContract = await ethers.getContractFactory("TohyoDapp");

    // Set voting duration to 7 days
    const VOTING_DURATION = 7 * 24 * 60 * 60;
    votingSystem = await VotingSystemContract.deploy(VOTING_DURATION);
    await votingSystem.waitForDeployment();
  });

  describe("Deployment and Initialization", function () {
    it("Should set the owner correctly", async function () {
      expect(await votingSystem.owner()).to.equal(owner.address);
    });

    it("Should start in Registration stage", async function () {
      expect(await votingSystem.currentStage()).to.equal(
        VotingStage.Registration
      );
    });
  });

  describe("Voter Registration", function () {
    it("Should allow owner to register voters", async function () {
      await votingSystem.registerVoter(voter1.address);
      await votingSystem.registerVoter(voter2.address);

      expect(await votingSystem.getTotalVoters()).to.equal(2);
    });

    it("Should prevent registering the same voter twice", async function () {
      await votingSystem.registerVoter(voter1.address);

      await expect(
        votingSystem.registerVoter(voter1.address)
      ).to.be.revertedWith("Voter already registered");
    });

    it("Should prevent non-owners from registering voters", async function () {
      await expect(
        votingSystem.connect(voter1).registerVoter(voter2.address)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Candidate Registration", function () {
    it("Should allow owner to add candidates", async function () {
      await votingSystem.addCandidate(
        "Candidate A",
        "First candidate description",
        candidate1.address
      );
      await votingSystem.addCandidate(
        "Candidate B",
        "Second candidate description",
        candidate2.address
      );

      expect(await votingSystem.getTotalCandidates()).to.equal(2);
    });

    it("Should prevent registering the same candidate twice", async function () {
      await votingSystem.addCandidate(
        "Candidate A",
        "Candidate description",
        candidate1.address
      );

      await expect(
        votingSystem.addCandidate(
          "Duplicate Candidate",
          "Another description",
          candidate1.address
        )
      ).to.be.revertedWith("Candidate already registered");
    });
  });

  describe("Voting Process", function () {
    beforeEach(async function () {
      await votingSystem.registerVoter(voter1.address);
      await votingSystem.registerVoter(voter2.address);

      await votingSystem.addCandidate(
        "Candidate A",
        "First candidate description",
        candidate1.address
      );
      await votingSystem.addCandidate(
        "Candidate B",
        "Second candidate description",
        candidate2.address
      );

      await votingSystem.changeStage(VotingStage.Voting);
    });

    it("Should allow registered voters to vote", async function () {
      await votingSystem.connect(voter1).vote(1);

      // Changing the state first to get the election results
      await votingSystem.changeStage(VotingStage.Completed);
      const results = await votingSystem.getResults();

      expect(results[0].voteCount).to.equal(1);
    });

    it("Should prevent double voting", async function () {
      await votingSystem.connect(voter1).vote(1);

      await expect(votingSystem.connect(voter1).vote(1)).to.be.revertedWith(
        "Voter already voted"
      );
    });

    it("Should prevent unregistered voters from voting", async function () {
      await expect(votingSystem.connect(voter3).vote(1)).to.be.revertedWith(
        "Voter not registered"
      );
    });
  });

  describe("Stage Management", function () {
    it("Should allow owner to change voting stages", async function () {
      await votingSystem.changeStage(VotingStage.Voting);
      expect(await votingSystem.currentStage()).to.equal(VotingStage.Voting);

      await votingSystem.changeStage(VotingStage.Tallying);
      expect(await votingSystem.currentStage()).to.equal(VotingStage.Tallying);
    });

    it("Should prevent non-owners from changing stages", async function () {
      await expect(
        votingSystem.connect(voter1).changeStage(VotingStage.Voting)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });
});
