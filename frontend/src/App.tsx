import { useState } from 'react';
import { ethers } from 'ethers';
import { Activity, Code, Cpu, Trophy, CheckCircle2, Copy } from 'lucide-react';
import { formatAddress, cn } from './utils';
import { SOLVER_ARENA_ADDRESS, SOLVER_ARENA_ABI, PORTFOLIO_VERIFIER_ADDRESS } from './contracts';

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
  
  // Weights state
  const [weights, setWeights] = useState<string[]>(Array(8).fill('0'));

  const connectWallet = async () => {
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
            console.error("Please switch to Monad Testnet");
          }
        }
        
        const accounts = await _provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        
        const signer = await _provider.getSigner();
        const _contract = new ethers.Contract(SOLVER_ARENA_ADDRESS, SOLVER_ARENA_ABI, signer);
        setContract(_contract);
        
        fetchRoundData(_contract);
      } catch (err) {
        console.error("Connection error", err);
      }
    } else {
      alert("Please install MetaMask!");
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
    try {
      setPendingTx('Creating round...');
      const tx = await contract.createRound(3600, { value: ethers.parseEther("0.001") });
      await tx.wait();
      setPendingTx('');
      fetchRoundData(contract);
    } catch (e) {
      console.error(e);
      setPendingTx('');
    }
  };

  const handleSubmitSolution = async () => {
    if (!contract || roundId === null) return;
    try {
      const numWeights = weights.map(w => parseInt(w || '0', 10));
      const sum = numWeights.reduce((a, b) => a + b, 0);
      if (sum !== 10000) {
        alert("Weights must sum to 10000");
        return;
      }
      setPendingTx('Submitting solution...');
      const tx = await contract.submitSolution(roundId, numWeights);
      await tx.wait();
      setPendingTx('');
      fetchRoundData(contract);
    } catch (e) {
      console.error(e);
      setPendingTx('');
    }
  };

  // Validation UI logic
  const numWeights = weights.map(w => parseInt(w || '0', 10));
  const totalWeight = numWeights.reduce((a, b) => a + b, 0);
  const holdingsCount = numWeights.filter(w => w > 0).length;
  const isSumValid = totalWeight === 10000;
  const isHoldingsValid = holdingsCount <= 5;
  const isPosValid = numWeights.every(w => w === 0 || (w >= 500 && w <= 2500));

  return (
    <div className="min-h-screen bg-background text-textMain selection:bg-accentMuted font-sans">
      {/* Navigation */}
      <nav className="border-b border-surfaceBorder bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold tracking-tight">SolverArena</h1>
            <div className="hidden md:flex space-x-6 text-sm font-medium text-textMuted">
              <a href="#" className="hover:text-textMain transition-colors">Arena</a>
              <a href="#" className="hover:text-textMain transition-colors">Solvers</a>
              <a href="#" className="hover:text-textMain transition-colors">How It Works</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full bg-surface border border-surfaceBorder">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>MONAD TESTNET</span>
            </div>
            {account ? (
              <div className="text-sm font-mono px-4 py-2 bg-surface border border-surfaceBorder rounded-lg">
                {formatAddress(account)}
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="text-sm font-medium px-4 py-2 bg-accent text-background rounded-lg hover:bg-accentHover transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

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
            
            {/* Live Arena */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-accent" />
                  <span>Live Arena</span>
                </h3>
                {account && (
                   <button onClick={handleCreateRound} className="text-sm border border-surfaceBorder px-4 py-1.5 rounded-md hover:bg-surface transition-colors">
                     Create Round
                   </button>
                )}
              </div>

              {activeRound ? (
                <div className="bg-surface border border-surfaceBorder rounded-xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-xs text-textMuted mb-1 uppercase tracking-wider">Round ID</p>
                      <p className="font-mono text-lg">{roundId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-textMuted mb-1 uppercase tracking-wider">Benchmark</p>
                      <p className="font-medium">Portfolio Opt.</p>
                    </div>
                    <div>
                      <p className="text-xs text-textMuted mb-1 uppercase tracking-wider">Reward</p>
                      <p className="font-mono text-accent">{activeRound.reward} MON</p>
                    </div>
                    <div>
                      <p className="text-xs text-textMuted mb-1 uppercase tracking-wider">Status</p>
                      <p className="font-medium flex items-center space-x-1">
                        {activeRound.settled ? <span className="text-red-400">Settled</span> : <span className="text-accent">Active</span>}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-surface border border-surfaceBorder border-dashed rounded-xl p-12 text-center">
                  <p className="text-textMuted">No active round. Connect wallet and create one.</p>
                </div>
              )}
            </section>

            {/* Leaderboard */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-accent" />
                <span>Leaderboard</span>
              </h3>
              
              <div className="bg-surface border border-surfaceBorder rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-background/50 border-b border-surfaceBorder">
                    <tr>
                      <th className="px-6 py-4 font-medium text-textMuted">Rank</th>
                      <th className="px-6 py-4 font-medium text-textMuted">Solver</th>
                      <th className="px-6 py-4 font-medium text-textMuted">Score</th>
                      <th className="px-6 py-4 font-medium text-textMuted text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surfaceBorder">
                    {activeRound && activeRound.bestSolver !== ethers.ZeroAddress ? (
                      <tr className="bg-accent/5">
                        <td className="px-6 py-4 font-mono text-accent">01</td>
                        <td className="px-6 py-4 font-mono">{formatAddress(activeRound.bestSolver)}</td>
                        <td className="px-6 py-4 font-mono text-lg">{activeRound.bestScore}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-block px-2 py-1 bg-accent/20 text-accent text-xs rounded">LEADING</span>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-textMuted">No solutions submitted yet.</td>
                      </tr>
                    )}
                    {/* Demo baseline */}
                    <tr>
                      <td className="px-6 py-4 font-mono text-textMuted">02</td>
                      <td className="px-6 py-4 font-mono text-textMuted">0x0000...0000</td>
                      <td className="px-6 py-4 font-mono text-textMuted">125</td>
                      <td className="px-6 py-4 text-right text-textMuted text-xs">BASELINE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Solution Panel */}
            <div className="bg-surface border border-surfaceBorder rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Code className="w-5 h-5 text-accent" />
                <span>Submit Solution</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-textMuted uppercase tracking-wider mb-2">
                  <span>Asset</span>
                  <span>Weight (bps)</span>
                </div>
                {weights.map((w, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <span className="text-sm font-mono w-16">AST_{String(i+1).padStart(2, '0')}</span>
                    <input 
                      type="number"
                      value={w}
                      onChange={e => {
                        const newW = [...weights];
                        newW[i] = e.target.value;
                        setWeights(newW);
                      }}
                      className="flex-1 bg-background border border-surfaceBorder rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-surfaceBorder space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-textMuted">Total Weight</span>
                  <span className={cn("font-mono", isSumValid ? "text-accent" : "text-red-400")}>
                    {totalWeight} / 10000
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textMuted">Holdings</span>
                  <span className={cn("font-mono", isHoldingsValid ? "text-accent" : "text-red-400")}>
                    {holdingsCount} / 5
                  </span>
                </div>
              </div>

              <button 
                onClick={handleSubmitSolution}
                disabled={!isSumValid || !isHoldingsValid || !isPosValid || !account || pendingTx !== ''}
                className="w-full py-3 bg-accent text-background font-semibold rounded-lg hover:bg-accentHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {pendingTx || 'SUBMIT SOLUTION'}
              </button>
            </div>

            {/* Onchain Verification */}
            <div className="bg-surface border border-surfaceBorder rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-textMuted flex items-center space-x-2">
                <Cpu className="w-4 h-4" />
                <span>Verification</span>
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex flex-col space-y-1">
                  <span className="text-textMuted text-xs">SolverArena</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-accent">{formatAddress(SOLVER_ARENA_ADDRESS)}</span>
                    <Copy className="w-3 h-3 text-textMuted cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(SOLVER_ARENA_ADDRESS)} />
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-textMuted text-xs">PortfolioVerifier</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">{formatAddress(PORTFOLIO_VERIFIER_ADDRESS)}</span>
                    <Copy className="w-3 h-3 text-textMuted cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(PORTFOLIO_VERIFIER_ADDRESS)} />
                  </div>
                </div>
                <div className="pt-3 border-t border-surfaceBorder flex items-center space-x-2 text-accent">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium text-xs">VERIFIED ONCHAIN</span>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* How it works */}
        <section className="border-t border-surfaceBorder pt-16">
          <h3 className="text-2xl font-semibold mb-8 text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-6">
              <p className="font-mono text-accent mb-2">01</p>
              <h4 className="font-semibold mb-2">POST</h4>
              <p className="text-sm text-textMuted">Create a reward-backed optimization round.</p>
            </div>
            <div className="p-6 relative">
              <div className="hidden md:block absolute top-1/2 -left-3 w-6 border-t border-surfaceBorder border-dashed" />
              <p className="font-mono text-accent mb-2">02</p>
              <h4 className="font-semibold mb-2">SOLVE</h4>
              <p className="text-sm text-textMuted">Run an optimization algorithm off-chain.</p>
            </div>
            <div className="p-6 relative">
              <div className="hidden md:block absolute top-1/2 -left-3 w-6 border-t border-surfaceBorder border-dashed" />
              <p className="font-mono text-accent mb-2">03</p>
              <h4 className="font-semibold mb-2">VERIFY</h4>
              <p className="text-sm text-textMuted">Submit the solution to the smart contract.</p>
            </div>
            <div className="p-6 relative">
              <div className="hidden md:block absolute top-1/2 -left-3 w-6 border-t border-surfaceBorder border-dashed" />
              <p className="font-mono text-accent mb-2">04</p>
              <h4 className="font-semibold mb-2">WIN</h4>
              <p className="text-sm text-textMuted">The highest valid score receives the reward.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-surfaceBorder py-8 mt-12 text-center text-sm text-textMuted space-y-4">
        <div className="flex justify-center space-x-6">
          <a href="#" className="hover:text-white transition-colors">SolverArena</a>
          <a href="#" className="hover:text-white transition-colors">Built on Monad</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
        </div>
        <p className="text-xs">Experimental testnet software. Portfolio data is synthetic and this is not investment advice.</p>
      </footer>
    </div>
  );
}

export default App;
