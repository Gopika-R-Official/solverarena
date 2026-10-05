// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PortfolioVerifier} from "./PortfolioVerifier.sol";

contract SolverArena {
    PortfolioVerifier public immutable verifier;

    uint256 public nextRoundId;

    struct Round {
        address poster;
        uint256 reward;
        uint256 deadline;
        int256 bestScore;
        address bestSolver;
        bool settled;
    }

    mapping(uint256 => Round) public rounds;
    mapping(address => uint256) public pendingWithdrawals;

    event RoundCreated(uint256 indexed roundId, address indexed poster, uint256 reward, uint256 deadline);

    event SolutionSubmitted(uint256 indexed roundId, address indexed solver, int256 score);

    event RoundSettled(uint256 indexed roundId, address indexed winner, uint256 reward);

    constructor(PortfolioVerifier _verifier) {
        verifier = _verifier;
    }

    function createRound(uint256 duration) external payable returns (uint256 roundId) {
        require(msg.value > 0, "reward required");
        require(duration > 0, "invalid duration");

        roundId = nextRoundId++;

        rounds[roundId] = Round({
            poster: msg.sender,
            reward: msg.value,
            deadline: block.timestamp + duration,
            bestScore: type(int256).min,
            bestSolver: address(0),
            settled: false
        });

        emit RoundCreated(roundId, msg.sender, msg.value, block.timestamp + duration);
    }

    function submitSolution(uint256 roundId, uint16[8] calldata weights) external {
        Round storage round = rounds[roundId];

        require(round.reward > 0, "round does not exist");
        require(!round.settled, "round settled");
        require(block.timestamp < round.deadline, "round ended");

        int256 score = verifier.score(weights);

        if (score > round.bestScore) {
            round.bestScore = score;
            round.bestSolver = msg.sender;
        }

        emit SolutionSubmitted(roundId, msg.sender, score);
    }

    function settleRound(uint256 roundId) external {
        Round storage round = rounds[roundId];

        require(round.reward > 0, "round does not exist");
        require(!round.settled, "already settled");
        require(block.timestamp >= round.deadline, "round active");

        round.settled = true;

        address winner = round.bestSolver;
        uint256 reward = round.reward;

        if (winner == address(0)) {
            winner = round.poster;
        }

        (bool success, ) = winner.call{value: reward}("");
        if (!success) {
            pendingWithdrawals[winner] += reward;
        }

        emit RoundSettled(roundId, winner, reward);
    }

    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "no pending withdrawals");
        
        pendingWithdrawals[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "withdrawal failed");
    }
}
