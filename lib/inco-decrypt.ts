/**
 * incoJS Decryption Utilities
 * Request decryption of confidential handles with attestation
 */
import type { HexString } from '@inco/js';
import { generateSecp256k1Keypair } from '@inco/js/lite';
import type { WalletClient } from 'viem';
import { initializeInco, createIncoWalletClient } from './inco-config';

export interface DecryptionResult {
  plaintext: {
    value: bigint | boolean;
  };
  encryptedPlaintext?: unknown;
  handle?: HexString;
}

export interface BackoffConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
}

/**
 * Decrypt a handle using wallet signature (basic decryption)
 */
export async function attestedDecrypt(
  handles: HexString[],
  walletClient?: WalletClient,
  backoffConfig?: BackoffConfig
): Promise<DecryptionResult[]> {
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
  
  const results = await zap.attestedDecrypt(client as unknown as Parameters<typeof zap.attestedDecrypt>[0], handles, backoffConfig);
  return results as unknown as DecryptionResult[];
}

/**
 * Decrypt a single handle
 */
export async function attestedDecryptSingle(
  handle: HexString,
  walletClient?: WalletClient
): Promise<bigint | boolean> {
  const results = await attestedDecrypt([handle], walletClient);
  return results[0].plaintext.value;
}

/**
 * Decrypt with reencryption for a delegate
 */
export async function attestedDecryptForDelegate(
  handles: HexString[],
  delegatePublicKey: Uint8Array,
  walletClient?: WalletClient
): Promise<DecryptionResult[]> {
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
  
  const results = await zap.attestedDecrypt(client as unknown as Parameters<typeof zap.attestedDecrypt>[0], handles, delegatePublicKey);
  return results as unknown as DecryptionResult[];
}

/**
 * Decrypt with local keypair (reencrypt and decrypt locally)
 */
export async function attestedDecryptLocal(
  handles: HexString[],
  walletClient?: WalletClient
): Promise<DecryptionResult[]> {
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
  
  const keypair = generateSecp256k1Keypair();
  const pubKey = keypair.encodePublicKey();
  
  const results = await zap.attestedDecrypt(client as unknown as Parameters<typeof zap.attestedDecrypt>[0], handles, pubKey, keypair);
  return results as unknown as DecryptionResult[];
}

/**
 * Session key decryption with allowance voucher
 */
export async function grantSessionKeyAllowance(
  expiresInMs: number = 3600000, // 1 hour default
  walletClient?: WalletClient
) {
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
  
  const ephemeralKeypair = generateSecp256k1Keypair();
  const defaultSessionVerifier = '0xc34569efc25901bdd6b652164a2c8a7228b23005';
  const expiresAt = new Date(Date.now() + expiresInMs);
  
  const voucher = await zap.grantSessionKeyAllowanceVoucher(
    client as unknown as Parameters<typeof zap.grantSessionKeyAllowanceVoucher>[0],
    Array.from(ephemeralKeypair.encodePublicKey()).map(b => b.toString(16).padStart(2, '0')).join(''),
    expiresAt,
    defaultSessionVerifier
  );
  
  return {
    voucher,
    keypair: ephemeralKeypair,
  };
}

/**
 * Decrypt using session key (no wallet signature needed)
 */
export async function attestedDecryptWithSession(
  sessionKeypair: ReturnType<typeof generateSecp256k1Keypair>,
  voucher: unknown,
  handles: HexString[],
  backoffConfig?: BackoffConfig
): Promise<DecryptionResult[]> {
  const zap = await initializeInco();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = await (zap.attestedDecryptWithVoucher as any)(
    sessionKeypair,
    voucher,
    handles,
    backoffConfig
  );
  return results as unknown as DecryptionResult[];
}

/**
 * Reveal a handle (anyone can decrypt after e.reveal())
 */
export async function attestedReveal(
  handles: HexString[]
): Promise<DecryptionResult[]> {
  const zap = await initializeInco();
  
  const results = await zap.attestedReveal(handles);
  return results as unknown as DecryptionResult[];
}
