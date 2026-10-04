export function HowItWorks() {
  return (
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
  );
}
