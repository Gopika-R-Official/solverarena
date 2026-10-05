// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PortfolioVerifier} from "../src/PortfolioVerifier.sol";
import {SolverArena} from "../src/SolverArena.sol";

contract SolverArenaTest is Test {
    PortfolioVerifier verifier;
    SolverArena arena;

    address poster = address(1);
    address solverA = address(2);
    address solverB = address(3);

    function setUp() public {
        int256[8] memory mu;
        int256[8][8] memory cov;

        mu[0] = 100;
        mu[1] = 200;
        mu[2] = 300;
        mu[3] = 400;

        verifier = new PortfolioVerifier(mu, cov);
        arena = new SolverArena(verifier);

        vm.deal(poster, 10 ether);
        vm.deal(solverA, 1 ether);
        vm.deal(solverB, 1 ether);
    }

    function testCreateRound() public {
        vm.prank(poster);

        uint256 roundId = arena.createRound{value: 1 ether}(1 days);

        (
            address roundPoster,
            uint256 reward,
            uint256 deadline,
            int256 bestScore,
            address bestSolver,
            bool settled
        ) = arena.rounds(roundId);

        assertEq(roundPoster, poster);
        assertEq(reward, 1 ether);
        assertGt(deadline, block.timestamp);
        assertEq(bestScore, type(int256).min);
        assertEq(bestSolver, address(0));
        assertFalse(settled);
    }

    function testRejectsZeroReward() public {
        vm.prank(poster);

        vm.expectRevert("reward required");
        arena.createRound{value: 0}(1 days);
    }

    function testSolverCanSubmitSolution() public {
        vm.prank(poster);
        uint256 roundId = arena.createRound{value: 1 ether}(1 days);

        uint16[8] memory weights;
        weights[0] = 2500;
        weights[1] = 2500;
        weights[2] = 2500;
        weights[3] = 2500;

        vm.prank(solverA);
        arena.submitSolution(roundId, weights);

        (
            ,
            ,
            ,
            int256 bestScore,
            address bestSolver,
            
        ) = arena.rounds(roundId);

        assertEq(bestScore, 250);
        assertEq(bestSolver, solverA);
    }

    function testBetterSolverBecomesLeader() public {
        int256[8] memory mu;
        int256[8][8] memory cov;

        mu[0] = 100;
        mu[1] = 200;
        mu[2] = 300;
        mu[3] = 400;
        mu[4] = 350;

        PortfolioVerifier testVerifier = new PortfolioVerifier(mu, cov);

        SolverArena testArena = new SolverArena(testVerifier);

        vm.prank(poster);
        uint256 roundId = testArena.createRound{value: 1 ether}(1 days);

        uint16[8] memory solutionA;
        solutionA[0] = 2500;
        solutionA[1] = 2500;
        solutionA[2] = 2500;
        solutionA[3] = 2500;

        vm.prank(solverA);
        testArena.submitSolution(roundId, solutionA);

        uint16[8] memory solutionB;
        solutionB[0] = 1500;
        solutionB[1] = 1500;
        solutionB[2] = 2500;
        solutionB[3] = 2500;
        solutionB[4] = 2000;

        vm.prank(solverB);
        testArena.submitSolution(roundId, solutionB);

        (
            ,
            ,
            ,
            int256 bestScore,
            address bestSolver,
            
        ) = testArena.rounds(roundId);

        assertGt(bestScore, 250);
        assertEq(bestSolver, solverB);
    }

    function testCannotSubmitAfterDeadline() public {
        vm.prank(poster);
        uint256 roundId = arena.createRound{value: 1 ether}(1 days);

        vm.warp(block.timestamp + 1 days);

        uint16[8] memory weights;
        weights[0] = 2500;
        weights[1] = 2500;
        weights[2] = 2500;
        weights[3] = 2500;

        vm.prank(solverA);

        vm.expectRevert("round ended");
        arena.submitSolution(roundId, weights);
    }

    function testWinnerGetsReward() public {
        vm.prank(poster);
        uint256 roundId = arena.createRound{value: 1 ether}(1 days);

        uint16[8] memory weights;
        weights[0] = 2500;
        weights[1] = 2500;
        weights[2] = 2500;
        weights[3] = 2500;

        vm.prank(solverA);
        arena.submitSolution(roundId, weights);

        vm.warp(block.timestamp + 1 days);

        uint256 balanceBefore = solverA.balance;

        arena.settleRound(roundId);

        assertEq(solverA.balance, balanceBefore + 1 ether);

        (
            ,
            ,
            ,
            ,
            ,
            bool settled
        ) = arena.rounds(roundId);

        assertTrue(settled);
    }

    function testPosterGetsRefundIfNobodySubmits() public {
        vm.prank(poster);
        uint256 roundId = arena.createRound{value: 1 ether}(1 days);

        uint256 balanceBefore = poster.balance;

        vm.warp(block.timestamp + 1 days);

        arena.settleRound(roundId);

        assertEq(poster.balance, balanceBefore + 1 ether);
    }
}
