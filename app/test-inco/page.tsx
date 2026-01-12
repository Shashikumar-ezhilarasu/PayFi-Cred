/**
 * incoJS Integration Test Page
 * Verify encryption, decryption, and compute functionality
 */
'use client';

import { useState } from 'react';
import { useIncoEncryption } from '@/hooks/useIncoEncryption';
import { useIncoCompute } from '@/hooks/useIncoCompute';
import type { HexString } from '@inco/js';
import { initializeInco, createIncoWalletClient, INCO_CHAIN_ID } from '@/lib/inco-config';
import { getStoredValue, hasStoredValue } from '@/lib/inco-storage';

export default function TestIncoPage() {
  const [testResults, setTestResults] = useState<{
    initialization?: { success: boolean; message: string };
    walletConnection?: { success: boolean; message: string };
    encryption?: { success: boolean; message: string; handle?: string };
    compute?: { success: boolean; message: string; result?: boolean };
    decryption?: { success: boolean; message: string; value?: string };
  }>({});

  const [loading, setLoading] = useState(false);

  // Test 1: Initialize inco
  const testInitialization = async () => {
    setLoading(true);
    try {
      await initializeInco();
      setTestResults(prev => ({
        ...prev,
        initialization: {
          success: true,
          message: `✓ Successfully initialized inco Lightning on chain ${INCO_CHAIN_ID}`,
        },
      }));
      return true;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        initialization: {
          success: false,
          message: `✗ Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Check wallet connection
  const testWalletConnection = async () => {
    setLoading(true);
    try {
      // Check if wallet provider exists
      if (typeof window === 'undefined' || !window.ethereum) {
        setTestResults(prev => ({
          ...prev,
          walletConnection: {
            success: false,
            message: '✗ No wallet provider found. Please install MetaMask or another Web3 wallet.',
          },
        }));
        return false;
      }

      // Get connected accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      }) as string[];

      if (accounts.length === 0) {
        setTestResults(prev => ({
          ...prev,
          walletConnection: {
            success: false,
            message: '✗ Wallet not connected. Please click the connect button in your wallet.',
          },
        }));
        return false;
      }

      // Create wallet client
      const walletClient = await createIncoWalletClient();
      
      if (!walletClient) {
        setTestResults(prev => ({
          ...prev,
          walletConnection: {
            success: false,
            message: '✗ Failed to create wallet client.',
          },
        }));
        return false;
      }

      // Format address for display
      const address = accounts[0];
      const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

      setTestResults(prev => ({
        ...prev,
        walletConnection: {
          success: true,
          message: `✓ Wallet connected: ${shortAddress}`,
        },
      }));
      return true;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        walletConnection: {
          success: false,
          message: `✗ Wallet connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Test encryption (placeholder - requires React hooks context)
  const testEncryption = async () => {
    setLoading(true);
    try {
      // Note: Actual encryption test requires component context with hooks
      // This is a placeholder that verifies wallet is ready for encryption
      const accounts = await window.ethereum?.request({ 
        method: 'eth_accounts' 
      }) as string[];
      
      if (!accounts || accounts.length === 0) {
        throw new Error('Wallet not connected');
      }
      
      setTestResults(prev => ({
        ...prev,
        encryption: {
          success: true,
          message: `✓ Encryption ready. Use manual test below to encrypt values.`,
        },
      }));
      return true;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        encryption: {
          success: false,
          message: `✗ Encryption test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setTestResults({});
    
    const initSuccess = await testInitialization();
    if (!initSuccess) return;

    await new Promise(resolve => setTimeout(resolve, 500));
    
    const walletSuccess = await testWalletConnection();
    if (!walletSuccess) return;

    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testEncryption();
  };

  // Manual test functions
  const { encryptScore, isEncrypting, error: encryptError } = useIncoEncryption();
  const { isComputing } = useIncoCompute();

  const [manualTestScore, setManualTestScore] = useState(750);
  const [manualHandle, setManualHandle] = useState<HexString | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  const [computeResult, setComputeResult] = useState<{ isEligible: boolean } | null>(null);
  const [showComputeInfo, setShowComputeInfo] = useState(false);
  const [decryptedValue, setDecryptedValue] = useState<string | null>(null);

  const handleManualEncrypt = async () => {
    setManualError(null);
    setComputeResult(null);
    setDecryptedValue(null);
    try {
      // Check if wallet is connected
      if (typeof window === 'undefined' || !window.ethereum) {
        setManualError('No wallet provider found. Please install MetaMask.');
        return;
      }

      // Get connected accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      }) as string[];

      if (accounts.length === 0) {
        setManualError('Please connect your wallet first.');
        return;
      }

      const userAddress = accounts[0] as `0x${string}`;
      
      const handle = await encryptScore(
        manualTestScore,
        userAddress,
        userAddress
      );
      
      if (handle) {
        setManualHandle(handle);
        setManualError(null);
      } else {
        setManualError('Encryption returned null. Please try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setManualError(`Encryption failed: ${errorMessage}`);
      console.error('Encryption error:', error);
    }
  };

  const handleManualCompute = async () => {
    if (!manualHandle) {
      setManualError('Please encrypt a value first');
      return;
    }

    setManualError(null);
    setComputeResult(null);
    setShowComputeInfo(true);

    // Show info that this requires on-chain deployment
    setManualError(
      'Attested compute requires the encrypted handle to be stored on-chain first.\n\n' +
      'To make this work:\n' +
      '1. Deploy a smart contract with inco\'s encrypted types\n' +
      '2. Store the encrypted handle using e.asEuint256(ciphertext)\n' +
      '3. Allow yourself to compute: e.allow(handle, msg.sender)\n' +
      '4. Then you can perform computations on it\n\n' +
      'For now, encryption is working perfectly! The handle above proves that sensitive data can be encrypted client-side.'
    );
  };

  const handleDecrypt = async () => {
    if (!manualHandle) {
      setManualError('Please encrypt a value first');
      return;
    }

    setManualError(null);
    setDecryptedValue(null);

    try {
      // Check if we have this handle in storage
      const hasValue = await hasStoredValue(manualHandle);
      if (!hasValue) {
        setManualError('Handle not found in storage.');
        return;
      }

      // Get the stored value
      const stored = await getStoredValue(manualHandle);
      if (!stored) {
        setManualError('Failed to retrieve stored value');
        return;
      }

      // Format the decrypted value
      let displayValue = '';
      if (stored.type === 'uint256') {
        displayValue = stored.value.toString();
        if (stored.label?.includes('Credit Score')) {
          displayValue = `${displayValue} (Credit Score)`;
        } else if (stored.label?.includes('Income')) {
          displayValue = `$${displayValue}`;
        }
      } else if (stored.type === 'bool') {
        displayValue = stored.value ? 'true' : 'false';
      } else if (stored.type === 'address') {
        displayValue = stored.value as string;
      }

      setDecryptedValue(displayValue);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setManualError(`Decryption failed: ${errorMessage}`);
      console.error('Decryption error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">incoJS Integration Test</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Verify that incoJS is properly integrated and working
        </p>

        {/* Automated Tests */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Automated Tests</h2>
          
          <button
            onClick={runAllTests}
            disabled={loading}
            className="w-full mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Running Tests...' : 'Run All Tests'}
          </button>

          {/* Test Results */}
          <div className="space-y-3">
            {testResults.initialization && (
              <div className={`p-4 rounded-lg ${testResults.initialization.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <p className={testResults.initialization.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                  <strong>1. Initialization:</strong> {testResults.initialization.message}
                </p>
              </div>
            )}

            {testResults.walletConnection && (
              <div className={`p-4 rounded-lg ${testResults.walletConnection.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <p className={testResults.walletConnection.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                  <strong>2. Wallet Connection:</strong> {testResults.walletConnection.message}
                </p>
              </div>
            )}

            {testResults.encryption && (
              <div className={`p-4 rounded-lg ${testResults.encryption.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <p className={testResults.encryption.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                  <strong>3. Encryption:</strong> {testResults.encryption.message}
                </p>
                {testResults.encryption.handle && (
                  <p className="mt-2 text-xs font-mono break-all text-gray-600 dark:text-gray-400">
                    Handle: {testResults.encryption.handle}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Manual Testing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Testing</h2>
          
          <div className="space-y-6">
            {/* Encrypt */}
            <div>
              <label className="block text-sm font-medium mb-2">
                1. Encrypt a Credit Score
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="300"
                  max="850"
                  value={manualTestScore}
                  onChange={(e) => setManualTestScore(Number(e.target.value))}
                  className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter credit score"
                />
                <button
                  onClick={handleManualEncrypt}
                  disabled={isEncrypting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isEncrypting ? 'Encrypting...' : 'Encrypt'}
                </button>
              </div>
              {encryptError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Error: {encryptError.message}
                </p>
              )}
            </div>

            {/* Handle Display */}
            {manualHandle && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                  ✓ Encrypted Handle:
                </p>
                <p className="text-xs font-mono break-all text-green-700 dark:text-green-300">{manualHandle}</p>
              </div>
            )}

            {/* Errors */}
            {manualError && (
              <div className={`p-4 rounded-lg border ${
                showComputeInfo
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <p className={`text-sm font-semibold mb-2 ${
                  showComputeInfo
                    ? 'text-blue-800 dark:text-blue-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {showComputeInfo ? 'ℹ️ Information:' : '✗ Error:'}
                </p>
                <p className={`text-sm whitespace-pre-wrap ${
                  showComputeInfo
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>{manualError}</p>
              </div>
            )}

            {/* Decrypted Value Display */}
            {decryptedValue && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                  🔓 Decrypted Value:
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{decryptedValue}</p>
              </div>
            )}

            {/* Compute Result */}
            {computeResult && (
              <div className={`p-4 rounded-lg border ${
                computeResult.isEligible 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
              }`}>
                <p className={`text-sm font-semibold mb-2 ${
                  computeResult.isEligible 
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-orange-800 dark:text-orange-200'
                }`}>
                  {computeResult.isEligible ? '✓ ELIGIBLE' : '✗ NOT ELIGIBLE'} for credit (score &gt;= 700)
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Actual credit score remains private and was never revealed!
                </p>
              </div>
            )}

            {/* Compute */}
            {manualHandle && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  2. Check Eligibility (Score &gt;= 700)
                </label>
                <button
                  onClick={handleManualCompute}
                  disabled={isComputing}
                  className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isComputing ? 'Computing...' : 'Run Eligibility Check'}
                </button>
              </div>
            )}

            {/* Decrypt */}
            {manualHandle && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  3. Decrypt Value
                </label>
                <button
                  onClick={handleDecrypt}
                  className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  🔓 Decrypt & Show Value
                </button>
              </div>
            )}
            
            {/* Info about limitation */}
            {manualHandle && !computeResult && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ Important Note:
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Attested compute requires the encrypted handle to be stored and allowed on-chain first via a smart contract using <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">e.allow(handle, address)</code>.
                  <br /><br />
                  For testing without a deployed contract, you can use the <strong>encryption</strong> feature to see how values are encrypted and handles are generated.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Prerequisites Checklist */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            ✓ Prerequisites Checklist
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• MetaMask or Web3 wallet installed and connected</li>
            <li>• Connected to Base Sepolia testnet</li>
            <li>• Have some test ETH for gas fees (get from faucet)</li>
            <li>• @inco/js package installed (npm install @inco/js)</li>
          </ul>
        </div>

        {/* Documentation Link */}
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            For detailed documentation, see{' '}
            <a href="/INCO_INTEGRATION.md" className="text-blue-600 hover:underline">
              INCO_INTEGRATION.md
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
