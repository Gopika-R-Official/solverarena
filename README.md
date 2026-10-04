# SolverArena

> **An onchain arena where optimization algorithms compete for rewards.**

Optimization problems can be expensive to solve but relatively cheap to verify.

**SolverArena turns that asymmetry into an onchain competition.**

A problem poster creates a reward-backed round. Solver developers compute candidate solutions off-chain using optimization algorithms such as Genetic Algorithms, then submit their candidates onchain.

The smart contract:

- validates the mathematical constraints,
- calculates the benchmark score,
- tracks the best valid solver,
- holds the reward in escrow,
- and settles the reward to the winning solver.

The current MVP uses **constrained portfolio allocation** as the benchmark problem.

---

## Why SolverArena?

Many optimization problems have the same structure:

**Finding a good solution is computationally expensive.  
Checking whether a solution is valid can be deterministic and comparatively cheap.**

That creates an interesting onchain primitive:

```text
        HARD TO SOLVE
             ↓
    Off-chain computation
             ↓
       Candidate solution
             ↓
    ┌─────────────────────┐
    │   ONCHAIN VERIFIER  │
    │                     │
    │  Validate           │
    │  Score              │
    │  Compare            │
    │  Record best        │
    └─────────────────────┘
             ↓
        Best solver
             ↓
        Reward payout
```

SolverArena explores what happens when this verification layer becomes the foundation for a competitive solver marketplace.

The current portfolio benchmark is the first implementation of that idea, not the final scope of the protocol.

---

# Built for Monad Metropolis

SolverArena was built for **Monad Metropolis** and deployed to the **Monad Testnet**.

### What is working

- Onchain reward-backed competition rounds
- Solidity portfolio constraint verifier
- Onchain mathematical scoring
- Best-solution tracking
- Automatic reward settlement
- React + TypeScript frontend
- Wallet integration
- Python off-chain solvers
- Genetic Algorithm portfolio solver
- Deterministic reference baseline
- Foundry test suite
- Real Monad Testnet transactions

### Verified result

In the deployed benchmark:

**Reference baseline:** `125`

**Genetic Algorithm:** `260`

Best GA portfolio:

```text
[0, 0, 1691, 2500, 0, 1163, 2146, 2500]
```

All values are basis points and sum to `10,000`.

---

# Product Flow

```text
┌──────────────┐
│    Poster    │
└──────┬───────┘
       │
       │ creates reward-backed round
       ▼
┌──────────────────────┐
│      SolverArena     │
│   reward escrow      │
└──────────┬───────────┘
           │
           │ problem configuration
           ▼
┌──────────────────────┐
│   Off-chain Solvers  │
│                      │
│   Genetic Algorithm  │
│   Baseline           │
│   Future algorithms  │
└──────────┬───────────┘
           │
           │ candidate weights
           ▼
┌──────────────────────┐
│  PortfolioVerifier   │
│                      │
│  Validate constraints│
│  Calculate score     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    SolverArena       │
│                      │
│  Track best score    │
│  Track best solver   │
└──────────┬───────────┘
           │
           │ deadline
           ▼
┌──────────────────────┐
│    Round Settlement  │
│                      │
│   Winner receives    │
│      reward          │
└──────────────────────┘
```

---

# Architecture

SolverArena deliberately separates **computation** from **verification**.

## Off-chain

The computationally expensive search happens outside the blockchain.

Current implementation:

- Genetic Algorithm
- Deterministic reference baseline
- Portfolio weight generation
- Population initialization
- Mutation and search
- Candidate optimization

This keeps heuristic optimization flexible and avoids putting expensive search loops onchain.

## On-chain

The blockchain acts as the verification and settlement layer.

The contracts handle:

- portfolio constraint validation
- return calculation
- risk calculation
- final benchmark score
- best-solution tracking
- reward escrow
- round deadlines
- reward settlement

The Solidity contract is the **final scoring authority**.

---

# Current Benchmark

The MVP implements one configured optimization problem:

> **Find a constrained allocation across 8 assets that maximizes return while applying a risk penalty.**

Each candidate is represented as eight portfolio weights in basis points.

For example:

```text
[0, 0, 1691, 2500, 0, 1163, 2146, 2500]
```

represents:

```text
0%    0%    16.91%    25%    0%    11.63%    21.46%    25%
```

---

# Verification Rules

A candidate portfolio is valid only if it satisfies all of the following:

| Rule | Constraint |
|---|---|
| Assets | Exactly 8 |
| Total allocation | Exactly 10,000 bps |
| Minimum position | 500 bps / 5% |
| Maximum position | 2,500 bps / 25% |
| Maximum holdings | 5 |
| Score | Return − risk penalty |

