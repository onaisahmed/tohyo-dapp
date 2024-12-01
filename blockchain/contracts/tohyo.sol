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

    mapping (address => VoterInfo) voters;
    mapping (uint256 => Candidate) candidates;
    mapping (address => bool) public candidateAddresses;

    address[] public registeredVoters;
    uint256[] public registeredCandidateIds;

    uint256 public votingStartTime;
    uint256 public votingEndTime;
    uint256 private constant MAX_VOTING_DURATION = 2 days;
    uint private constant MIX_VOTING_DURATION = 1 days;

    event VoterRegistered(address indexed voter, uint256 timestamp);
    event CandidateAdded(uint256 indexed candidateId, string name, address candidateAddress);
    event VoteCast(address indexed voter, uint256 candidateId, uint256 timestamp);
    event VotingStageChanged(VotingStage newStage);
    
}   