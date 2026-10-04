// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PortfolioVerifier} from "../src/PortfolioVerifier.sol";

contract PortfolioVerifierTest is Test {
    PortfolioVerifier verifier;

    int256[8] mu;
    int256[8][8] cov;

    function setUp() public {
        // Simple test data.
        // Returns are expressed in 1e4 units.
        mu[0] = 1000; // 10%
        mu[1] = 900;  // 9%
        mu[2] = 800;  // 8%
        mu[3] = 700;  // 7%
        mu[4] = 600;  // 6%
        mu[5] = 500;  // 5%
        mu[6] = 400;  // 4%
        mu[7] = 300;  // 3%

        // Keep covariance simple for the first tests.
        // All values are zero, so risk penalty is zero.
        verifier = new PortfolioVerifier(mu, cov);
    }

    function testValidPortfolio() public view {
        uint16[8] memory weights;

        // 4 assets × 25% = 100%
        weights[0] = 2500;
        weights[1] = 2500;
        weights[2] = 2500;
        weights[3] = 2500;

        int256 result = verifier.score(weights);

        // With zero covariance, this should be:
        // (25% × 10%) + (25% × 9%) + (25% × 8%) + (25% × 7%)
        // = 8.5%
        assert(result == 850);
    }

    function testRejectsWrongTotalWeight() public {
        uint16[8] memory weights;

        weights[0] = 2500;
        weights[1] = 2500;
        weights[2] = 2500;

        // Total = 75%, not 100%.
        vm.expectRevert("weights must sum to 10000");
        verifier.score(weights);
    }

    function testRejectsPositionBelowMinimum() public {
        uint16[8] memory weights;

        weights[0] = 450;
        weights[1] = 2500;
        weights[2] = 2500;
        weights[3] = 2500;
        weights[4] = 2050;

        // Asset 0 is 4.5%, below the 5% minimum.
        vm.expectRevert("position size");
        verifier.score(weights);
    }

    function testRejectsPositionAboveMaximum() public {
        uint16[8] memory weights;

        weights[0] = 3000;
        weights[1] = 2500;
        weights[2] = 2500;
        weights[3] = 2000;

        // Asset 0 is 30%, above the 25% maximum.
        vm.expectRevert("position size");
        verifier.score(weights);
    }

    function testRejectsTooManyHoldings() public {
        uint16[8] memory weights;

        // Six assets with 1/6 each.
        // Each is above 5%, but there are 6 holdings.
        weights[0] = 1667;
        weights[1] = 1667;
        weights[2] = 1667;
        weights[3] = 1667;
        weights[4] = 1666;
        weights[5] = 1666;

        vm.expectRevert("too many holdings");
        verifier.score(weights);
    }
    function testRiskPenalty() public {
        int256[8] memory testMu;
        int256[8][8] memory testCov;

        testMu[0] = 100;
        testMu[1] = 200;
        testMu[2] = 300;
        testMu[3] = 400;

        testCov[0][0] = 1000;
        testCov[1][1] = 1000;
        testCov[2][2] = 1000;
        testCov[3][3] = 1000;

        PortfolioVerifier testVerifier =
            new PortfolioVerifier(testMu, testCov);

        uint16[8] memory weights;

        weights[0] = 2500;
        weights[1] = 2500;
        weights[2] = 2500;
        weights[3] = 2500;

        int256 result = testVerifier.score(weights);

        assert(result == 125);
    }
}
