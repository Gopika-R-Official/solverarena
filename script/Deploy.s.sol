// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PortfolioVerifier} from "../src/PortfolioVerifier.sol";
import {SolverArena} from "../src/SolverArena.sol";

contract DeployScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Define simple dummy data for PortfolioVerifier for testnet
        int256[8] memory mu = [int256(100), 200, 300, 400, 150, 250, 350, 450];
        int256[8][8] memory cov;
        // Fill diagonal
        for (uint i = 0; i < 8; i++) {
            cov[i][i] = 1000;
        }

        PortfolioVerifier verifier = new PortfolioVerifier(mu, cov);
        console2.log("PortfolioVerifier deployed to:", address(verifier));

        SolverArena arena = new SolverArena(verifier);
        console2.log("SolverArena deployed to:", address(arena));

        // Basic interaction
        // Create a round
        uint256 roundId = arena.createRound{value: 0.001 ether}(1 hours);
        console2.log("Round created with ID:", roundId);

        // Submit a solution
        uint16[8] memory weights = [uint16(2500), 2500, 2500, 2500, 0, 0, 0, 0];
        arena.submitSolution(roundId, weights);
        console2.log("Solution submitted for round:", roundId);

        vm.stopBroadcast();
    }
}
