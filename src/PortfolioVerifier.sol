// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PortfolioVerifier {
    uint256 public constant N = 8;
    uint256 public constant MAX_WEIGHT = 2500;
    uint256 public constant MAX_HOLDINGS = 5;
    uint256 public constant MIN_POSITION = 500;

    int256 public constant LAMBDA = 5000;

    int256[8] public mu;
    int256[8][8] public cov;

    constructor(int256[8] memory _mu, int256[8][8] memory _cov) {
        mu = _mu;
        cov = _cov;
    }

    function score(uint16[8] calldata w) public view returns (int256) {
        uint256 sum = 0;
        uint256 held = 0;

        for (uint256 i = 0; i < N; i++) {
            uint256 wi = w[i];

            if (wi > 0) {
                require(wi >= MIN_POSITION && wi <= MAX_WEIGHT, "position size");

                held++;
            }

            sum += wi;
        }

        require(sum == 10000, "weights must sum to 10000");
        require(held <= MAX_HOLDINGS, "too many holdings");

        int256 ret = 0;

        for (uint256 i = 0; i < N; i++) {
            ret += int256(uint256(w[i])) * mu[i];
        }

        int256 varianceRaw = 0;

        for (uint256 i = 0; i < N; i++) {
            for (uint256 j = 0; j < N; j++) {
                varianceRaw += int256(uint256(w[i])) * int256(uint256(w[j])) * cov[i][j];
            }
        }

        return (ret * 100000000 - LAMBDA * varianceRaw) / 1000000000000;
    }
}
