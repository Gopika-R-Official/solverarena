# SolverArena

> *"An onchain arena where optimization algorithms compete for rewards."*

Optimization problems can be difficult to solve but relatively cheap to verify. SolverArena turns that computational asymmetry into an onchain competition.

A reward-backed round is created on-chain. Solvers compute candidate solutions off-chain using various optimization algorithms. They then submit their candidate portfolio weights to the smart contract, which mathematically validates all constraints and calculates a benchmark score. 

The highest-scoring valid solver at the end of the round deadline receives the locked reward. The entire lifecycle—from reward escrow to mathematical verification and settlement—is handled natively on-chain.

---

## Hackathon

Built for **Monad Metropolis**. 
- Successfully deployed and tested on **Monad Testnet**.
- Working React frontend integrating directly with the smart contracts.
- Fully implemented off-chain Genetic Algorithm solver.
- Complete on-chain mathematical verification.

---

## Product Flow

```text
Poster
  ↓
Creates reward-backed round
  ↓
Solvers run optimization algorithms off-chain
  ↓
Submit candidate portfolio
  ↓
PortfolioVerifier validates constraints
  ↓
SolverArena calculates / records best score
  ↓
Round settles
  ↓
Best solver receives reward
```

### Off-Chain vs. On-Chain Distinction

This project intentionally isolates the heavy computation from the blockchain:

**OFF-CHAIN:**
- High-intensity search heuristics (Genetic Algorithm)
- Deterministic baseline solvers
- Portfolio weight generation and mutation

**ON-CHAIN:**
- Portfolio constraint validation (Sum, positions, holding limits)
- Final scoring (Return vs Risk penalty calculation)
- Leaderboard and current best score tracking
- Escrow and reward settlement

## Why Monad?

SolverArena intentionally performs verification and scoring natively on-chain rather than merely using the blockchain as a payment layer. 

Every candidate solution triggers an EVM execution that mathematically validates strict portfolio constraints and computes the optimization benchmark score using integer arithmetic. The arena is fundamentally designed around repeated solver submissions and short competition rounds.

Monad's high-throughput EVM execution makes this model uniquely practical. Instead of bottlenecking on verification costs for an application where verification is a continuous part of the competition loop, Monad enables rapid state transitions. An observed testnet submission for `submitSolution` consumed approximately **258,000 gas** in a fully state-changing transaction, demonstrating the viability of on-chain verification loops.

## Current Benchmark

The current MVP uses a configured portfolio-optimization benchmark. A round is a paid competition instance strictly for that benchmark. 

While generalized problem registries and multiple verifier configurations are possible future extensions, the current architecture specifically scores a constrained 8-asset allocation problem.

### Verification Rules

To be considered a valid submission, a candidate portfolio must satisfy:
- Exactly **8 assets**
- Total weights sum to **10,000 basis points** (100%)
- Any non-zero position must be **>= 500 bps** (5%)
- Maximum position size is **2,500 bps** (25%)
- Maximum number of non-zero holdings is **5**

The Python implementation reproduces the Solidity scoring formula precisely using integer truncation to ensure the off-chain solver aligns perfectly with the EVM state. However, the Solidity contract remains the final scoring authority.

## Algorithms

### Baseline
A simple deterministic portfolio allocation used as a reference point.
* **Observed baseline score:** 125

### Genetic Algorithm
A custom Genetic Algorithm adapted specifically for the portfolio allocation problem. It utilizes population-based search, bounded mutations, and strict constraint adherence.
* **Observed GA score:** 260
* **Observed best portfolio:** `[0, 0, 1691, 2500, 0, 1163, 2146, 2500]` *(Values in basis points)*

## Onchain Deployment

| Component | Monad Testnet Address | Deployment / Action Tx Hash |
|-----------|-----------------------|-----------------------------|
| **PortfolioVerifier** | `0x36e9fA3beBea57Da0867Dba2BD3773a12c95ED69` | `0x79dfc0afda14445544e990946b4784ad25d7d85f6dfa940630d3b6b4c778cad4` |
| **SolverArena** | `0x1196D4f60FE0e3f7958706E62F7c7D456d17bB34` | `0x8dd50bb16271031f74e654e26cd2d52d7c58bbc958f8d9ecddbe7ee7ae6e9277` |
| **Test Round** (Round 0) | N/A | `0x86da4a7fc9b2013a2c31508058ec52944af2389a5f646573980c7fa4850af056` |
| **Test Submission** | N/A | `0xc5ca4cd47da03648c4749ba30a725a3651cfaa31f170af9cf525e058d8b53dd4` |

*(An observed testnet submission for `submitSolution` consumed approximately **258,000 gas**)*

## Tech Stack

| Domain | Technologies |
|--------|--------------|
| **Smart Contracts** | Solidity, Foundry |
| **Backend / Off-chain** | Python, `web3.py`, `python-dotenv` |
| **Optimization** | Custom Genetic Algorithm, Deterministic Baseline |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, `ethers.js`, `lucide-react` |
| **Network** | Monad Testnet |

## Repository Structure

```text
src/
  PortfolioVerifier.sol
  SolverArena.sol
test/
  PortfolioVerifier.t.sol
  SolverArena.t.sol
script/
  Deploy.s.sol
solver/
  portfolio.py
  baseline_solver.py
  ga_solver.py
  test_solver.py
  submit.py
frontend/
  src/
  package.json
```

## Local Setup

### Foundry (Smart Contracts)
```bash
forge install
forge build
forge test
```
*Note: 13 Foundry tests currently pass, covering valid/invalid constraints, risk penalties, round creation/settlement, reward rejection, and solution submission logic.*

### Python (Off-chain Solvers)
Create a virtual environment and install dependencies:
```bash
python -m venv venv

# Windows:
.\venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Run the solvers:
```bash
python solver/test_solver.py
python solver/baseline_solver.py
python solver/ga_solver.py
```

### Frontend
The frontend requires a Web3 browser extension (e.g., MetaMask, Rabby).
```bash
cd frontend
npm install
npm run dev
```

## Environment & Security
Copy `.env.example` to `.env` and fill in your details:
```bash
cp .env.example .env
```
⚠️ **WARNING:** Never commit your `.env` file or expose your `PRIVATE_KEY`.

## AI / Pre-existing Code Disclosure
AI coding tools were used during development for implementation assistance, debugging, scaffolding, and documentation. The optimization concepts and code lineage were adapted from the developer's previous EV-ROUTEX work, particularly the use of optimization techniques such as GA/SA/PSO/ACO. For this specific project, the Genetic Algorithm was heavily adapted to a portfolio-weight optimization problem rather than vehicle routing.

## Limitations
- The current MVP uses a single configured portfolio benchmark.
- Portfolio inputs and parameters are synthetic testnet data.
- Optimization happens off-chain; public submissions can potentially be copied or front-run in a production setting.
- The benchmark data is trusted/configured rather than supplied by a decentralized external oracle.
- The platform does not provide investment advice.
- The codebase has not undergone a production security audit.
- The current frontend does not provide full historical submission indexing (only active rounds).
- Experimental Testnet software only.

## Future Work
- Support for multiple benchmark/problem configurations.
- Generalized verifier architecture.
- Commit/reveal submission mechanisms to prevent front-running and copying.
- Historical submission indexing via subgraphs.
- Richer solver marketplace and solver reputation metrics.
- Production-grade security audit.

## License
MIT License. See `LICENSE` for more information.