The contract rejects invalid portfolios before accepting their score.

---

# Scoring

The verifier uses integer arithmetic to calculate:

```text
Score = Expected Return − Risk Penalty
```

The implementation uses:

```text
return = Σ(weightᵢ × μᵢ)

variance = Σ(weightᵢ × weightⱼ × covarianceᵢⱼ)

score = return − λ × variance
```

with fixed-point scaling inside Solidity.

The Python implementation reproduces the Solidity arithmetic, including EVM-style integer truncation, so that the off-chain optimizer and onchain verifier agree.

However:

> **The Solidity verifier remains the source of truth.**

---

# Why Monad?

SolverArena is not using the blockchain only as a payment rail.

The competition loop itself uses the blockchain:

```text
Submit → Verify → Score → Compare → Record
```

Every candidate submission can trigger:

- constraint validation,
- matrix-based score calculation,
- best-score comparison,
- and state updates.

This makes execution cost and throughput relevant to the product design.

Monad's high-throughput EVM environment makes it a strong fit for an application that experiments with **frequent onchain verification and short-lived competition rounds**.

A real SolverArena `submitSolution` transaction on Monad Testnet consumed approximately:

```text
258,000 gas
```

This was measured from an actual state-changing transaction rather than estimated from a static call.

---

# Onchain Deployment

## Monad Testnet

| Component | Contract | Deployment / Action |
|---|---|---|
| `PortfolioVerifier` | `0x36e9fA3beBea57Da0867Dba2BD3773a12c95ED69` | `0x79dfc0afda14445544e990946b4784ad25d7d85f6dfa940630d3b6b4c778cad4` |
| `SolverArena` | `0x1196D4f60FE0e3f7958706E62F7c7D456d17bB34` | `0x8dd50bb16271031f74e654e26cd2d52d7c58bbc958f8d9ecddbe7ee7ae6e9277` |

### Verified testnet interactions

**Round creation**

```text
0x86da4a7fc9b2013a2c31508058ec52944af2389a5f646573980c7fa4850af056
```

**Solution submission**

```text
0xc5ca4cd47da03648c4749ba30a725a3651cfaa31f170af9cf525e058d8b53dd4
```

**GA submission**

```text
0xca89c0450b0b0543e0b5702159ecac1ca0b757dd2f727593ba089fdf89f26cf0
```

The deployed contracts and transactions provide independently verifiable evidence that the core competition flow is executing on Monad Testnet.

---

# Algorithms

## Genetic Algorithm

The primary solver is a custom Genetic Algorithm adapted for the portfolio-allocation problem.

It performs:

1. Population initialization
2. Portfolio constraint enforcement
3. Fitness evaluation
4. Selection
5. Mutation
6. Iterative improvement

The implementation was adapted from optimization work previously developed for EV-ROUTEX, but the representation, constraints, fitness function, and search space were adapted for portfolio allocation.

### Observed result

```text
Reference baseline: 125
Genetic Algorithm:  260
```

GA portfolio:

```text
[0, 0, 1691, 2500, 0, 1163, 2146, 2500]
```

---

## Reference Baseline

A deterministic valid allocation is included as a benchmark.

Its purpose is not to compete as an independent solver, but to provide a simple reference point against which optimization quality can be evaluated.

Observed score:

```text
125
```

---

# Smart Contracts

### `PortfolioVerifier.sol`

Responsible for:

- validating portfolio constraints
- calculating expected return
- calculating risk penalty
- producing the final benchmark score

### `SolverArena.sol`

Responsible for:

- creating reward-backed rounds
- holding rewards in escrow
- accepting solver submissions
- tracking the best valid score
- enforcing round deadlines
- settling rewards

---

# Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity |
| Contract Framework | Foundry |
| Off-chain Solvers | Python |
| Blockchain Interaction | `web3.py`, `ethers.js` |
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Wallet | EVM browser wallet |
| Icons/UI | `lucide-react` |
| Network | Monad Testnet |

---

# Repository Structure

```text
solverarena/
│
├── src/
│   ├── PortfolioVerifier.sol
│   └── SolverArena.sol
│
├── test/
│   ├── PortfolioVerifier.t.sol
│   └── SolverArena.t.sol
│
├── script/
│   └── Deploy.s.sol
│
├── solver/
│   ├── portfolio.py
│   ├── baseline_solver.py
│   ├── ga_solver.py
│   ├── test_solver.py
│   └── submit.py
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── requirements.txt
├── foundry.toml
├── LICENSE
└── README.md
```

---

