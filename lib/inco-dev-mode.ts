/**
 * IncoJS Dev Mode - For Testing Only
 * Simulates decrypt functionality without requiring on-chain deployment
 * 
 * WARNING: This is for development/testing only!
 * In production, use real attested decryption with on-chain permissions.
 */
'use client';

import type { HexString } from '@inco/js';

// In-memory storage for dev mode (resets on page refresh)
const devModeStorage = new Map<HexString, {
  type: 'uint256' | 'bool' | 'address';
  value: bigint | boolean | string;
  timestamp: number;
  label?: string;
}>();

/**
 * Store an encrypted value in dev mode storage
 */
export function storeDevModeValue(
  handle: HexString,
  type: 'uint256' | 'bool' | 'address',
  value: bigint | boolean | string,
  label?: string
): void {
  devModeStorage.set(handle, {
    type,
    value,
    timestamp: Date.now(),
    label,
  });
}

/**
 * Retrieve a value from dev mode storage (simulates decrypt)
 */
export function getDevModeValue(
  handle: HexString
): { type: string; value: bigint | boolean | string; label?: string } | null {
  const stored = devModeStorage.get(handle);
  if (!stored) {
    return null;
  }
  return {
    type: stored.type,
    value: stored.value,
    label: stored.label,
  };
}

/**
 * Check if a handle exists in dev mode storage
 */
export function hasDevModeValue(handle: HexString): boolean {
  return devModeStorage.has(handle);
}

/**
 * Clear all dev mode storage
 */
export function clearDevModeStorage(): void {
  devModeStorage.clear();
}

/**
 * Get all stored handles (for debugging)
 */
export function getAllDevModeHandles(): HexString[] {
  return Array.from(devModeStorage.keys());
}

/**
 * Get storage stats
 */
export function getDevModeStats() {
  return {
    totalStored: devModeStorage.size,
    handles: Array.from(devModeStorage.entries()).map(([handle, data]) => ({
      handle,
      type: data.type,
      label: data.label,
      timestamp: new Date(data.timestamp).toISOString(),
    })),
  };
}
