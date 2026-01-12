/**
 * incoJS Compute Utilities
 * Perform confidential computations off-chain with attestation
 */
import type { HexString } from '@inco/js';
import { AttestedComputeSupportedOps } from '@inco/js/lite';
import type { WalletClient } from 'viem';
import { initializeInco, createIncoWalletClient } from './inco-config';

export interface ComputeResult {
  plaintext: {
    value: boolean; // Compute ops return boolean results
  };
  handle: HexString;
}

/**
 * Perform attested computation on a handle
 */
export async function attestedCompute(
  handle: HexString,
  operation: typeof AttestedComputeSupportedOps[keyof typeof AttestedComputeSupportedOps],
  scalar: bigint,
  walletClient?: WalletClient
): Promise<ComputeResult> {
  const zap = await initializeInco();
  const client = walletClient || await createIncoWalletClient();
  
  if (!client) {
    throw new Error('Wallet client not available');
  }
  
  // Get account from wallet
  const [account] = await client.getAddresses();
  if (!account) {
    throw new Error('No account connected');
  }
  
  const result = await zap.attestedCompute(client as unknown as Parameters<typeof zap.attestedCompute>[0], handle, operation, scalar);
  return result as unknown as ComputeResult;
}

/**
 * Check if encrypted value equals a target (handle == scalar)
 */
export async function checkEquals(
  handle: HexString,
  target: bigint,
  walletClient?: WalletClient
): Promise<boolean> {
  const result = await attestedCompute(
    handle,
    AttestedComputeSupportedOps.Eq,
    target,
    walletClient
  );
  return result.plaintext.value;
}

/**
 * Check if encrypted value is greater than or equal to target (handle >= scalar)
 */
export async function checkGreaterOrEqual(
  handle: HexString,
  target: bigint,
  walletClient?: WalletClient
): Promise<boolean> {
  const result = await attestedCompute(
    handle,
    AttestedComputeSupportedOps.Ge,
    target,
    walletClient
  );
  return result.plaintext.value;
}

/**
 * Check if encrypted value is greater than target (handle > scalar)
 */
export async function checkGreaterThan(
  handle: HexString,
  target: bigint,
  walletClient?: WalletClient
): Promise<boolean> {
  const result = await attestedCompute(
    handle,
    AttestedComputeSupportedOps.Gt,
    target,
    walletClient
  );
  return result.plaintext.value;
}

/**
 * Check if encrypted value is less than or equal to target (handle <= scalar)
 */
export async function checkLessOrEqual(
  handle: HexString,
  target: bigint,
  walletClient?: WalletClient
): Promise<boolean> {
  const result = await attestedCompute(
    handle,
    AttestedComputeSupportedOps.Le,
    target,
    walletClient
  );
  return result.plaintext.value;
}

/**
 * Check if encrypted value is less than target (handle < scalar)
 */
export async function checkLessThan(
  handle: HexString,
  target: bigint,
  walletClient?: WalletClient
): Promise<boolean> {
  const result = await attestedCompute(
    handle,
    AttestedComputeSupportedOps.Lt,
    target,
    walletClient
  );
  return result.plaintext.value;
}

/**
 * Check if encrypted credit score meets minimum requirement
 * Example: Check if credit score >= 700 without revealing actual score
 */
export async function checkCreditEligibility(
  creditScoreHandle: HexString,
  minimumScore: number = 700,
  walletClient?: WalletClient
): Promise<{
  isEligible: boolean;
  result: ComputeResult;
}> {
  const result = await checkGreaterOrEqual(
    creditScoreHandle,
    BigInt(minimumScore),
    walletClient
  );
  
  return {
    isEligible: result,
    result: await attestedCompute(
      creditScoreHandle,
      AttestedComputeSupportedOps.Ge,
      BigInt(minimumScore),
      walletClient
    ),
  };
}

/**
 * Check if encrypted income meets minimum requirement
 */
export async function checkIncomeEligibility(
  incomeHandle: HexString,
  minimumIncome: bigint,
  walletClient?: WalletClient
): Promise<{
  isEligible: boolean;
  result: ComputeResult;
}> {
  const result = await checkGreaterOrEqual(
    incomeHandle,
    minimumIncome,
    walletClient
  );
  
  return {
    isEligible: result,
    result: await attestedCompute(
      incomeHandle,
      AttestedComputeSupportedOps.Ge,
      minimumIncome,
      walletClient
    ),
  };
}


