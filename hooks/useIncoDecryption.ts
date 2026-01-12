/**
 * React Hook for incoJS Decryption
 * Client-side hook for decrypting confidential handles
 */
'use client';

import { useState, useCallback } from 'react';
import type { HexString } from '@inco/js';
import type { WalletClient } from 'viem';
import {
  attestedDecrypt,
  attestedDecryptSingle,
  attestedReveal,
  grantSessionKeyAllowance,
  attestedDecryptWithSession,
  type DecryptionResult,
} from '@/lib/inco-decrypt';
import { generateSecp256k1Keypair } from '@inco/js/lite';

export function useIncoDecryption() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (
      handles: HexString[],
      walletClient?: WalletClient
    ): Promise<DecryptionResult[] | null> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const results = await attestedDecrypt(handles, walletClient);
        return results;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Decryption failed');
        setError(error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    []
  );

  const decryptSingle = useCallback(
    async (
      handle: HexString,
      walletClient?: WalletClient
    ): Promise<bigint | boolean | null> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const result = await attestedDecryptSingle(handle, walletClient);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Decryption failed');
        setError(error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    []
  );

  const reveal = useCallback(async (handles: HexString[]): Promise<DecryptionResult[] | null> => {
    setIsDecrypting(true);
    setError(null);

    try {
      const results = await attestedReveal(handles);
      return results;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Reveal failed');
      setError(error);
      return null;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  const createSessionKey = useCallback(
    async (
      expiresInMs?: number,
      walletClient?: WalletClient
    ): Promise<{ voucher: unknown; keypair: ReturnType<typeof generateSecp256k1Keypair> } | null> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const session = await grantSessionKeyAllowance(expiresInMs, walletClient);
        return session;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Session key creation failed');
        setError(error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    []
  );

  const decryptWithSession = useCallback(
    async (
      sessionKeypair: ReturnType<typeof generateSecp256k1Keypair>,
      voucher: unknown,
      handles: HexString[]
    ): Promise<DecryptionResult[] | null> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const results = await attestedDecryptWithSession(sessionKeypair, voucher, handles);
        return results;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Session decryption failed');
        setError(error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    []
  );

  return {
    decrypt,
    decryptSingle,
    reveal,
    createSessionKey,
    decryptWithSession,
    isDecrypting,
    error,
  };
}
