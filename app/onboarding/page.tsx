'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { 
  getCreditInfo, 
  submitIncomeProof,
  areContractsConfigured,
  getWalletBalance 
} from '@/lib/payfi-contracts';
import { CONTRACT_ADDRESSES } from '@/lib/web3-config';
import { 
  generateMockVlayerProof, 
  calculateIncomeBucket 
} from '@/lib/vlayer-mock';
import { useAppStore } from '@/store/useAppStore';

export default function OnboardingPage() {
  const router = useRouter();
  const { setWallet, setCreditData } = useAppStore();
  
  const [account, setAccount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [step, setStep] = useState(1); // 1: Connect, 2: Verify, 3: Success
  const [creditInfo, setCreditInfo] = useState<any>(null);
  const [incomeAmount, setIncomeAmount] = useState('1200'); // Default income
  const [error, setError] = useState<string>('');
  const [txHistory, setTxHistory] = useState<any[]>([]);
  const [analyzingTxs, setAnalyzingTxs] = useState(false);
  const [creditScore, setCreditScore] = useState(0);
  const [recommendedCredit, setRecommendedCredit] = useState(0);
  
  // PAN verification states
  const [panStep, setPanStep] = useState<'input' | 'otp' | 'verified'>('input');
  const [pan, setPan] = useState('');
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [panLoading, setPanLoading] = useState(false);
  const [panError, setPanError] = useState('');
  const [panSuccess, setPanSuccess] = useState('');
  // Check if contracts are configured
  useEffect(() => {
    if (!areContractsConfigured()) {
      setError(
        'Smart contracts not configured. Please update CONTRACT_ADDRESSES in lib/web3-config.ts'
      );
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      
      setAccount(address);
      
      // Get wallet balance
      const balance = await getWalletBalance(address);
      
      // Update global state
      setWallet({
        address,
        connected: true,
        balance,
      });
      
      setStep(2);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const analyzeWalletActivity = async (address: string) => {
    try {
      setAnalyzingTxs(true);
      setError('');
      
      console.log('🔍 Analyzing wallet transaction history on Sepolia...');
      
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const currentBlock = await provider.getBlockNumber();
      
      // Fetch last 100 blocks of transactions
      const transactions: any[] = [];
      const txHashes = new Set<string>();
      
      for (let i = 0; i < 100 && i < currentBlock; i++) {
        try {
          const block = await provider.getBlock(currentBlock - i, true);
          if (block && block.transactions) {
            for (const tx of block.transactions) {
              if (typeof tx === 'string') continue;
              
              const txObj = tx as any; // Type assertion to fix TypeScript errors
              
              // Only count transactions involving this wallet
              if (txObj.from?.toLowerCase() === address.toLowerCase() || 
                  txObj.to?.toLowerCase() === address.toLowerCase()) {
                
                // Avoid duplicates
                if (!txHashes.has(txObj.hash)) {
                  txHashes.add(txObj.hash);
                  transactions.push({
                    hash: txObj.hash,
                    from: txObj.from,
                    to: txObj.to || 'Contract Creation',
                    value: ethers.formatEther(txObj.value || 0),
                    blockNumber: block.number,
                    timestamp: block.timestamp,
                    type: txObj.from?.toLowerCase() === address.toLowerCase() ? 'sent' : 'received'
                  });
                }
              }
            }
          }
        } catch (err) {
          // Skip blocks that fail
        }
      }
      
      setTxHistory(transactions);
      
      // Calculate credit score based on transaction activity
      const score = calculateCreditScoreFromTxs(transactions);
      setCreditScore(score);
      
      // Recommend credit amount (in USDC, testnet-scaled)
      const recommended = calculateRecommendedCredit(transactions, score);
      setRecommendedCredit(recommended);
      
      // Auto-set income amount based on activity
      const autoIncome = Math.max(400, Math.floor(recommended * 1000)); // Convert to income tier
      setIncomeAmount(autoIncome.toString());
      
      console.log('✅ Wallet analysis complete:', {
        totalTxs: transactions.length,
        creditScore: score,
        recommendedCredit: recommended,
        autoIncome
      });
      
    } catch (error: any) {
      console.error('Error analyzing wallet:', error);
      setError('Failed to analyze wallet history. Using default values.');
    } finally {
      setAnalyzingTxs(false);
    }
  };

  const calculateCreditScoreFromTxs = (txs: any[]): number => {
    if (txs.length === 0) return 300; // Minimum score
    
    // Base score: 300-850 range
    let score = 300;
    
    // +10 points per transaction (up to 20 txs)
    score += Math.min(txs.length * 10, 200);
    
    // Calculate total volume
    const totalVolume = txs.reduce((sum, tx) => sum + parseFloat(tx.value), 0);
    
    // +5 points per 0.01 ETH volume (up to 150 points)
    score += Math.min(Math.floor(totalVolume / 0.01) * 5, 150);
    
    // Bonus for consistent activity (both sent and received)
    const sentTxs = txs.filter(tx => tx.type === 'sent').length;
    const receivedTxs = txs.filter(tx => tx.type === 'received').length;
    if (sentTxs > 0 && receivedTxs > 0) {
      score += 100; // Bonus for bidirectional activity
    }
    
    // Cap at 850 (excellent score)
    return Math.min(score, 850);
  };

  const calculateRecommendedCredit = (txs: any[], score: number): number => {
    if (txs.length === 0) return 0.001; // Minimum testnet credit
    
    // Base credit on transaction volume and score
    const totalVolume = txs.reduce((sum, tx) => sum + parseFloat(tx.value), 0);
    
    // Credit formula: (volume * 2) + (score / 300)
    // Scaled for testnet (small values)
    let credit = (totalVolume * 2) + (score / 300);
    
    // Apply tier limits (testnet values)
    if (score >= 740) return Math.min(credit, 1.0); // Platinum: 1 USDC
    if (score >= 670) return Math.min(credit, 0.5); // Gold: 0.5 USDC
    if (score >= 580) return Math.min(credit, 0.1); // Silver: 0.1 USDC
    return Math.min(credit, 0.01); // Bronze: 0.01 USDC
  };

  const loadCreditInfo = async (userAddress: string) => {
    try {
      setFetchingData(true);
      setError('');
      
      console.log('📊 Fetching REAL credit data from blockchain...');
      
      // Fetch REAL data from smart contract
      const info = await getCreditInfo(userAddress);
      
      console.log('✅ Credit data loaded:', info);
      
      // Format for display (assuming 6 decimals for USDC)
      const formattedInfo = {
        income: info.income, // Income bucket (0, 500, 1000, 2000)
        limit: ethers.formatUnits(info.limit, 6),
        used: ethers.formatUnits(info.used, 6),
        available: ethers.formatUnits(info.available, 6)
      };
      
      setCreditInfo(formattedInfo);
      
      // Update global state
      setCreditData({
        creditScore: Number(info.income), // Using income as initial score
        creditLimit: Number(formattedInfo.limit),
        availableBalance: Number(formattedInfo.available),
        usedCredit: Number(formattedInfo.used),
        repaymentRate: 100,
        riskLevel: 'LOW',
        creditTier: 'Bronze',
      });
      
    } catch (error: any) {
      console.error('Error loading credit info:', error);
      setError(
        'Failed to load credit data. Make sure contracts are deployed and configured.'
      );
      
      // Set empty state instead of mock data
      setCreditInfo({
        income: '0',
        limit: '0',
        used: '0',
        available: '0'
      });
    } finally {
      setFetchingData(false);
    }
  };

  const verifyIncome = async () => {
    if (!account) return;
    
    setVerifying(true);
    setError('');
    
    try {
      const income = Number(incomeAmount);
      
      // CRITICAL: Validate income before proceeding
      if (income < 400) {
        setError(
          'Income too low for Pay-Fi eligibility.\n\n' +
          'Minimum monthly income required: $400 USDC\n' +
          'Your income: $' + income + ' USDC\n\n' +
          'Please increase your monthly income to use Pay-Fi credit services.'
        );
        setVerifying(false);
        return; // Stop execution, do not trigger transaction
      }
      
      // Step 1: Generate Vlayer proof (MOCKED - will be replaced with real Vlayer SDK)
      console.log('🔐 Step 1: Generating Vlayer proof...');
      const proofHash = generateMockVlayerProof(account, income);
      
      // Step 2: Calculate income bucket based on smart contract tiers
      const incomeBucket = calculateIncomeBucket(income);
      console.log('📊 Income bucket calculated:', {
        income,
        bucket: incomeBucket,
        mapping: '400-499→0, 500-999→500, 1000-1999→1000, 2000+→2000'
      });
      
      // Step 3: Submit to REAL smart contract
      console.log('📝 Step 2: Submitting to blockchain...');
      console.log('   Contract: IncomeProofVerifier');
      console.log('   User:', account);
      console.log('   Income Bucket:', incomeBucket);
      console.log('   Proof Hash:', proofHash);
      
      try {
        const txHash = await submitIncomeProof(account, incomeBucket, proofHash);
        
        console.log('✅ Transaction confirmed:', txHash);
        
        // Step 4: Reload REAL credit data from blockchain
        console.log('🔄 Step 3: Reloading credit data...');
        await loadCreditInfo(account);
        
        setStep(3);
      } catch (txError: any) {
        console.error('❌ Transaction error:', txError);
        
        // Provide specific error messages for common issues
        let errorMessage = 'Verification failed: ';
        
        if (txError.message?.includes('missing revert data') || txError.code === 'CALL_EXCEPTION') {
          errorMessage = `Contract call failed. This usually means:\n\n` +
            `1. The IncomeProofVerifier contract is not authorized on FlexCreditCore\n` +
            `   → Call: flexCreditCore.authorizeVerifier(incomeProofVerifierAddress, true)\n\n` +
            `2. The FlexCreditCore address in IncomeProofVerifier is incorrect\n` +
            `   → Check the constructor parameter when deploying\n\n` +
            `3. The contracts are not deployed correctly\n` +
            `   → Verify all contract addresses in web3-config.ts\n\n` +
            `Contract Addresses:\n` +
            `- FlexCreditCore: ${CONTRACT_ADDRESSES.FlexCreditCore}\n` +
            `- IncomeProofVerifier: ${CONTRACT_ADDRESSES.IncomeProofVerifier}`;
        } else if (txError.message?.includes('user rejected')) {
          errorMessage += 'Transaction rejected by user';
        } else if (txError.message?.includes('insufficient funds')) {
          errorMessage += 'Insufficient funds for gas. Please add some ETH to your wallet.';
        } else if (txError.reason) {
          errorMessage += txError.reason;
        } else {
          errorMessage += txError.message || 'Unknown error';
        }
        
        setError(errorMessage);
        throw txError; // Re-throw to be caught by outer catch
      }
      
    } catch (error: any) {
      console.error('❌ Verification failed:', error);
      
      // Only set error if not already set by inner catch
      if (!error.message?.includes('Contract call failed')) {
        let errorMessage = 'Verification failed: ';
        
        if (error.message?.includes('user rejected')) {
          errorMessage += 'Transaction rejected by user';
        } else if (error.message?.includes('not configured')) {
          errorMessage += 'Smart contracts not configured. Please update CONTRACT_ADDRESSES.';
        } else if (error.reason) {
          errorMessage += error.reason;
        } else {
          errorMessage += error.message || 'Unknown error';
        }
        
        setError(errorMessage);
      }
    } finally {
      setVerifying(false);
    }
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const formatPAN = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  };

  const handleSendOTP = async () => {
    if (pan.length !== 10) {
      setPanError('Please enter a valid 10-character PAN number');
      return;
    }

    setPanLoading(true);
    setPanError('');

    try {
      const response = await fetch('/api/pan-verification/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      // Display OTP in simple plain text format
      console.log('\nPAN Verification OTP');
      console.log('Hello ' + data.name);
      console.log('Your OTP for PAN verification is: ' + data.otp);
      console.log('This OTP will expire in 10 minutes.');
      console.log('Authorize to connect your Web3 wallet with PAN\n');

      setMaskedEmail(data.email);
      setUserName(data.name);
      setPanSuccess(data.message);
      setPanStep('otp');
    } catch (err: any) {
      setPanError(err.message);
    } finally {
      setPanLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setPanError('Please enter a valid 6-digit OTP');
      return;
    }

    setPanLoading(true);
    setPanError('');

    try {
      // Step 1: Verify OTP
      const response = await fetch('/api/pan-verification/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pan, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      setPanSuccess('OTP verified! Submitting to blockchain...');
      setPanStep('verified');
      setUserName(data.user.name);

      // Step 2: Calculate income bucket based on smart contract tiers
      // Default income tiers: 400-499→0, 500-999→500, 1000-1999→1000, 2000+→2000
      const defaultIncome = 1000; // Default monthly income
      const incomeBucket = calculateIncomeBucket(defaultIncome);

      // Step 3: Generate proof hash
      const proofHash = generateMockVlayerProof(account, defaultIncome);

      console.log('📝 Submitting to IncomeProofVerifier smart contract...');
      console.log('   User:', account);
      console.log('   Income Bucket:', incomeBucket);
      console.log('   Proof Hash:', proofHash);

      // Step 4: Submit to blockchain
      const txHash = await submitIncomeProof(account, incomeBucket, proofHash);
      console.log('✅ Transaction confirmed:', txHash);

      // Step 5: Reload credit data from blockchain
      console.log('🔄 Loading credit data from blockchain...');
      await loadCreditInfo(account);

      // Move to step 3 (success)
      setStep(3);
      setPanSuccess('PAN verified and credit limit activated!');

    } catch (err: any) {
      console.error('❌ Verification failed:', err);
      
      let errorMessage = 'Verification failed: ';
      
      if (err.message?.includes('user rejected')) {
        errorMessage += 'Transaction rejected by user';
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage += 'Insufficient funds for gas. Please add some ETH to your wallet.';
      } else if (err.reason) {
        errorMessage += err.reason;
      } else {
        errorMessage += err.message || 'Unknown error';
      }
      
      setPanError(errorMessage);
    } finally {
      setPanLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    await handleSendOTP();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Welcome to PayFi
          </h1>
          <p className="text-[var(--color-text-dim)] text-lg">
            Get instant credit based on your verified income
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Step 1: Connect Wallet */}
          <div
            className={`p-6 rounded-xl border transition-all ${
              step >= 1
                ? 'border-green-500/50 bg-green-900/10'
                : 'border-[var(--color-accent)]/20 bg-[var(--card)]/50 opacity-50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 1 ? 'bg-green-500 text-black' : 'bg-[var(--card)] text-[var(--color-text-dim)]'
                }`}>
                  1
                </span>
                Connect Wallet
              </h2>
              {account && (
                <span className="text-green-400 text-sm">✓ Connected</span>
              )}
            </div>
            
            {account ? (
              <div className="flex items-center gap-3 p-4 bg-black/30 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 flex items-center justify-center text-black font-bold">
                  {account.slice(2, 4).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-dim)]">Connected Address</p>
                  <p className="font-mono text-green-400">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold transition-all"
              >
                {loading ? 'Connecting...' : 'Connect MetaMask'}
              </button>
            )}
          </div>

          {/* Step 2: Verify PAN */}
          <div
            className={`p-6 rounded-xl border transition-all ${
              step >= 2
                ? 'border-cyan-500/50 bg-cyan-900/10'
                : 'border-[var(--color-accent)]/20 bg-[var(--card)]/50 opacity-50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 2 ? 'bg-cyan-500 text-black' : 'bg-[var(--card)] text-[var(--color-text-dim)]'
                }`}>
                  2
                </span>
                Verify PAN
              </h2>
              {step === 3 && (
                <span className="text-green-400 text-sm">✓ Verified</span>
              )}
            </div>

            {step >= 2 && (
              <div className="space-y-4">
                {/* PAN Input Step */}
                {panStep === 'input' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <p className="text-sm text-blue-300">
                        🔒 Enter your PAN number to receive an OTP on your registered email
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        value={pan}
                        onChange={(e) => setPan(formatPAN(e.target.value))}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white text-center text-lg tracking-wider font-mono focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      />
                      <p className="text-xs text-[var(--color-text-dim)] mt-1 text-center">
                        {pan.length}/10 characters
                      </p>
                    </div>

                    {panError && (
                      <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-2">
                        <span className="text-red-500 text-xl">⚠️</span>
                        <p className="text-sm text-red-400">{panError}</p>
                      </div>
                    )}

                    <button
                      onClick={handleSendOTP}
                      disabled={panLoading || pan.length !== 10}
                      className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {panLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          📧 Send OTP
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* OTP Verification Step */}
                {panStep === 'otp' && (
                  <div className="space-y-4 animate-fade-in">
                    {panSuccess && (
                      <div className="p-3 bg-green-900/20 border border-green-500/50 rounded-lg flex items-start gap-2">
                        <span className="text-green-500 text-xl">✓</span>
                        <p className="text-sm text-green-400">{panSuccess}</p>
                      </div>
                    )}

                    <div className="p-4 bg-black/30 rounded-lg">
                      <p className="text-sm text-[var(--color-text-dim)] mb-1">
                        OTP sent to:
                      </p>
                      <p className="font-semibold text-cyan-400">{maskedEmail}</p>
                      <p className="text-xs text-yellow-400 mt-2">
                        💡 Check your terminal/console for the OTP code
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Enter 6-Digit OTP
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white text-center text-2xl tracking-widest font-mono focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      />
                    </div>

                    {panError && (
                      <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-2">
                        <span className="text-red-500 text-xl">⚠️</span>
                        <p className="text-sm text-red-400">{panError}</p>
                      </div>
                    )}

                    <button
                      onClick={handleVerifyOTP}
                      disabled={panLoading || otp.length !== 6}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {panLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          ✓ Verify PAN
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-sm">
                      <button
                        onClick={() => {
                          setPanStep('input');
                          setOtp('');
                          setPanError('');
                        }}
                        className="text-[var(--color-text-dim)] hover:text-white transition-colors"
                      >
                        ← Change PAN
                      </button>
                      <button
                        onClick={handleResendOTP}
                        disabled={panLoading}
                        className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>
                )}

                {/* Verified Step */}
                {panStep === 'verified' && (
                  <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg animate-fade-in">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-xl">
                        ✓
                      </div>
                      <div>
                        <p className="font-semibold text-green-400">PAN Verified Successfully!</p>
                        <p className="text-sm text-[var(--color-text-dim)]">Welcome, {userName}</p>
                      </div>
                    </div>
                    <div className="bg-black/30 p-3 rounded">
                      <p className="text-xs text-[var(--color-text-dim)]">PAN Number</p>
                      <p className="font-mono font-semibold text-white">{pan}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Success */}
          {step === 3 && creditInfo && (
            <div className="p-6 rounded-xl border border-green-500/50 bg-green-900/10 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <h2 className="text-2xl font-semibold text-green-400">
                  Verification Successful!
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 p-4 rounded-lg">
                  <p className="text-sm text-[var(--color-text-dim)] mb-1">Credit Limit</p>
                  <p className="text-3xl font-bold text-green-400">
                    ${creditInfo.limit}
                  </p>
                  <p className="text-xs text-[var(--color-text-dim)]">USDC</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg">
                  <p className="text-sm text-[var(--color-text-dim)] mb-1">Available to Borrow</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    ${creditInfo.available}
                  </p>
                  <p className="text-xs text-[var(--color-text-dim)]">USDC</p>
                </div>
              </div>

              <div className="p-4 bg-black/20 rounded-lg mb-4">
                <p className="text-sm text-[var(--color-text-dim)]">
                  Verified Income Tier: <span className="text-white font-semibold">{creditInfo.income}</span>
                </p>
              </div>

              <button
                onClick={goToDashboard}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 rounded-lg font-semibold transition-all"
              >
                Go to Dashboard →
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-900/10 border border-blue-500/30 rounded-xl">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">
            How It Works
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>
                <strong>Zero-Knowledge Proof:</strong> Your income is verified without revealing sensitive data
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>
                <strong>Instant Credit:</strong> Get credit limit based on your verified income tier
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>
                <strong>On-Chain:</strong> All data is stored securely on the blockchain
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
