/**
 * Contract Diagnostic Tool
 * 
 * This script helps diagnose ABI mismatches by checking what functions
 * are actually available on the deployed contract.
 * 
 * Run this in browser console while connected to Shardeum testnet.
 */

import { ethers } from 'ethers';

// Contract addresses from web3-config.ts
const ADDRESSES = {
  FlexCreditCore: '0xF21C05d1AEE9b444C90855A9121a28bE941785B5',
  IncomeProofVerifier: '0x9342FAFf81fC6D9baabe0a07F01B7847b5705d1E',
  AgentWalletFactory: '0x75E893f1ab5b939c0446C3e336f7FC715a6C2AEc',
  AgentPolicy: '0xd66ED9F4Deeee15A617845d460A68EF2D85eE43E',
  AgentPerformanceVerifier: '0xd66ED9F4Deeee15A617845d460A68EF2D85eE43E',
};

/**
 * Check if contract exists and get its bytecode
 */
export async function checkContractExists(address: string) {
  const provider = new ethers.BrowserProvider(window.ethereum as any);
  const code = await provider.getCode(address);
  
  console.log(`\n📍 Contract at ${address}`);
  console.log(`Code length: ${code.length} bytes`);
  console.log(`Deployed: ${code !== '0x' && code !== '0x0' ? '✅ YES' : '❌ NO'}`);
  
  return code !== '0x' && code !== '0x0';
}

/**
 * Try different function signatures to find the correct one
 */
export async function findCorrectFunction(contractAddress: string) {
  const provider = new ethers.BrowserProvider(window.ethereum as any);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();
  
  // Possible function signatures for getting user wallets
  const possibleABIs = [
    // Current ABI
    ["function getWallets(address _user) external view returns (address[] memory)"],
    
    // Alternative names
    ["function getUserWallets(address _user) external view returns (address[] memory)"],
    ["function wallets(address _user) external view returns (address[] memory)"],
    ["function userWallets(address _user) external view returns (address[] memory)"],
    
    // Without parameter (if it uses msg.sender)
    ["function getWallets() external view returns (address[] memory)"],
    ["function getUserWallets() external view returns (address[] memory)"],
    
    // Different return type
    ["function getWallets(address _user) external view returns (address[])"],
    
    // Public variable
    ["function userWallets(address, uint256) external view returns (address)"],
  ];
  
  console.log(`\n🔍 Testing function signatures for AgentWalletFactory...`);
  console.log(`User address: ${userAddress}\n`);
  
  for (const abi of possibleABIs) {
    try {
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const functionName = abi[0].match(/function (\w+)/)?.[1];
      
      console.log(`Testing: ${abi[0]}`);
      
      // Try calling with user address
      if (abi[0].includes('address _user')) {
        const result = await contract[functionName!](userAddress);
        console.log(`✅ SUCCESS! Function: ${functionName}`);
        console.log(`Result:`, result);
        return { functionName, abi, result };
      } else {
        // Try calling without parameter
        const result = await contract[functionName!]();
        console.log(`✅ SUCCESS! Function: ${functionName}`);
        console.log(`Result:`, result);
        return { functionName, abi, result };
      }
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message.substring(0, 100)}...`);
    }
  }
  
  console.log(`\n⚠️ None of the common function signatures worked!`);
  console.log(`The contract might use a completely different interface.`);
  
  return null;
}

/**
 * Run full diagnostic
 */
export async function runDiagnostic() {
  console.log('🏥 Starting Contract Diagnostic...\n');
  console.log('=' .repeat(60));
  
  // Check all contracts
  for (const [name, address] of Object.entries(ADDRESSES)) {
    const exists = await checkContractExists(address);
    
    if (!exists) {
      console.log(`⚠️ ${name} not deployed!`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Focus on AgentWalletFactory
  console.log('\n🏭 Diagnosing AgentWalletFactory...');
  const factoryExists = await checkContractExists(ADDRESSES.AgentWalletFactory);
  
  if (factoryExists) {
    const result = await findCorrectFunction(ADDRESSES.AgentWalletFactory);
    
    if (result) {
      console.log('\n✅ SOLUTION FOUND!');
      console.log('Update the ABI in web3-config.ts to:');
      console.log(JSON.stringify(result.abi, null, 2));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏥 Diagnostic Complete!\n');
}

// Export for use in console
if (typeof window !== 'undefined') {
  (window as any).contractDiagnostic = {
    checkContractExists,
    findCorrectFunction,
    runDiagnostic,
    ADDRESSES
  };
  
  console.log('💡 Contract diagnostic tools loaded!');
  console.log('Run: contractDiagnostic.runDiagnostic()');
}
