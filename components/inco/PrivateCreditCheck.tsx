/**
 * Private Credit Verification Component
 * Example usage of incoJS for confidential credit checks
 */
'use client';

import { useState } from 'react';
import { useIncoEncryption } from '@/hooks/useIncoEncryption';
import { useIncoCompute } from '@/hooks/useIncoCompute';
import type { HexString } from '@inco/js';
import type { Address } from 'viem';

interface PrivateCreditCheckProps {
  accountAddress: Address;
  dappAddress: Address;
}

export function PrivateCreditCheck({ accountAddress, dappAddress }: PrivateCreditCheckProps) {
  const [creditScore, setCreditScore] = useState<number>(750);
  const [encryptedHandle, setEncryptedHandle] = useState<HexString | null>(null);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  
  const { encryptScore, isEncrypting, error: encryptError } = useIncoEncryption();
  const { verifyCreditScore, isComputing, error: computeError } = useIncoCompute();

  const handleEncrypt = async () => {
    const handle = await encryptScore(creditScore, accountAddress, dappAddress);
    if (handle) {
      setEncryptedHandle(handle);
      console.log('Encrypted credit score handle:', handle);
    }
  };

  const handleVerify = async () => {
    if (!encryptedHandle) return;

    const result = await verifyCreditScore(encryptedHandle, 700);
    if (result) {
      setIsEligible(result.isEligible);
      console.log('Credit eligibility:', result.isEligible);
      console.log('Attestation handle:', result.result.handle);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Private Credit Verification</h2>
      
      <div className="space-y-4">
        {/* Credit Score Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Credit Score (will be encrypted)
          </label>
          <input
            type="number"
            min="300"
            max="850"
            value={creditScore}
            onChange={(e) => setCreditScore(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={!!encryptedHandle}
            placeholder="Enter credit score (300-850)"
          />
        </div>

        {/* Encrypt Button */}
        <button
          onClick={handleEncrypt}
          disabled={isEncrypting || !!encryptedHandle}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isEncrypting ? 'Encrypting...' : encryptedHandle ? 'Encrypted ✓' : 'Encrypt Credit Score'}
        </button>

        {/* Encrypted Handle Display */}
        {encryptedHandle && (
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
            <p className="text-xs font-mono break-all">
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
          >
            {isComputing ? 'Verifying...' : 'Check Eligibility (≥ 700)'}
          </button>
        )}

        {/* Result Display */}
        {isEligible !== null && (
          <div
            className={`p-4 rounded-lg ${
              isEligible
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
            }`}
          >
            <p className="font-semibold">
              {isEligible
                ? '✓ Eligible for Credit'
                : '✗ Not Eligible (Score below 700)'}
            </p>
            <p className="text-sm mt-2">
              Credit score verified without revealing actual value
            </p>
          </div>
        )}

        {/* Errors */}
        {(encryptError || computeError) && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded">
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
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
