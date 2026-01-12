/**
 * React Hook for incoJS Encryption
 * Client-side hook for encrypting values
 */
'use client';

import { useState, useCallback } from 'react';
import type { Address } from 'viem';
import type { HexString } from '@inco/js';
import {
  encryptUint256,
  encryptBool,
  encryptAddress,
  encryptCreditScore,
  encryptIncome,
} from '@/lib/inco-encryption';

export function useIncoEncryption() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (
      value: bigint | boolean | Address,
      accountAddress: Address,
      dappAddress: Address,
      type: 'uint256' | 'bool' | 'address' = 'uint256'
    ): Promise<HexString | null> => {
      setIsEncrypting(true);
      setError(null);

      try {
        let result: HexString;

        switch (type) {
          case 'uint256':
            result = await encryptUint256(value as bigint, {
              accountAddress,
              dappAddress,
            });
            break;
          case 'bool':
            result = await encryptBool(value as boolean, {
              accountAddress,
              dappAddress,
            });
            break;
          case 'address':
            result = await encryptAddress(value as Address, {
              accountAddress,
              dappAddress,
            });
            break;
          default:
            throw new Error('Unsupported type');
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed');
        setError(error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    []
  );

  const encryptScore = useCallback(
    async (
      score: number,
      accountAddress: Address,
      dappAddress: Address
    ): Promise<HexString | null> => {
      setIsEncrypting(true);
      setError(null);

      try {
        const result = await encryptCreditScore(score, {
          accountAddress,
          dappAddress,
        });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Credit score encryption failed');
        setError(error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    []
  );

  const encryptIncomeAmount = useCallback(
    async (
      amount: bigint,
      accountAddress: Address,
      dappAddress: Address
    ): Promise<HexString | null> => {
      setIsEncrypting(true);
      setError(null);

      try {
        const result = await encryptIncome(amount, {
          accountAddress,
          dappAddress,
        });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Income encryption failed');
        setError(error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    []
  );

  return {
    encrypt,
    encryptScore,
    encryptIncomeAmount,
    isEncrypting,
    error,
  };
}
