'use client';
import StarField from '@/components/StarField';
import { useState, useEffect } from 'react';
import { useAccount, useBalance, useConnect, useDisconnect, Connector } from 'wagmi';

const tabs = ['Swap', 'Pools', 'Farm', 'Bridge', 'Analytics', 'Governance'];
const networks = [
  { name: 'ETH', icon: '/eth.svg' },
  { name: 'Polygon', icon: '/polygon.svg' },
  { name: 'Sepolia', icon: '/sepolia.svg' },
  { name: 'Arbitrum', icon: '/arbitrum.svg' },
];
const tokens = [
  { name: 'ETH', icon: '/eth.svg', price: 3500 },
  { name: 'USDC', icon: '/usdc.svg', price: 1 },
];

export default function Home() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect(); 
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
  });

  const [usdBalance, setUsdBalance] = useState<number | null>(null);

  useEffect(() => {
    if (balance) {
      // Determine the cryptocurrency based on the chain or wallet
      const currency = balance.symbol.toLowerCase(); // Assuming balance.symbol gives the currency symbol

      // Fetch the exchange rate for the identified cryptocurrency to USD
      fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${currency}&vs_currencies=usd`)
        .then(response => response.json())
        .then(data => {
          const rate = data[currency]?.usd;
          if (rate) {
            // Convert balance.value from BigInt to Number
            const balanceInNumber = Number(balance.value);
            const convertedBalance = balanceInNumber * rate;
            setUsdBalance(parseFloat(convertedBalance.toFixed(2)));
          }
        })
        .catch(error => console.error('Error fetching exchange rate:', error));
    }
  }, [balance]);

  // State for form values
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [fromToken, setFromToken] = useState(tokens[0].name);
  const [toToken, setToToken] = useState(tokens[1].name);
  const [fromNetwork, setFromNetwork] = useState(networks[0].name);
  const [toNetwork, setToNetwork] = useState(networks[0].name);
  const [error, setError] = useState<string>('');
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  // Calculate conversion when fromAmount changes
  useEffect(() => {
    if (fromAmount && !isNaN(Number(fromAmount))) {
      const fromTokenData = tokens.find(t => t.name === fromToken);
      const toTokenData = tokens.find(t => t.name === toToken);
      
      if (fromTokenData && toTokenData) {
        const convertedAmount = (Number(fromAmount) * fromTokenData.price) / toTokenData.price;
        setToAmount(convertedAmount.toFixed(6));
      }
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  // Validate and handle form submission
  const handleSwap = () => {
    // Reset error
    setError('');

    // Basic validation
    if (!fromAmount || !toAmount) {
      setError('Please enter an amount');
      return;
    }

    if (fromToken === toToken) {
      setError('Cannot swap to same token');
      return;
    }

    if (fromNetwork !== toNetwork) {
      setError('Cross-chain swaps not supported yet');
      return;
    }

    // Here you would typically trigger the actual swap
    console.log('Swap initiated:', {
      fromAmount,
      toAmount,
      fromToken,
      toToken,
      fromNetwork,
      toNetwork
    });
  };

  // Swap tokens and values
  const handleSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Handle wallet connection
  const handleConnectWallet = () => {
    setShowWalletModal(true);
  };

  const handleSelectWallet = (connector: Connector) => {
    connect({ connector });
    setShowWalletModal(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Safe to use localStorage here
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <StarField />
      
      {/* Navigation */}
      <nav className="w-full px-4 py-4 flex flex-col sm:flex-row justify-between items-center bg-black/20 backdrop-blur-sm">
        <div className="text-2xl font-bold mb-4 sm:mb-0">Space Swap</div>
        <div className="flex-1 flex justify-center mb-4 sm:mb-0">
          <div className="flex gap-4 sm:gap-6 bg-black/30 px-4 sm:px-6 py-2 rounded-xl border border-white/10">
            {tabs.map((tab) => (
              <button key={tab} className="text-gray-400 hover:text-white transition-colors">
                {tab}
              </button>
            ))}
          </div>
        </div>
        {isConnected ? (
          <div className="flex items-center gap-2 sm:gap-4 border border-[#2b4c34] px-2 sm:px-4 py-2 rounded-lg">
            <span className="text-white">
              {usdBalance !== null ? `$${usdBalance}` : `${balance?.formatted} ${balance?.symbol}`}
            </span>
            <span className="text-gray-400">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <button onClick={() => disconnect()} className="text-red-500">Disconnect</button>
          </div>
        ) : (
          <button 
            onClick={handleConnectWallet}
            className="px-4 py-2 rounded-lg bg-[#1c2b21] hover:bg-[#243329] text-white transition-colors border border-[#2b4c34]"
          >
            Connect Wallet
          </button>
        )}
      </nav>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-black text-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg mb-4">Select Wallet</h2>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => handleSelectWallet(connector)}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                {connector.name}
              </button>
            ))}
            <button
              onClick={() => setShowWalletModal(false)}
              className="mt-4 block w-full text-left px-4 py-2 bg-red-500 text-white hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="w-full max-w-4xl text-center my-16 sm:my-32 px-4">
        <h1 className="text-4xl sm:text-6xl font-light mb-4 sm:mb-6">The Gateway<br />to DeFi</h1>
        <p className="text-gray-400 text-base sm:text-lg">
          All in one decentralized exchange for leveraging diversified funds<br />
          across ecosystems, with the speed of Ethereum
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <button className="p-3 rounded-xl bg-black/30 hover:bg-black/40 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </button>
          <button className="p-3 rounded-xl bg-black/30 hover:bg-black/40 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </button>
          <button className="p-3 rounded-xl bg-black/30 hover:bg-black/40 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Updated Swap Section */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md mb-10 sm:mb-20">
        <div className="bg-black/50 backdrop-blur-lg p-4 sm:p-6 rounded-2xl w-full border border-white/5">
          <div className="text-lg sm:text-xl mb-4 sm:mb-6">Swap</div>
          
          <div className="space-y-4">
            <div className="bg-black/30 p-4 rounded-xl">
              <div className="flex justify-between mb-2">
                <div className="text-sm text-gray-400">From</div>
                <select 
                  className="bg-transparent text-sm text-gray-400"
                  value={fromNetwork}
                  onChange={(e) => setFromNetwork(e.target.value)}
                >
                  {networks.map(network => (
                    <option key={network.name} value={network.name}>
                      {network.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <input 
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="bg-transparent w-full outline-none text-lg"
                />
                <select 
                  className="bg-black/30 px-2 py-1 rounded text-sm"
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                >
                  {tokens.map(token => (
                    <option key={token.name} value={token.name}>
                      {token.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Switch Tokens Button */}
            <button 
              onClick={handleSwitchTokens}
              className="w-8 h-8 mx-auto flex items-center justify-center rounded-full bg-black/30 hover:bg-black/40 transition-colors"
            >
              ↓
            </button>

            <div className="bg-black/30 p-4 rounded-xl">
              <div className="flex justify-between mb-2">
                <div className="text-sm text-gray-400">To</div>
                <select 
                  className="bg-transparent text-sm text-gray-400"
                  value={toNetwork}
                  onChange={(e) => setToNetwork(e.target.value)}
                >
                  {networks.map(network => (
                    <option key={network.name} value={network.name}>
                      {network.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <input 
                  type="number"
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                  className="bg-transparent w-full outline-none text-lg"
                />
                <select 
                  className="bg-black/30 px-2 py-1 rounded text-sm"
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                >
                  {tokens.map(token => (
                    <option key={token.name} value={token.name}>
                      {token.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button 
              onClick={handleSwap}
              className="w-full bg-[#1c2b21] hover:bg-[#243329] text-white py-3 rounded-xl transition-colors border border-[#2b4c34] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!fromAmount || !toAmount || !!error}
            >
              Swap
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
