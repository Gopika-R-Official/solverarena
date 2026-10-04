import { useState } from 'react';
import { ethers } from 'ethers';
import { SOLVER_ARENA_ADDRESS, SOLVER_ARENA_ABI } from './contracts';

import { Header } from './components/Header';
import { ArenaCard } from './components/ArenaCard';
import { Leaderboard } from './components/Leaderboard';
import { SolutionPanel } from './components/SolutionPanel';
import { OnchainProof } from './components/OnchainProof';
import { HowItWorks } from './components/HowItWorks';

declare global {
  interface Window {
    ethereum: any;
  }
}

function App() {
  const [account, setAccount] = useState<string>('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [activeRound, setActiveRound] = useState<any>(null);
  const [roundId, setRoundId] = useState<number | null>(null);
  const [pendingTx, setPendingTx] = useState('');
  const [pendingCreate, setPendingCreate] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Weights state (in percentages now)
  const [weights, setWeights] = useState<string[]>(Array(8).fill('0'));

  const connectWallet = async () => {
    setErrorMsg('');
    if (window.ethereum) {
      try {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const network = await _provider.getNetwork();
        if (network.chainId !== 10143n) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x279f' }], // 10143 in hex
            });
          } catch (e) {
            setErrorMsg("Please switch to Monad Testnet.");
            return;
          }
        }
        
        const accounts = await _provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        
        const signer = await _provider.getSigner();
        const _contract = new ethers.Contract(SOLVER_ARENA_ADDRESS, SOLVER_ARENA_ABI, signer);
        setContract(_contract);
        
        fetchRoundData(_contract);
      } catch (err: any) {
        if (err.code === 4001) {
          setErrorMsg("Wallet connection rejected.");
        } else {
          setErrorMsg("Failed to connect wallet.");
        }
      }
    } else {
      setErrorMsg("Please install a Web3 wallet (e.g. MetaMask).");
    }
  };

  const fetchRoundData = async (_contract: ethers.Contract) => {
    try {
      const nextId = await _contract.nextRoundId();
      if (nextId > 0n) {
        const currentId = Number(nextId) - 1;
        const roundData = await _contract.rounds(currentId);
        setRoundId(currentId);
        setActiveRound({
          poster: roundData.poster,
          reward: ethers.formatEther(roundData.reward),
          deadline: Number(roundData.deadline),
          bestScore: roundData.bestScore.toString(),
          bestSolver: roundData.bestSolver,
          settled: roundData.settled
        });
      }
    } catch (e) {
      console.error("Error fetching round data", e);
    }
  };

  const handleCreateRound = async () => {
    if (!contract) return;
    setErrorMsg('');
    try {
      setPendingCreate(true);
      const tx = await contract.createRound(3600, { value: ethers.parseEther("0.001") });
      await tx.wait();
      setPendingCreate(false);
      fetchRoundData(contract);
    } catch (e: any) {
      setPendingCreate(false);
      if (e.code === 'ACTION_REJECTED' || e.code === 4001) {
        setErrorMsg("Transaction rejected in wallet.");
      } else {
        setErrorMsg("Transaction failed. Please try again.");
      }
    }
  };

  const handleSubmitSolution = async () => {
    if (!contract || roundId === null) return;
    setErrorMsg('');
    try {
      // Convert percentages back to basis points
      const numWeights = weights.map(w => Math.round(parseFloat(w || '0') * 100));
      
      setPendingTx('Submitting solution...');
      const tx = await contract.submitSolution(roundId, numWeights);
      await tx.wait();
      setPendingTx('');
      fetchRoundData(contract);
    } catch (e: any) {
      setPendingTx('');
      if (e.code === 'ACTION_REJECTED' || e.code === 4001) {
        setErrorMsg("Transaction rejected in wallet.");
      } else if (e.message && e.message.includes("Round ended")) {
        setErrorMsg("Round has already ended.");
      } else {
        setErrorMsg("Transaction failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-textMain selection:bg-accentMuted font-sans">
      <Header account={account} connectWallet={connectWallet} />

      {errorMsg && (
        <div className="bg-red-900/50 border-b border-red-500/50 text-red-200 text-sm py-2 px-6 text-center">
          {errorMsg}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-20">
        
        {/* Hero */}
        <section className="max-w-3xl space-y-6">
          <p className="text-accent text-sm font-semibold tracking-wider uppercase">Onchain Optimization Arena</p>
          <h2 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1]">
            Compete to solve.<br/>
            <span className="text-textMuted">Get paid for the best answer.</span>
          </h2>
          <p className="text-lg text-textMuted max-w-2xl leading-relaxed">
            Optimization problems are solved off-chain and verified on-chain. Solvers compete for rewards, while Monad settles the result.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <ArenaCard 
              roundId={roundId} 
              activeRound={activeRound} 
              account={account} 
              handleCreateRound={handleCreateRound} 
              pendingCreate={pendingCreate}
            />
            <Leaderboard 
              activeRound={activeRound} 
              ethersZeroAddress={ethers.ZeroAddress} 
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <SolutionPanel 
              weights={weights}
              setWeights={setWeights}
              handleSubmitSolution={handleSubmitSolution}
              pendingTx={pendingTx}
              account={account}
            />
            <OnchainProof />
          </div>
        </div>
        
        <HowItWorks />
      </main>

      <footer className="border-t border-surfaceBorder py-8 mt-12 text-center text-sm text-textMuted space-y-4">
        <div className="flex justify-center space-x-6">
          <span className="hover:text-white transition-colors cursor-pointer">SolverArena</span>
          <span className="hover:text-white transition-colors cursor-pointer">Built on Monad</span>
          <span className="hover:text-white transition-colors cursor-pointer">GitHub</span>
        </div>
        <p className="text-xs">Experimental testnet software. Portfolio data is synthetic and this is not investment advice.</p>
      </footer>
    </div>
  );
}

export default App;
