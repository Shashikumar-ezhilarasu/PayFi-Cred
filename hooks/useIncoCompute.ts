/**
 * React Hook for incoJS Compute
 * Client-side hook for confidential computations
 */
'use client';

import { useState, useCallback } from 'react';
import type { HexString } from '@inco/js';
import { AttestedComputeSupportedOps } from '@inco/js/lite';
import type { WalletClient } from 'viem';
import {
  attestedCompute,
  checkEquals,
  checkGreaterOrEqual,
  checkCreditEligibility,
  checkIncomeEligibility,
  type ComputeResult,
} from '@/lib/inco-compute';

export function useIncoCompute() {
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const compute = useCallback(
    async (
      handle: HexString,
      operation: typeof AttestedComputeSupportedOps[keyof typeof AttestedComputeSupportedOps],
      scalar: bigint,
      walletClient?: WalletClient
    ): Promise<ComputeResult | null> => {
      setIsComputing(true);
      setError(null);

      try {
        const result = await attestedCompute(handle, operation, scalar, walletClient);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Computation failed');
        setError(error);
        return null;
      } finally {
        setIsComputing(false);
      }
    },
    []
  );

  const compareEquals = useCallback(
    async (
      handle: HexString,
      target: bigint,
      walletClient?: WalletClient
    ): Promise<boolean | null> => {
      setIsComputing(true);
      setError(null);

      try {
        const result = await checkEquals(handle, target, walletClient);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Comparison failed');
        setError(error);
        return null;
      } finally {
        setIsComputing(false);
      }
    },
    []
  );

  const compareGreaterOrEqual = useCallback(
    async (
      handle: HexString,
      target: bigint,
      walletClient?: WalletClient
    ): Promise<boolean | null> => {
      setIsComputing(true);
      setError(null);

      try {
        const result = await checkGreaterOrEqual(handle, target, walletClient);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Comparison failed');
        setError(error);
        return null;
      } finally {
        setIsComputing(false);
      }
    },
    []
  );

  const verifyCreditScore = useCallback(
    async (
      creditScoreHandle: HexString,
      minimumScore: number = 700,
      walletClient?: WalletClient
    ): Promise<{ isEligible: boolean; result: ComputeResult } | null> => {
      setIsComputing(true);
      setError(null);

      try {
        const result = await checkCreditEligibility(
          creditScoreHandle,
          minimumScore,
          walletClient
        );
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Credit verification failed');
        setError(error);
        return null;
      } finally {
        setIsComputing(false);
      }
    },
    []
  );

  const verifyIncome = useCallback(
    async (
      incomeHandle: HexString,
      minimumIncome: bigint,
      walletClient?: WalletClient
    ): Promise<{ isEligible: boolean; result: ComputeResult } | null> => {
      setIsComputing(true);
      setError(null);

      try {
        const result = await checkIncomeEligibility(incomeHandle, minimumIncome, walletClient);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Income verification failed');
        setError(error);
        return null;
      } finally {
        setIsComputing(false);
      }
    },
    []
  );

  return {
    compute,
    compareEquals,
    compareGreaterOrEqual,
    verifyCreditScore,
    verifyIncome,
    isComputing,
    error,
  };
}
