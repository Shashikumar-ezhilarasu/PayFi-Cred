/**
 * incoJS Encryption Utilities
 * Encrypt values for confidential on-chain computation
 */
import { handleTypes, type HexString } from '@inco/js';
import type { Address } from 'viem';
import { initializeInco } from './inco-config';
import { storeEncryptedValue } from './inco-storage';

export interface EncryptionOptions {
  accountAddress: Address;
  dappAddress: Address;
}

/**
 * Encrypt a 256-bit unsigned integer (euint256)
 * Use for: credit scores, amounts, balances, etc.
 */
export async function encryptUint256(
  value: bigint,
  options: EncryptionOptions,
  label?: string
): Promise<HexString> {
  const zap = await initializeInco();
  
  const handle = await zap.encrypt(value, {
    accountAddress: options.accountAddress,
    dappAddress: options.dappAddress,
    handleType: handleTypes.euint256,
  });
  
  // Store for later decryption
  await storeEncryptedValue(handle, 'uint256', value, label);
  
  return handle;
}

/**
 * Encrypt a boolean (ebool)
 * Use for: eligibility flags, approval status, etc.
 */
export async function encryptBool(
  value: boolean,
  options: EncryptionOptions,
  label?: string
): Promise<HexString> {
  const zap = await initializeInco();
  
  const handle = await zap.encrypt(value, {
    accountAddress: options.accountAddress,
    dappAddress: options.dappAddress,
    handleType: handleTypes.ebool,
  });
  
  // Store for later decryption
  await storeEncryptedValue(handle, 'bool', value, label);
  
  return handle;
}

/**
 * Encrypt an Ethereum address (eaddress/euint160)
 * Use for: private recipient addresses, wallet associations, etc.
 */
export async function encryptAddress(
  address: Address,
  options: EncryptionOptions,
  label?: string
): Promise<HexString> {
  const zap = await initializeInco();
  
  const handle = await zap.encrypt(BigInt(address), {
    accountAddress: options.accountAddress,
    dappAddress: options.dappAddress,
    handleType: handleTypes.euint160,
  });
  
  // Store for later decryption
  await storeEncryptedValue(handle, 'address', address, label);
  
  return handle;
}

/**
 * Encrypt credit score for private credit evaluation
 */
export async function encryptCreditScore(
  score: number,
  options: EncryptionOptions
): Promise<HexString> {
  if (score < 0 || score > 850) {
    throw new Error('Credit score must be between 0 and 850');
  }
  
  return encryptUint256(BigInt(score), options, `Credit Score: ${score}`);
}

/**
 * Encrypt income amount for private income verification
 */
export async function encryptIncome(
  amount: bigint,
  options: EncryptionOptions
): Promise<HexString> {
  return encryptUint256(amount, options, `Income: $${amount.toString()}`);
}
