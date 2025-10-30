/**
 * xGate Gateway Home Page
 */

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              xGate Protocol
            </h1>
            <p className="text-xl text-gray-300">
              Pay-Per-Tool AI Agent Router
            </p>
            <p className="text-gray-400 mt-2">
              HTTP 402 • x402 • USDC on Base
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold mb-2">Agent-Native</h3>
              <p className="text-sm text-gray-300">
                AI agents can dynamically purchase API calls without keys
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Micropayments</h3>
              <p className="text-sm text-gray-300">
                Pay $0.01-$0.05 per call via USDC on Base chain
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="text-3xl mb-3">🔓</div>
              <h3 className="text-lg font-semibold mb-2">Zero Signup</h3>
              <p className="text-sm text-gray-300">
                No accounts, no API keys, just pay-as-you-go over HTTP
              </p>
            </div>
          </div>

          {/* Quick Start */}
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-8 border border-white/10 mb-12">
            <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-400">1. Install SDK</h3>
                <pre className="bg-black/50 rounded p-3 text-sm overflow-x-auto">
                  <code>npm install @xgate/sdk</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-400">2. Make a Call</h3>
                <pre className="bg-black/50 rounded p-3 text-sm overflow-x-auto">
                  <code>{`import { XGateClient } from '@xgate/sdk';

const client = new XGateClient({
  gatewayUrl: '${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}',
  autoPay: true
});

const result = await client.get('/api/tools/test');
console.log(result.data);`}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-400">3. Pay & Get Response</h3>
                <p className="text-gray-300 text-sm">
                  SDK automatically handles 402 responses, pays via x402, and retries with payment proof.
                </p>
              </div>
            </div>
          </div>

          {/* Endpoints */}
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-4">Available Endpoints</h2>
            
            <div className="space-y-3">
              <div className="bg-black/30 rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <code className="text-green-400">GET /api/tools/test</code>
                  <span className="text-purple-400 font-semibold">$0.01</span>
                </div>
                <p className="text-sm text-gray-300">
                  Test endpoint that returns a success message
                </p>
              </div>

              <div className="bg-black/30 rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <code className="text-green-400">POST /api/tools/test</code>
                  <span className="text-purple-400 font-semibold">$0.01</span>
                </div>
                <p className="text-sm text-gray-300">
                  Test endpoint that echoes back your request body
                </p>
              </div>

              <div className="bg-black/30 rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <code className="text-blue-400">GET /api/health</code>
                  <span className="text-green-400 font-semibold">Free</span>
                </div>
                <p className="text-sm text-gray-300">
                  Health check endpoint (no payment required)
                </p>
              </div>

              <div className="bg-black/30 rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <code className="text-blue-400">GET /api/prices</code>
                  <span className="text-green-400 font-semibold">Free</span>
                </div>
                <p className="text-sm text-gray-300">
                  List all endpoints and their prices
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-gray-400 text-sm">
            <p>Built with Next.js • Prisma • Neon • Coinbase x402</p>
            <p className="mt-2">
              <a href="https://x402.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                Learn about x402
              </a>
              {' • '}
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                View on GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

