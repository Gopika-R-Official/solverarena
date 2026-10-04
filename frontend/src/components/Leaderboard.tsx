import { Trophy } from 'lucide-react';
import { formatAddress } from '../utils';

interface LeaderboardProps {
  activeRound: any;
  ethersZeroAddress: string;
}

export function Leaderboard({ activeRound, ethersZeroAddress }: LeaderboardProps) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center space-x-2">
        <Trophy className="w-5 h-5 text-accent" />
        <span>Leaderboard</span>
      </h3>
      
      <div className="bg-surface border border-surfaceBorder rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/50 border-b border-surfaceBorder">
              <tr>
                <th className="px-6 py-4 font-medium text-textMuted">Rank</th>
                <th className="px-6 py-4 font-medium text-textMuted">Solver</th>
                <th className="px-6 py-4 font-medium text-textMuted">Algorithm</th>
                <th className="px-6 py-4 font-medium text-textMuted">Score</th>
                <th className="px-6 py-4 font-medium text-textMuted text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder whitespace-nowrap">
              {activeRound && activeRound.bestSolver !== ethersZeroAddress ? (
                <tr className="bg-accent/5">
                  <td className="px-6 py-4 font-mono text-accent">01</td>
                  <td className="px-6 py-4 font-mono">{formatAddress(activeRound.bestSolver)}</td>
                  <td className="px-6 py-4 text-textMuted text-xs">Genetic Algorithm</td>
                  <td className="px-6 py-4 font-mono text-lg">{activeRound.bestScore}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-block px-2 py-1 bg-accent/20 text-accent text-xs rounded">LEADING</span>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-textMuted">No solutions submitted yet.</td>
                </tr>
              )}
              {/* Baseline reference */}
              <tr>
                <td className="px-6 py-4 font-mono text-textMuted">02</td>
                <td className="px-6 py-4 font-mono text-textMuted">0x0000...0000</td>
                <td className="px-6 py-4 text-textMuted text-xs">Baseline</td>
                <td className="px-6 py-4 font-mono text-textMuted">125</td>
                <td className="px-6 py-4 text-right text-textMuted text-xs">SOLVED</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
