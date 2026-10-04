import { formatAddress } from '../utils';

interface HeaderProps {
  account: string;
  connectWallet: () => void;
}

export function Header({ account, connectWallet }: HeaderProps) {
  return (
    <nav className="border-b border-surfaceBorder bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold tracking-tight">SolverArena</h1>
          <div className="hidden md:flex space-x-6 text-sm font-medium text-textMuted">
            <a href="#arena" className="hover:text-textMain transition-colors">Arena</a>
            <a href="#solvers" className="hover:text-textMain transition-colors">Solvers</a>
            <a href="#how-it-works" className="hover:text-textMain transition-colors">How It Works</a>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full bg-surface border border-surfaceBorder">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="hidden sm:inline">MONAD TESTNET</span>
            <span className="sm:hidden">MONAD</span>
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
  );
}
