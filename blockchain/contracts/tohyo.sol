// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Tohyo Dapp
 * @notice A comprehensive blockchain-based voting mechanism with enhanced security and flexibility
 * @dev Implements advanced voting logic with multiple security layers
 */
contract TohyoDapp {
    enum VotingStage {
        Registration,
        Voting,
        Tallying,
        Completed
    }

    struct Candidate {
        uint256 id;
        string name;
        string description;
        address candidateAddress;
        uint256 voteCount;
        bool isRegistered;
    }

    struct VoterInfo {
        address voterAddress;
        bool isRegistered;
        bool hasVoted;
        uint256 registrationTimestamp;
    }

    address public owner;
    VotingStage public currentStage;

    mapping(address => VoterInfo) voters;
    mapping(uint256 => Candidate) candidates;
    mapping(address => bool) public candidateAddresses;

    address[] public registeredVoters;
    uint256[] public registeredCandidateIds;

    uint256 public votingStartTime;
    uint256 public votingEndTime;
    uint256 private constant MAX_VOTING_DURATION = 30 days;
    uint256 private constant MIN_VOTING_DURATION = 1 days;

    event VoterRegistered(address indexed voter, uint256 timestamp);
    event CandidateAdded(
        uint256 indexed candidateId,
        string name,
        address candidateAddress
    );
    event VoteCast(
        address indexed voter,
        uint256 candidateId,
        uint256 timestamp
    );
    event VotingStageChanged(VotingStage newStage);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier atStage(VotingStage _stage) {
        require(currentStage == _stage, "Invalid voting stage");
        _;
    }

    /**
     * @notice Constructor to initialize the voting system
     * @param _votingDuration Duration of the voting period in seconds
     */
    constructor(uint256 _votingDuration) {
        require(
            _votingDuration >= MIN_VOTING_DURATION &&
                _votingDuration <= MAX_VOTING_DURATION,
            "Invalid voting duration"
        );

        owner = msg.sender;
        currentStage = VotingStage.Registration;

        votingStartTime = block.timestamp;
        votingEndTime = votingStartTime + _votingDuration;
    }

    function registerVoter(
        address _voter
    ) external onlyOwner atStage(VotingStage.Registration) {
        require(!voters[_voter].isRegistered, "Voter already registered");

        voters[_voter] = VoterInfo({
            voterAddress: _voter,
            isRegistered: true,
            hasVoted: false,
            registrationTimestamp: block.timestamp
        });

        registeredVoters.push(_voter);
        emit VoterRegistered(_voter, block.timestamp);
    }

    function addCandidate(
        string memory _name,
        string memory _description,
        address _candidateAddress
    ) external onlyOwner atStage(VotingStage.Registration) {
        require(
            !candidateAddresses[_candidateAddress],
            "Candidate already registered"
        );

        uint256 candidateId = registeredCandidateIds.length + 1;
        candidates[candidateId] = Candidate({
            id: candidateId,
            name: _name,
            description: _description,
            candidateAddress: _candidateAddress,
            voteCount: 0,
            isRegistered: true
        });

        registeredCandidateIds.push(candidateId);
        candidateAddresses[_candidateAddress] = true;

        emit CandidateAdded(candidateId, _name, _candidateAddress);
    }

    function vote(uint256 _candidateId) external atStage(VotingStage.Voting) {
        VoterInfo storage voter = voters[msg.sender];

        require(voter.isRegistered, "Voter not registered");
        require(!voter.hasVoted, "Voter already voted");
        require(
            block.timestamp >= votingStartTime &&
                block.timestamp <= votingEndTime,
            "Voting period over"
        );
        require(candidates[_candidateId].isRegistered, "Invalid candidate");

        voter.hasVoted = true;
        candidates[_candidateId].voteCount++;

        emit VoteCast(msg.sender, _candidateId, block.timestamp);
    }

    function changeStage(VotingStage _newStage) external onlyOwner {
        currentStage = _newStage;
        emit VotingStageChanged(_newStage);
    }

    function getTotalVoters() external view returns (uint256) {
        return registeredVoters.length;
    }

    function getTotalCandidates() external view returns (uint256) {
        return registeredCandidateIds.length;
    }

    function getResults() external view returns (Candidate[] memory) {
        require(
            currentStage == VotingStage.Tallying ||
                currentStage == VotingStage.Completed,
            "Results not available"
        );

        Candidate[] memory results = new Candidate[](
            registeredCandidateIds.length
        );

        for (uint256 i = 0; i < registeredCandidateIds.length; i++) {
            results[i] = candidates[registeredCandidateIds[i]];
        }

        return results;
    }

    function getCandidate(uint256 _id) public view returns (Candidate memory) {
        Candidate memory candidate = candidates[_id];
        return candidate;
    }
}
