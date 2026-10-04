import { Code, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../utils';

interface SolutionPanelProps {
  weights: string[];
  setWeights: (w: string[]) => void;
  handleSubmitSolution: () => void;
  pendingTx: string;
  account: string;
  activeRound: any;
}

export function SolutionPanel({ weights, setWeights, handleSubmitSolution, pendingTx, account, activeRound }: SolutionPanelProps) {
  const isEnded = activeRound ? (Date.now() / 1000 >= Number(activeRound.deadline)) : false;
  const numWeights = weights.map(w => parseFloat(w || '0'));
  const totalWeight = numWeights.reduce((a, b) => a + b, 0);
  const holdingsCount = numWeights.filter(w => w > 0).length;
  
  const isSumValid = Math.abs(totalWeight - 100) < 0.01;
  const isHoldingsValid = holdingsCount <= 5;
  const isPosValid = numWeights.every(w => w === 0 || (w >= 5 && w <= 25));

  const isValid = isSumValid && isHoldingsValid && isPosValid;

  const handleSliderChange = (i: number, val: string) => {
    const newW = [...weights];
    newW[i] = val;
    setWeights(newW);
  };

  return (
    <div className="bg-surface border border-surfaceBorder rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-semibold flex items-center space-x-2">
        <Code className="w-5 h-5 text-accent" />
        <span>Submit Solution</span>
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between text-xs text-textMuted uppercase tracking-wider mb-2">
          <span>Asset</span>
          <span>Weight (%)</span>
        </div>
        {weights.map((w, i) => {
          const val = parseFloat(w || '0');
          const isInvalid = val > 0 && (val < 5 || val > 25);
          return (
            <div key={i} className="flex items-center space-x-4">
              <span className="text-sm font-mono w-16">AST_{String(i+1).padStart(2, '0')}</span>
              <input 
                type="range"
                min="0" max="100" step="0.01"
                value={w}
                onChange={e => handleSliderChange(i, e.target.value)}
                className="flex-1 accent-accent"
              />
              <div className="relative w-20">
                <input 
                  type="number"
                  value={w}
                  onChange={e => handleSliderChange(i, e.target.value)}
                  className={cn(
                    "w-full bg-background border rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-accent text-right",
                    isInvalid ? "border-red-500 text-red-400" : "border-surfaceBorder"
                  )}
                />
                <span className="absolute right-2 top-1.5 text-xs text-textMuted pointer-events-none">%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t border-surfaceBorder space-y-3 text-sm bg-background/30 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          {isSumValid ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <XCircle className="w-4 h-4 text-red-400" />}
          <span className={cn(isSumValid ? "text-textMain" : "text-red-400")}>
            Total = 100% (Current: {totalWeight.toFixed(2)}%)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {isHoldingsValid ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <XCircle className="w-4 h-4 text-red-400" />}
          <span className={cn(isHoldingsValid ? "text-textMain" : "text-red-400")}>
            Maximum 5 holdings (Current: {holdingsCount})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {isPosValid ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <XCircle className="w-4 h-4 text-red-400" />}
          <span className={cn(isPosValid ? "text-textMain" : "text-red-400")}>
            Positions within limits (5% - 25%)
          </span>
        </div>
      </div>

      <button 
        onClick={handleSubmitSolution}
        disabled={!isValid || !account || pendingTx !== '' || isEnded}
        className="w-full py-3 bg-accent text-background font-semibold rounded-lg hover:bg-accentHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pendingTx || 'SUBMIT SOLUTION'}
      </button>
      {isEnded && (
        <p className="text-sm text-center text-orange-400">
          This round has ended. Wait for settlement or create a new round.
        </p>
      )}
    </div>
  );
}
