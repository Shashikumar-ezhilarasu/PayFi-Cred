'use client';

import { useState } from 'react';
import { ethers } from 'ethers';

export default function NetworkVerificationPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkNetwork = async () => {
    setLoading(true);
    const checks: any = {};

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        checks.metamask = '❌ MetaMask not installed';
        setResults(checks);
        setLoading(false);
        return;
      }

      checks.metamask = '✅ MetaMask installed';

      // Get current network from MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      checks.chainId = {
        current: chainId,
        expected: 8119,
        status: chainId === 8119 ? '✅ CORRECT' : '❌ WRONG',
        message: chainId === 8119 
          ? 'Connected to Shardeum Mezame' 
          : `Connected to Chain ID ${chainId} instead of 8119`
      };

      // Get RPC URL (if possible)
      try {
        const rpcUrl = await window.ethereum.request({ 
          method: 'wallet_getPermissions' 
        });
        checks.rpc = '✅ RPC accessible';
      } catch {
        checks.rpc = '⚠️ Could not verify RPC';
      }

      // Check if we can fetch a block
      try {
        const blockNumber = await provider.getBlockNumber();
        checks.blockNumber = {
          status: '✅ RPC responding',
          value: blockNumber
        };
      } catch (err: any) {
        checks.blockNumber = {
          status: '❌ RPC not responding',
          error: err.message
        };
      }

      // Check contract code at FlexCreditCore address
      const flexAddress = '0xF21C05d1AEE9b444C90855A9121a28bE941785B5';
      try {
        const code = await provider.getCode(flexAddress);
        checks.flexCreditCore = {
          address: flexAddress,
          status: (code !== '0x' && code !== '0x0') ? '✅ Contract exists' : '❌ No contract',
          codeLength: code.length,
          message: (code !== '0x' && code !== '0x0') 
            ? `Contract deployed (${code.length} bytes)` 
            : 'No contract code at this address on current network'
        };
      } catch (err: any) {
        checks.flexCreditCore = {
          address: flexAddress,
          status: '❌ Error',
          error: err.message
        };
      }

      // Get connected account
      try {
        const accounts = await provider.listAccounts();
        checks.account = {
          status: accounts.length > 0 ? '✅ Connected' : '❌ Not connected',
          address: accounts[0]?.address || 'None'
        };
      } catch (err: any) {
        checks.account = {
          status: '❌ Error',
          error: err.message
        };
      }

    } catch (err: any) {
      checks.error = err.message;
    }

    setResults(checks);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🔍 Network Connection Diagnostic</h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Expected Configuration</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>Network:</strong> Shardeum EVM Testnet</p>
            <p><strong>Chain ID:</strong> 8119</p>
            <p><strong>RPC URL:</strong> https://api-mezame.shardeum.org</p>
            <p><strong>Explorer:</strong> https://explorer-mezame.shardeum.org</p>
          </div>
          
          <button
            onClick={checkNetwork}
            disabled={loading}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Run Network Check'}
          </button>
        </div>

        {results && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Results</h3>
            
            <div className="space-y-4">
              {/* MetaMask */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">MetaMask</h4>
                <p className="text-gray-300">{results.metamask}</p>
              </div>

              {/* Chain ID */}
              {results.chainId && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Chain ID {results.chainId.status}</h4>
                  <p className="text-gray-300">Current: {results.chainId.current}</p>
                  <p className="text-gray-300">Expected: {results.chainId.expected}</p>
                  <p className={`mt-2 font-semibold ${
                    results.chainId.status.includes('✅') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {results.chainId.message}
                  </p>
                </div>
              )}

              {/* Block Number */}
              {results.blockNumber && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">RPC Connection {results.blockNumber.status}</h4>
                  {results.blockNumber.value && (
                    <p className="text-gray-300">Current Block: {results.blockNumber.value}</p>
                  )}
                  {results.blockNumber.error && (
                    <p className="text-red-400">{results.blockNumber.error}</p>
                  )}
                </div>
              )}

              {/* FlexCreditCore */}
              {results.flexCreditCore && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">FlexCreditCore {results.flexCreditCore.status}</h4>
                  <p className="text-gray-300 text-sm font-mono break-all">
                    Address: {results.flexCreditCore.address}
                  </p>
                  <p className={`mt-2 ${
                    results.flexCreditCore.status.includes('✅') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {results.flexCreditCore.message || results.flexCreditCore.error}
                  </p>
                </div>
              )}

              {/* Account */}
              {results.account && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Wallet {results.account.status}</h4>
                  <p className="text-gray-300 text-sm font-mono break-all">
                    {results.account.address}
                  </p>
                </div>
              )}
            </div>

            {/* Solution */}
            {results.chainId && results.chainId.status.includes('❌') && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h4 className="text-red-400 font-semibold mb-2">🚨 ACTION REQUIRED</h4>
                <p className="text-red-300 mb-3">
                  You are connected to the WRONG network (Chain ID: {results.chainId.current})
                </p>
                <div className="bg-black/30 p-3 rounded">
                  <p className="text-white font-semibold mb-2">Switch to Shardeum Mezame:</p>
                  <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                    <li>Open MetaMask</li>
                    <li>Click the network dropdown at the top</li>
                    <li>Select "Shardeum EVM Testnet"</li>
                    <li>If not in list, add it manually with Chain ID: 8119</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              </div>
            )}

            {results.flexCreditCore && results.flexCreditCore.status.includes('❌') && results.chainId?.status.includes('✅') && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <h4 className="text-yellow-400 font-semibold mb-2">⚠️ CONTRACT NOT FOUND</h4>
                <p className="text-yellow-300 mb-2">
                  You are on the correct network (Chain ID 8119), but the contract doesn't exist at this address.
                </p>
                <p className="text-yellow-300">
                  Please verify the contract address in <code className="bg-black/30 px-1 rounded">lib/web3-config.ts</code> matches your deployment on Shardeum explorer.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
