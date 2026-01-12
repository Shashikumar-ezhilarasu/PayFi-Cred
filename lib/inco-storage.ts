/**
 * IncoJS IndexedDB Storage
 * Persistent storage for encrypted values and their original data
 */
'use client';

import type { HexString } from '@inco/js';

const DB_NAME = 'IncoEncryptionDB';
const DB_VERSION = 1;
const STORE_NAME = 'encryptedValues';

interface StoredValue {
  handle: HexString;
  type: 'uint256' | 'bool' | 'address';
  value: string; // Stored as string for IndexedDB compatibility
  timestamp: number;
  label?: string;
}

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'handle' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

/**
 * Store an encrypted value
 */
export async function storeEncryptedValue(
  handle: HexString,
  type: 'uint256' | 'bool' | 'address',
  value: bigint | boolean | string,
  label?: string
): Promise<void> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const data: StoredValue = {
      handle,
      type,
      value: value.toString(),
      timestamp: Date.now(),
      label,
    };
    
    const request = store.put(data);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve a stored value
 */
export async function getStoredValue(
  handle: HexString
): Promise<{ type: string; value: bigint | boolean | string; label?: string } | null> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(handle);
    
    request.onsuccess = () => {
      const result = request.result as StoredValue | undefined;
      if (!result) {
        resolve(null);
        return;
      }
      
      let parsedValue: bigint | boolean | string;
      if (result.type === 'uint256') {
        parsedValue = BigInt(result.value);
      } else if (result.type === 'bool') {
        parsedValue = result.value === 'true';
      } else {
        parsedValue = result.value;
      }
      
      resolve({
        type: result.type,
        value: parsedValue,
        label: result.label,
      });
    };
    
    request.onerror = () => reject(request.error);
  });
}

/**
 * Check if a handle exists
 */
export async function hasStoredValue(handle: HexString): Promise<boolean> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(handle);
    
    request.onsuccess = () => resolve(!!request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all stored handles
 */
export async function getAllStoredHandles(): Promise<HexString[]> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();
    
    request.onsuccess = () => resolve(request.result as HexString[]);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a stored value
 */
export async function deleteStoredValue(handle: HexString): Promise<void> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(handle);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all stored values
 */
export async function clearAllStoredValues(): Promise<void> {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get storage statistics
 */
export async function getStorageStats() {
  const db = await initDB();
  
  return new Promise<{ totalStored: number; handles: StoredValue[] }>((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => {
      const results = request.result as StoredValue[];
      resolve({
        totalStored: results.length,
        handles: results,
      });
    };
    
    request.onerror = () => reject(request.error);
  });
}
