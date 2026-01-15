/**
 * Private Income Verification Component
 * Example usage of incoJS for confidential income verification
 */
'use client';

import { useState } from 'react';
import { useIncoEncryption } from '@/hooks/useIncoEncryption';
import { useIncoCompute } from '@/hooks/useIncoCompute';
import type { HexString } from '@inco/js';
import type { Address } from 'viem';

interface PrivateIncomeVerificationProps {
  accountAddress: Address;
  dappAddress: Address;
  minimumIncome?: bigint;
}

export function PrivateIncomeVerification({
  accountAddress,
  dappAddress,
  minimumIncome = BigInt(50000), // $50,000 default
}: PrivateIncomeVerificationProps) {
  const [income, setIncome] = useState<string>('75000');
  const [encryptedHandle, setEncryptedHandle] = useState<HexString | null>(null);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  
  const { encryptIncomeAmount, isEncrypting, error: encryptError } = useIncoEncryption();
  const { verifyIncome, isComputing, error: computeError } = useIncoCompute();

  const handleEncrypt = async () => {
    const incomeAmount = BigInt(income);
    const handle = await encryptIncomeAmount(incomeAmount, accountAddress, dappAddress);
    if (handle) {
      setEncryptedHandle(handle);
      console.log('Encrypted income handle:', handle);
    }
  };

  const handleVerify = async () => {
    if (!encryptedHandle) return;

    const result = await verifyIncome(encryptedHandle, minimumIncome);
    if (result) {
      setIsEligible(result.isEligible);
      console.log('Income eligibility:', result.isEligible);
      console.log('Attestation handle:', result.result.handle);
    }
  };

  const formatCurrency = (amount: bigint) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col items-center justify-center max-w-md mx-auto overflow-x-hidden">
      <h2 className="text-2xl font-bold mb-4 text-center">Private Income Verification</h2>
      
      <div className="space-y-4 w-full">
        {/* Income Input */}
        <div className="w-full">
          <label className="block text-sm font-medium mb-2">
            Annual Income (will be encrypted)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={!!encryptedHandle}
            placeholder="75000"
            style={{ textAlign: 'center' }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum required: {formatCurrency(minimumIncome)}
          </p>
        </div>

        {/* Encrypt Button */}
        <button
          onClick={handleEncrypt}
          disabled={isEncrypting || !!encryptedHandle}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          style={{ display: 'block', margin: '0 auto' }}
        >
          {isEncrypting ? 'Encrypting...' : encryptedHandle ? 'Encrypted ✓' : 'Encrypt Income'}
        </button>

        {/* Encrypted Handle Display */}
        {encryptedHandle && (
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded w-full">
            <p className="text-xs font-mono break-all text-center">
              <strong>Encrypted Handle:</strong> {encryptedHandle}
            </p>
          </div>
        )}

        {/* Verify Button */}
        {encryptedHandle && (
          <button
            onClick={handleVerify}
            disabled={isComputing}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            style={{ display: 'block', margin: '0 auto' }}
          >
            {isComputing ? 'Verifying...' : `Verify Income (≥ ${formatCurrency(minimumIncome)})`}
          </button>
        )}

        {/* Result Display */}
        {isEligible !== null && (
          <div
            className={`p-4 rounded-lg text-center ${
              isEligible
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
            }`}
          >
            <p className="font-semibold">
              {isEligible
                ? '✓ Income Verified'
                : `✗ Income Below Minimum (${formatCurrency(minimumIncome)})`}
            </p>
            <p className="text-sm mt-2">
              Income verified without revealing actual amount
            </p>
          </div>
        )}

        {/* Errors */}
        {(encryptError || computeError) && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded text-center">
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{encryptError?.message || computeError?.message}</p>
          </div>
        )}

        {/* Reset */}
        {encryptedHandle && (
          <button
            onClick={() => {
              setEncryptedHandle(null);
              setIsEligible(null);
            }}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            style={{ display: 'block', margin: '0 auto' }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>How it works:</strong> Your income is encrypted on the client side, 
          then confidentially compared against the minimum requirement off-chain. 
          Only the result (eligible/not eligible) is revealed, keeping your actual 
          income private.
        </p>
      </div>
    </div>
  );
}
