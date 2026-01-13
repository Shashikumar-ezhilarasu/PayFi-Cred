'use client';

import { useEffect, useState } from 'react';
import { ethers, Contract } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/web3-config';

export default function DebugPage() {
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const checkStatus = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('No crypto wallet found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum as any);
      
      // Contracts
      const flexCreditCore = new Contract(
        CONTRACT_ADDRESSES.FlexCreditCore,
        CONTRACT_ABIS.FlexCreditCore,
        provider
      );

      const incomeVerifier = new Contract(
        CONTRACT_ADDRESSES.IncomeProofVerifier,
        CONTRACT_ABIS.IncomeProofVerifier,
        provider
      );

      // Fetch Data
      const [
        flexOwner,
        isAuthorized,
        linkedCreditCore
      ] = await Promise.all([
        flexCreditCore.owner().catch((e: any) => `Error: ${e.message}`),
        flexCreditCore.authorizedVerifiers(CONTRACT_ADDRESSES.IncomeProofVerifier).catch((e: any) => `Error: ${e.message}`),
        incomeVerifier.creditCore().catch((e: any) => `Error: ${e.message}`)
      ]);

      setStatus({
        flexCreditCoreAddress: CONTRACT_ADDRESSES.FlexCreditCore,
        incomeVerifierAddress: CONTRACT_ADDRESSES.IncomeProofVerifier,
        flexOwner,
        isAuthorized,
        linkedCreditCore,
        isLinkedCorrectly: linkedCreditCore === CONTRACT_ADDRESSES.FlexCreditCore
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="p-8 text-white min-h-screen bg-[var(--bg)]">
      <h1 className="text-3xl font-bold mb-6">Contract Debugger</h1>
      
      {loading && <p>Loading...</p>}
      {error && <div className="p-4 bg-red-900 mb-4 rounded">{error}</div>}

      {!loading && !error && (
        <div className="space-y-6">
          <div className="p-6 bg-[var(--card)] rounded-xl border border-[var(--color-accent)]/20">
            <h2 className="text-xl font-bold mb-4 text-green-400">Configuration Check</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--card)] rounded">
                <h3 className="font-bold text-[var(--color-text-dim)] text-sm">FlexCreditCore</h3>
                <p className="font-mono text-sm break-all">{status.flexCreditCoreAddress}</p>
                <div className="mt-2 text-sm">
                  <span className="text-[var(--color-text-dim)]">Owner: </span>
                  <span className="font-mono">{status.flexOwner}</span>
                </div>
              </div>

              <div className="p-4 bg-[var(--card)] rounded">
                <h3 className="font-bold text-[var(--color-text-dim)] text-sm">IncomeProofVerifier</h3>
                <p className="font-mono text-sm break-all">{status.incomeVerifierAddress}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[var(--card)] rounded-xl border border-[var(--color-accent)]/20">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Authorization Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--card)] rounded">
                <span>Is IncomeVerifier authorized in FlexCreditCore?</span>
                <span className={`px-3 py-1 rounded font-bold ${
                  status.isAuthorized === true ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {String(status.isAuthorized)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-[var(--card)] rounded">
                <span>Does IncomeVerifier point to correct FlexCreditCore?</span>
                <div className="text-right">
                  <span className={`block px-3 py-1 rounded font-bold mb-1 ${
                    status.isLinkedCorrectly ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {status.isLinkedCorrectly ? 'YES' : 'NO'}
                  </span>
                  <span className="text-xs font-mono text-[var(--color-text-dim)]">
                    Target: {status.linkedCreditCore}
                  </span>
                </div>
              </div>
            </div>
          </div>

            <div className="p-6 bg-yellow-900/20 rounded-xl border border-yellow-700/50">
            <h2 className="text-xl font-bold mb-4 text-yellow-400">Troubleshooting Actions</h2>
            <p className="mb-4 text-gray-300">
              If "Is IncomeVerifier authorized" is false, the owner ({status.flexOwner}) needs to run the authorization transaction.
            </p>
            
            {!status.isAuthorized && status.flexOwner && (
              <div className="mb-4">
                 <button
                  onClick={async () => {
                    try {
                      if (!window.ethereum) return;
                      const provider = new ethers.BrowserProvider(window.ethereum as any);
                      const signer = await provider.getSigner();
                      const contract = new Contract(
                        CONTRACT_ADDRESSES.FlexCreditCore,
                        CONTRACT_ABIS.FlexCreditCore,
                        signer
                      );
                      const tx = await contract.authorizeVerifier(CONTRACT_ADDRESSES.IncomeProofVerifier, true);
                      alert(`Transaction sent: ${tx.hash}`);
                      await tx.wait();
                      alert('Authorized successfully!');
                      checkStatus();
                    } catch (e: any) {
                      alert(`Error: ${e.message}`);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold text-white transition-colors"
                >
                  Authorize IncomeVerifier
                </button>
              </div>
            )}

            <code className="block p-4 bg-black rounded text-green-400 font-mono text-sm overflow-x-auto">
              flexCreditCore.authorizeVerifier('{status.incomeVerifierAddress}', true)
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
