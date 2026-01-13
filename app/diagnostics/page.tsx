'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/web3-config';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function ContractDiagnosticPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    const diagnostics: DiagnosticResult[] = [];

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        diagnostics.push({
          name: 'Wallet Connection',
          status: 'error',
          message: 'MetaMask not found',
          details: 'Please install MetaMask to continue'
        });
        setResults(diagnostics);
        setRunning(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // 1. Check FlexCreditCore deployment
      diagnostics.push({
        name: '1. FlexCreditCore Deployment',
        status: 'success',
        message: `Contract address: ${CONTRACT_ADDRESSES.FlexCreditCore}`,
      });

      const flexCreditCore = new ethers.Contract(
        CONTRACT_ADDRESSES.FlexCreditCore,
        CONTRACT_ABIS.FlexCreditCore,
        provider
      );

      // Check if contract has code
      const code = await provider.getCode(CONTRACT_ADDRESSES.FlexCreditCore);
      if (code === '0x') {
        diagnostics.push({
          name: '1a. FlexCreditCore Code',
          status: 'error',
          message: 'No code at address',
          details: 'Contract not deployed or wrong address'
        });
      } else {
        diagnostics.push({
          name: '1a. FlexCreditCore Code',
          status: 'success',
          message: `Contract deployed (${code.length} bytes)`
        });
      }

      // 2. Check IncomeProofVerifier deployment
      diagnostics.push({
        name: '2. IncomeProofVerifier Deployment',
        status: 'success',
        message: `Contract address: ${CONTRACT_ADDRESSES.IncomeProofVerifier}`,
      });

      const incomeVerifier = new ethers.Contract(
        CONTRACT_ADDRESSES.IncomeProofVerifier,
        CONTRACT_ABIS.IncomeProofVerifier,
        provider
      );

      const verifierCode = await provider.getCode(CONTRACT_ADDRESSES.IncomeProofVerifier);
      if (verifierCode === '0x') {
        diagnostics.push({
          name: '2a. IncomeProofVerifier Code',
          status: 'error',
          message: 'No code at address',
          details: 'Contract not deployed or wrong address'
        });
      } else {
        diagnostics.push({
          name: '2a. IncomeProofVerifier Code',
          status: 'success',
          message: `Contract deployed (${verifierCode.length} bytes)`
        });
      }

      // 3. Check FlexCreditCore address in IncomeProofVerifier
      try {
        const flexCreditCoreInVerifier = await incomeVerifier.flexCreditCore();
        
        if (flexCreditCoreInVerifier.toLowerCase() === CONTRACT_ADDRESSES.FlexCreditCore.toLowerCase()) {
          diagnostics.push({
            name: '3. FlexCreditCore Address in Verifier',
            status: 'success',
            message: 'Correct address configured',
            details: flexCreditCoreInVerifier
          });
        } else {
          diagnostics.push({
            name: '3. FlexCreditCore Address in Verifier',
            status: 'error',
            message: 'WRONG ADDRESS!',
            details: `Expected: ${CONTRACT_ADDRESSES.FlexCreditCore}\nActual: ${flexCreditCoreInVerifier}\n\nYou need to redeploy IncomeProofVerifier with the correct address!`
          });
        }
      } catch (error: any) {
        diagnostics.push({
          name: '3. FlexCreditCore Address in Verifier',
          status: 'error',
          message: 'Cannot read flexCreditCore()',
          details: error.message
        });
      }

      // 4. Check if IncomeProofVerifier is authorized
      try {
        const isAuthorized = await flexCreditCore.authorizedVerifiers(CONTRACT_ADDRESSES.IncomeProofVerifier);
        
        if (isAuthorized) {
          diagnostics.push({
            name: '4. IncomeProofVerifier Authorization',
            status: 'success',
            message: 'Verifier is AUTHORIZED ✅',
            details: 'Can call applyIncomeScore on FlexCreditCore'
          });
        } else {
          diagnostics.push({
            name: '4. IncomeProofVerifier Authorization',
            status: 'error',
            message: 'Verifier is NOT AUTHORIZED ❌',
            details: `You must call:\nflexCreditCore.authorizeVerifier("${CONTRACT_ADDRESSES.IncomeProofVerifier}", true)`
          });
        }
      } catch (error: any) {
        diagnostics.push({
          name: '4. IncomeProofVerifier Authorization',
          status: 'error',
          message: 'Cannot check authorization',
          details: error.message
        });
      }

      // 5. Check owner
      try {
        const owner = await flexCreditCore.owner();
        diagnostics.push({
          name: '5. FlexCreditCore Owner',
          status: 'success',
          message: `Owner: ${owner}`,
          details: owner === userAddress ? 'You are the owner ✅' : 'You are NOT the owner'
        });
      } catch (error: any) {
        diagnostics.push({
          name: '5. FlexCreditCore Owner',
          status: 'warning',
          message: 'Cannot read owner',
          details: error.message
        });
      }

      // 6. Check user's current credit info
      try {
        const creditInfo = await flexCreditCore.getCreditInfo(userAddress);
        diagnostics.push({
          name: '6. Your Credit Info',
          status: 'success',
          message: 'Successfully read credit info',
          details: `Income Score: ${creditInfo.income}\nCredit Limit: ${ethers.formatUnits(creditInfo.limit, 6)} USDC\nUsed: ${ethers.formatUnits(creditInfo.used, 6)} USDC\nAvailable: ${ethers.formatUnits(creditInfo.available, 6)} USDC`
        });
      } catch (error: any) {
        diagnostics.push({
          name: '6. Your Credit Info',
          status: 'warning',
          message: 'Cannot read credit info',
          details: error.message
        });
      }

      // 7. Network check
      const network = await provider.getNetwork();
      diagnostics.push({
        name: '7. Network',
        status: 'success',
        message: `Connected to: ${network.name}`,
        details: `Chain ID: ${network.chainId}`
      });

    } catch (error: any) {
      diagnostics.push({
        name: 'General Error',
        status: 'error',
        message: error.message,
        details: error.stack
      });
    }

    setResults(diagnostics);
    setRunning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          Contract Diagnostics
        </h1>
        <p className="text-[var(--color-text-dim)] mb-8">
          Check your smart contract setup and identify issues
        </p>

        <button
          onClick={runDiagnostics}
          disabled={running}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold transition-all flex items-center gap-2 mb-8"
        >
          {running ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            <>
              Run Diagnostics
            </>
          )}
        </button>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.status === 'success'
                    ? 'bg-green-900/20 border-green-500/30'
                    : result.status === 'error'
                    ? 'bg-red-900/20 border-red-500/30'
                    : 'bg-yellow-900/20 border-yellow-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : result.status === 'error' ? (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${
                      result.status === 'success'
                        ? 'text-green-400'
                        : result.status === 'error'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}>
                      {result.name}
                    </h3>
                    <p className="text-gray-300 text-sm mb-2">{result.message}</p>
                    {result.details && (
                      <pre className="text-xs text-[var(--color-text-dim)] bg-black/30 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                        {result.details}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">How to Fix Issues</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div>
              <strong className="text-blue-400">If "Verifier is NOT AUTHORIZED":</strong>
              <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                <li>Go to your block explorer (Etherscan, etc.)</li>
                <li>Navigate to FlexCreditCore contract</li>
                <li>Go to "Write Contract" tab</li>
                <li>Connect your wallet (must be owner)</li>
                <li>Find <code className="bg-black/30 px-1 rounded">authorizeVerifier</code> function</li>
                <li>Enter IncomeProofVerifier address and <code className="bg-black/30 px-1 rounded">true</code></li>
                <li>Submit transaction and wait for confirmation</li>
              </ol>
            </div>
            <div>
              <strong className="text-blue-400">If "WRONG ADDRESS in Verifier":</strong>
              <p className="ml-4 mt-2">
                You need to redeploy IncomeProofVerifier with the correct FlexCreditCore address in the constructor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
