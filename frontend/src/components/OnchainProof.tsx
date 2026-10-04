import { Cpu, CheckCircle2, Copy } from 'lucide-react';
import { formatAddress } from '../utils';
import { SOLVER_ARENA_ADDRESS, PORTFOLIO_VERIFIER_ADDRESS } from '../contracts';

export function OnchainProof() {
  return (
    <div className="bg-surface border border-surfaceBorder rounded-xl p-6 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-textMuted flex items-center space-x-2">
        <Cpu className="w-4 h-4" />
        <span>Verification</span>
      </h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex flex-col space-y-1">
          <span className="text-textMuted text-xs">SolverArena</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-accent" title={SOLVER_ARENA_ADDRESS}>{formatAddress(SOLVER_ARENA_ADDRESS)}</span>
            <Copy className="w-3 h-3 text-textMuted cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(SOLVER_ARENA_ADDRESS)} />
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-textMuted text-xs">PortfolioVerifier</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono" title={PORTFOLIO_VERIFIER_ADDRESS}>{formatAddress(PORTFOLIO_VERIFIER_ADDRESS)}</span>
            <Copy className="w-3 h-3 text-textMuted cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(PORTFOLIO_VERIFIER_ADDRESS)} />
          </div>
        </div>
        <div className="pt-3 border-t border-surfaceBorder flex items-center space-x-2 text-accent">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-medium text-xs">VERIFIED ONCHAIN</span>
        </div>
      </div>
    </div>
  );
}