# Testing

The Solidity contracts currently have:

```text
13 / 13 Foundry tests passing
```

Coverage includes:

### PortfolioVerifier

- valid portfolio
- incorrect total allocation
- minimum position violation
- maximum position violation
- excessive number of holdings
- risk penalty calculation

### SolverArena

- round creation
- zero-reward rejection
- solution submission
- expired-round rejection
- winner settlement
- poster refund when no solver submits
- better-solver leaderboard update

The Python solver suite also verifies:

- portfolio validity
- constraint handling
- solver output
- agreement with the Solidity scoring implementation

---

# Running Locally

## 1. Clone the repository

```bash
git clone https://github.com/Gopika-R-Official/solverarena
cd solverarena
```

## 2. Smart contracts

Install dependencies:

```bash
forge install
```

Build:

```bash
forge build
```

Run tests:

```bash
forge test
```

Expected result:

```text
13 passed
```

---

## 3. Python Solvers

Create a virtual environment:

### Windows

```bash
python -m venv venv
.\venv\Scripts\activate
```

### macOS / Linux

```bash
python -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the solver tests:

```bash
python solver/test_solver.py
```

Run the baseline:

```bash
python solver/baseline_solver.py
```

Run the Genetic Algorithm:

```bash
python solver/ga_solver.py
```

---

# 4. Frontend

The frontend requires an EVM-compatible browser wallet such as MetaMask or Rabby.

```bash
cd frontend
npm install
npm run dev
```

The frontend connects directly to the deployed SolverArena contract.

---

# Environment & Security

For local Python transaction submission:

```bash
cp .env.example .env
```

Configure the required environment variables locally.

**Never commit `.env` or expose a private key.**

The repository intentionally keeps secrets out of source control.

---

# AI / Pre-existing Code Disclosure

AI coding tools were used during development for:

- implementation assistance
- debugging
- scaffolding
- frontend development
- documentation

AI tools were used as development assistance and were not treated as autonomous authors of the project.

The optimization concepts and code lineage were adapted from the developer's previous **EV-ROUTEX** work, particularly the use of Genetic Algorithms and other optimization techniques.

For SolverArena, the Genetic Algorithm was substantially adapted to a different problem domain:

```text
EV routing
     ↓
Portfolio allocation
```

The portfolio representation, constraints, scoring function, verifier integration, solver adaptation, smart contracts, and application flow were developed for SolverArena.

---

# Limitations

SolverArena is an experimental hackathon MVP and has several known limitations.

### 1. Single benchmark

The current implementation supports one configured 8-asset portfolio benchmark.

The broader solver-arena architecture could support multiple problem/verifier configurations in the future.

### 2. Trusted benchmark inputs

The portfolio returns and covariance parameters are configured inputs.

They are not currently supplied by a decentralized oracle.

### 3. Off-chain optimization

The computationally expensive optimization happens off-chain.

The blockchain verifies and scores submitted candidates rather than independently rerunning the optimization algorithm.

### 4. Public submissions

Solutions are currently publicly visible.

A solver could potentially observe and copy another solver's submission before the round ends.

A production implementation would require mechanisms such as commit/reveal submissions.

### 5. Testnet data

The benchmark uses synthetic/testnet data and is **not intended for real investment decisions or financial advice**.

### 6. Security

The contracts have not undergone a professional security audit.

This implementation should be considered experimental testnet software.

### 7. Historical indexing

The current frontend focuses on the active/latest competition round and does not yet provide a full historical submission index.

---

# Future Work

The current architecture leaves room for a broader solver marketplace.

Potential extensions include:

- multiple optimization problem types
- generalized verifier contracts
- pluggable benchmark configurations
- commit/reveal submissions
- solver reputation
- historical performance tracking
- solver leaderboards
- subgraph-based historical indexing
- richer reward markets
- additional optimization algorithms
- production security audit

The long-term goal is to make the **verification layer reusable across different optimization problems**, rather than limiting the platform to portfolio allocation.

---

# Hackathon Scope

SolverArena intentionally focuses on a small, complete prototype rather than attempting to build a generalized optimization marketplace in one hackathon.

The current submission demonstrates the complete core lifecycle:

```text
Create competition
       ↓
Lock reward
       ↓
Compute solution off-chain
       ↓
Submit solution onchain
       ↓
Verify constraints
       ↓
Calculate score
       ↓
Track best solver
       ↓
Reach deadline
       ↓
Settle reward
```

The portfolio benchmark is the concrete implementation used to demonstrate this primitive on Monad.

---

# License

MIT License.

See [`LICENSE`](LICENSE) for details.
