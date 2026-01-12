import { InterfaceAbi } from 'ethers';

// Helper type for ABI
type ContractABI = InterfaceAbi;

/**
 * CONTRACT ADDRESSES - SHARDEUM EVM TESTNET
 * 
 * These addresses are for contracts deployed on Shardeum EVM Testnet (Chain ID: 8119)
 * RPC: https://api-mezame.shardeum.org
 * Explorer: https://explorer-mezame.shardeum.org
 * 
 * Deployment Steps:
 * 1. Deploy FlexCreditCore.sol
 * 2. Deploy IncomeProofVerifier.sol (pass FlexCreditCore address to constructor)
 * 3. Deploy AgentPolicy.sol (pass FlexCreditCore address to constructor)
 * 4. Deploy AgentPerformanceVerifier.sol (pass FlexCreditCore address to constructor)
 * 5. Deploy AgentWalletFactory.sol
 * 6. Call authorizeVerifier() on FlexCreditCore to authorize the verifier contracts
 */
export const CONTRACT_ADDRESSES = {
  FlexCreditCore: '0xF21C05d1AEE9b444C90855A9121a28bE941785B5', // Main credit management contract
  IncomeProofVerifier: '0x9342FAFf81fC6D9baabe0a07F01B7847b5705d1E', // Income verification contract
  AgentWallet: '', // Optional: Agent wallet contract (can deploy multiple)
  AgentWalletFactory: '0x75E893f1ab5b939c0446C3e336f7FC715a6C2AEc', // Factory for creating agent wallets
  AgentPolicy: '0xd66ED9F4Deeee15A617845d460A68EF2D85eE43E', // Agent policy management contract
  AgentPerformanceVerifier: '0xd66ED9F4Deeee15A617845d460A68EF2D85eE43E', // Agent performance verification contract
};

export const CONTRACT_ABIS: Record<string, ContractABI> = {
  FlexCreditCore: [
    {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"bytes32","name":"agentId","type":"bytes32"},{"indexed":false,"internalType":"int256","name":"previousScore","type":"int256"},{"indexed":false,"internalType":"int256","name":"newScore","type":"int256"}],"name":"AgentPerformanceApplied","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalUsed","type":"uint256"}],"name":"CreditRepaid","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalUsed","type":"uint256"}],"name":"CreditUsed","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"previousScore","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newScore","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newCreditLimit","type":"uint256"}],"name":"IncomeScoreApplied","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"verifier","type":"address"},{"indexed":false,"internalType":"bool","name":"authorized","type":"bool"}],"name":"VerifierAuthorized","type":"event"},
    {"inputs":[],"name":"CREDIT_MULTIPLIER","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"agentRiskScore","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"bytes32","name":"agentId","type":"bytes32"},{"internalType":"int256","name":"pnlBucket","type":"int256"}],"name":"applyAgentPerformance","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"incomeBucket","type":"uint256"}],"name":"applyIncomeScore","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"verifier","type":"address"},{"internalType":"bool","name":"authorized","type":"bool"}],"name":"authorizeVerifier","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"authorizedVerifiers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"creditLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"bytes32","name":"agentId","type":"bytes32"}],"name":"getAgentRisk","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getAvailableCredit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getCreditInfo","outputs":[{"internalType":"uint256","name":"income","type":"uint256"},{"internalType":"uint256","name":"limit","type":"uint256"},{"internalType":"uint256","name":"used","type":"uint256"},{"internalType":"uint256","name":"available","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"incomeScore","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"repayCredit","outputs":[],"stateMutability":"payable","type":"function"},
    {"inputs":[{"internalType":"address","name":"borrower","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"repayCreditFor","outputs":[],"stateMutability":"payable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"useCredit","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"usedCredit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"stateMutability":"payable","type":"receive"}
  ],
  IncomeProofVerifier: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_creditCore",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "incomeBucket",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "proofHash",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "IncomeProofSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "incomeBucket",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newCreditLimit",
          "type": "uint256"
        }
      ],
      "name": "IncomeProofVerified",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "creditCore",
      "outputs": [
        {
          "internalType": "contract FlexCreditCore",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "proofHash",
          "type": "bytes32"
        }
      ],
      "name": "isProofProcessed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "processedProofs",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "verifier",
          "type": "address"
        }
      ],
      "name": "setVlayerVerifier",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "proof",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "publicInputs",
          "type": "bytes"
        }
      ],
      "name": "submitIncomeProof",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "incomeBucket",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "proofHash",
          "type": "bytes32"
        }
      ],
      "name": "submitIncomeProofSimplified",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "vlayerVerifier",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  AgentWallet: [
    "function owner() external view returns (address)",
    "function agent() external view returns (address)",
    "function spendingCap() external view returns (uint256)",
    "function creditAllocated() external view returns (uint256)",
    "function creditUsed() external view returns (uint256)",
    "function reputation() external view returns (uint256)",
    "function nonce() external view returns (uint256)",
    "function getBalance() external view returns (uint256)",
    "function getStats() external view returns (uint256 balance, uint256 _creditAllocated, uint256 _creditUsed, uint256 _spendingCap, uint256 _reputation, uint256 _nonce)",
    "function withdraw(uint256 amount) external",
    "function executeAction(address target, uint256 value, bytes memory data) external returns (bytes memory)",
    "function allocateCredit(uint256 amount) external",
    "function updateReputation(uint256 newScore) external",
    "function updateSpendingCap(uint256 newCap) external",
    "function setAgent(address _newAgent) external",
    "event Deposit(address indexed from, uint256 amount)",
    "event Withdrawal(address indexed to, uint256 amount)",
    "event ActionExecuted(address indexed target, uint256 value, bytes data)",
    "event ReputationUpdated(uint256 oldScore, uint256 newScore)",
    "event CreditAllocated(uint256 amount)"
  ],
  AgentPolicy: [
    "function getPolicy(address user, bytes32 agentId) external view returns (uint256 dailyLimit, uint256 perTxLimit, bool canUseCredit)",
    "function getAgentTier(address user, bytes32 agentId) external view returns (uint8)", // Enum returns uint8
    "function getRemainingDailyLimit(address user, bytes32 agentId) external view returns (uint256)",
    "function setPolicy(bytes32 agentId, uint256 dailyLimit, uint256 perTxLimit, bool canUseCredit) external",
    "event PolicySet(address indexed user, bytes32 indexed agentId, uint256 dailyLimit, uint256 perTxLimit, bool canUseCredit)",
    "event AgentTierUpgraded(address indexed user, bytes32 indexed agentId, uint8 oldTier, uint8 newTier)"
  ],
  AgentPerformanceVerifier: [
    "function submitAgentProofSimplified(address user, bytes32 agentId, int256 pnlBucket, bytes32 proofHash) external",
    "function submitAgentProof(bytes calldata proof, bytes calldata publicInputs) external",
    "event AgentProofSubmitted(address indexed user, bytes32 indexed agentId, int256 pnlBucket, bytes32 proofHash, uint256 timestamp)",
    "event AgentProofVerified(address indexed user, bytes32 indexed agentId, int256 pnlBucket, uint256 newDailyLimit)"
  ],
  AgentWalletFactory: [
    "function createWallet(uint256 _initialSpendingCap) external returns (address)",
    "function getWallets(address _user) external view returns (address[] memory)",
    "function userWallets(address, uint256) external view returns (address)",
    "event WalletCreated(address indexed owner, address walletAddress)"
  ]
};

// Placeholder bytecode for AgentWallet deployment (User needs to replace this with actual bytecode from Remix compilation if using factory deployment)
export const AGENT_WALLET_BYTECODE = "0x"; 
