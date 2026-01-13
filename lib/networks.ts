// Network configuration and helpers for Pay-fi

// Get RPC URL from environment variable or use default
const SHARDEUM_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api-mezame.shardeum.org';
const SHARDEUM_EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://explorer-mezame.shardeum.org';
const SHARDEUM_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) : 8119;
const SHARDEUM_CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME || 'Shardeum EVM Testnet';

// Smart Contract Addresses from environment
const FLEX_CREDIT_CORE_ADDRESS = process.env.NEXT_PUBLIC_FLEX_CREDIT_CORE || '0xF21C05d1AEE9b444C90855A9121a28bE941785B5';
const INCOME_PROOF_VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_INCOME_PROOF_VERIFIER || '0x9342FAFf81fC6D9baabe0a07F01B7847b5705d1E';

export const NETWORKS = {
  ETHEREUM_MAINNET: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io'
  },
  ETHEREUM_SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.org',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  POLYGON_MAINNET: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com'
  },
  POLYGON_MUMBAI: {
    chainId: 80001,
    name: 'Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com'
  },
  POLYGON_AMOY: {
    chainId: 80002,
    name: 'Amoy Testnet',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://amoy.polygonscan.com'
  },
  SHARDEUM_TESTNET: {
    chainId: SHARDEUM_CHAIN_ID,
    name: SHARDEUM_CHAIN_NAME,
    rpcUrl: SHARDEUM_RPC_URL,
    blockExplorer: SHARDEUM_EXPLORER_URL
  },
  LOCALHOST: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: ''
  }
} as const;

// Contract addresses by network
export const CONTRACT_ADDRESSES = {
  // Credit Manager (original contract)
  CREDIT_MANAGER: {
    [NETWORKS.ETHEREUM_MAINNET.chainId]: '0x21Ca49781F161CDCE7F75e801a7a42eFb2850f1b',
    [NETWORKS.ETHEREUM_SEPOLIA.chainId]: '0x21Ca49781F161CDCE7F75e801a7a42eFb2850f1b',
    [NETWORKS.POLYGON_MAINNET.chainId]: '0x21Ca49781F161CDCE7F75e801a7a42eFb2850f1b',
    [NETWORKS.POLYGON_MUMBAI.chainId]: '0x21Ca49781F161CDCE7F75e801a7a42eFb2850f1b',
    [NETWORKS.POLYGON_AMOY.chainId]: '0x21Ca49781F161CDCE7F75e801a7a42eFb2850f1b',
    [SHARDEUM_CHAIN_ID]: FLEX_CREDIT_CORE_ADDRESS,
    [NETWORKS.LOCALHOST.chainId]: '0x21Ca49781F161CDCE7F75e801a7a42eFb2850f1b'
  },
  
  // Income Proof Verifier
  INCOME_PROOF_VERIFIER: {
    [NETWORKS.ETHEREUM_MAINNET.chainId]: '0x0826a4A88Ce7864619610bBbAf6c781FB30257fC',
    [NETWORKS.ETHEREUM_SEPOLIA.chainId]: '0x0826a4A88Ce7864619610bBbAf6c781FB30257fC',
    [NETWORKS.POLYGON_MAINNET.chainId]: '0x0826a4A88Ce7864619610bBbAf6c781FB30257fC',
    [NETWORKS.POLYGON_MUMBAI.chainId]: '0x0826a4A88Ce7864619610bBbAf6c781FB30257fC',
    [NETWORKS.POLYGON_AMOY.chainId]: '0x0826a4A88Ce7864619610bBbAf6c781FB30257fC',
    [SHARDEUM_CHAIN_ID]: INCOME_PROOF_VERIFIER_ADDRESS,
    [NETWORKS.LOCALHOST.chainId]: '0x0826a4A88Ce7864619610bBbAf6c781FB30257fC'
  }
} as const;

// Get current network
export const getCurrentNetwork = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found');
  }

  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  const chainIdNumber = parseInt(chainId, 16);
  
  return Object.values(NETWORKS).find(network => network.chainId === chainIdNumber);
};

// Get contract address for current network
export const getContractAddress = async (contractName: keyof typeof CONTRACT_ADDRESSES) => {
  const network = await getCurrentNetwork();
  
  if (!network) {
    throw new Error('Unsupported network. Please switch to a supported network.');
  }
  
  const address = CONTRACT_ADDRESSES[contractName][network.chainId];
  
  if (!address) {
    throw new Error(`Contract ${contractName} not deployed on ${network.name}`);
  }
  
  return address;
};

// Switch to a specific network
export const switchNetwork = async (chainId: number) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    return true;
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      const network = Object.values(NETWORKS).find(n => n.chainId === chainId);
      if (!network) {
        throw new Error('Network not found');
      }
      
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: network.blockExplorer ? [network.blockExplorer] : [],
            },
          ],
        });
        return true;
      } catch (addError) {
        throw addError;
      }
    }
    throw error;
  }
};

// Check if contract exists at address
export const checkContractExists = async (address: string) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
  }

  try {
    const code = await window.ethereum.request({
      method: 'eth_getCode',
      params: [address, 'latest'],
    });
    
    // If code is '0x' or '0x0', no contract exists
    return code !== '0x' && code !== '0x0';
  } catch (error) {
    console.error('Error checking contract:', error);
    return false;
  }
};

// Format network name for display
export const getNetworkName = (chainId: number): string => {
  const network = Object.values(NETWORKS).find(n => n.chainId === chainId);
  return network?.name || `Unknown Network (${chainId})`;
};

// Check if on supported network
export const isSupportedNetwork = (chainId: number): boolean => {
  return Object.values(NETWORKS).some(network => network.chainId === chainId);
};
