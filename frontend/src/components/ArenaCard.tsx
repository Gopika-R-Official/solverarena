import { Activity } from 'lucide-react';

interface ArenaCardProps {
  roundId: number | null;
  activeRound: any;
  account: string;
  handleCreateRound: () => void;
  pendingCreate: boolean;
  handleSettleRound: () => void;
  pendingTx: string;
}

export function ArenaCard({ roundId, activeRound, account, handleCreateRound, pendingCreate, handleSettleRound, pendingTx }: ArenaCardProps) {
  const isEnded = activeRound ? (Date.now() / 1000 >= Number(activeRound.deadline)) : false;
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Activity className="w-5 h-5 text-accent" />
          <span>Live Arena</span>
        </h3>
        {account && (
          <button 
            onClick={handleCreateRound} 
            disabled={pendingCreate}
            className="text-sm border border-surfaceBorder px-4 py-1.5 rounded-md hover:bg-surface disabled:opacity-50 transition-colors"
          >
            {pendingCreate ? 'Creating...' : 'Create Round'}
          </button>
        )}
      </div>

      {activeRound ? (
        <div className="bg-surface border border-surfaceBorder rounded-xl p-6 relative overflow-hidden group">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-textMuted mb-1 uppercase tracking-wider">Round ID</p>
              <p className="font-mono text-lg">{roundId}</p>
            </div>
            <div>
              <p className="text-xs text-textMuted mb-1 uppercase tracking-wider">Benchmark</p>
              <p className="font-medium text-sm pt-1">Portfolio Optimization</p>
            </div>
            <div>
              <p className="text-xs text-textMuted mb-1 uppercase tracking-wider">Reward</p>
              <p className="font-mono text-accent">{activeRound.reward} MON</p>
            </div>
            <div>
              <p className="text-xs text-textMuted mb-1 uppercase tracking-wider">Status</p>
              <p className="font-medium flex items-center space-x-1">
                {activeRound.settled ? (
                  <span className="text-red-400">Settled</span>
                ) : isEnded ? (
                  <span className="text-orange-400">Ended</span>
                ) : (
                  <span className="text-accent">Active</span>
                )}
              </p>
            </div>
          </div>
          {!activeRound.settled && isEnded && (
            <div className="mt-6 pt-4 border-t border-surfaceBorder flex items-center justify-between">
              <p className="text-sm text-textMuted">Round ended — settle to pay the winner.</p>
              <button 
                onClick={handleSettleRound}
                disabled={pendingTx !== ''}
                className="px-6 py-2 bg-accent text-background text-sm font-semibold rounded-md hover:bg-accentHover disabled:opacity-50 transition-colors"
              >
                {pendingTx === 'Settling round...' ? 'Settling...' : 'SETTLE ROUND'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface border border-surfaceBorder border-dashed rounded-xl p-12 text-center">
          <p className="text-textMuted">No active round. Connect wallet and create one.</p>
        </div>
      )}
    </section>
  );
}
