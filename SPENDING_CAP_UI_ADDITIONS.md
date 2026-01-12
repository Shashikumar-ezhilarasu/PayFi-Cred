# Spending Cap UI Addition for AgentControlPanel

## Changes Needed

### 1. Add State Variables (after line 21)

```typescript
const [spendingCap, setSpendingCap] = useState('0');
const [newSpendingCap, setNewSpendingCap] = useState('');
```

### 2. Update loadAgentData function (add after line 49)

```typescript
// Get spending cap
const cap = await agentWallet.spendingCap();
setSpendingCap(ethers.formatUnits(cap, 6)); // USDC 6 decimals
```

### 3. Add Update Spending Cap Function (after handleAuthorizeBot function, around line 127)

```typescript
// 4. UPDATE SPENDING CAP - Increase agent's spending limit
const handleUpdateSpendingCap = async () => {
  if (!newSpendingCap || Number(newSpendingCap) <= 0) {
    setError('Please enter a valid spending cap amount');
    return;
  }

  setLoading('updateCap');
  setError('');
  setSuccess('');

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const agentWallet = new ethers.Contract(
      agentWalletAddress,
      CONTRACT_ABIS.AgentWallet,
      signer
    );

    const newCap = ethers.parseUnits(newSpendingCap, 6); // USDC 6 decimals
    
    console.log('Updating spending cap to:', newSpendingCap);
    const tx = await agentWallet.updateSpendingCap(newCap);
    console.log('Update transaction sent:', tx.hash);
    await tx.wait();

    setSuccess(`Spending cap updated to $${newSpendingCap}!`);
    setNewSpendingCap('');
    await loadAgentData();
  } catch (err: any) {
    console.error('Update spending cap failed:', err);
    setError('Update failed: ' + (err.message || 'Unknown error'));
  } finally {
    setLoading(null);
  }
};
```

### 4. Add UI Section (after the "Repay Debt" section, before the closing </div>)

```tsx
{/* 4. UPDATE SPENDING CAP */}
<motion.div
  initial={{ opacity:  0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 p-6 rounded-xl border border-orange-500/30"
>
  <div className="flex items-center gap-3 mb-4">
    <Activity className="w-6 h-6 text-orange-400" />
    <h3 className="text-xl font-semibold text-orange-300">4. Update Spending Cap</h3>
  </div>

  <div className="space-y-4">
    <div className="bg-black/30 p-4 rounded-lg">
      <p className="text-sm text-gray-400 mb-1">Current Spending Cap</p>
      <p className="text-2xl font-bold text-orange-400">${Number(spendingCap).toFixed(2)} USDC</p>
    </div>

    <div>
      <label className="block text-sm text-gray-400 mb-2">New Spending Cap (USDC)</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={newSpendingCap}
          onChange={(e) => setNewSpendingCap(e.target.value)}
          disabled={loading !== null}
          step="100"
          placeholder="10000"
          className="flex-1 bg-black/30 border border-gray-600 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
        />
        <button
          onClick={handleUpdateSpendingCap}
          disabled={loading !== null || !newSpendingCap}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 rounded-lg font-semibold transition-all flex items-center gap-2"
        >
          {loading === 'updateCap' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Cap'
          )}
        </button>
      </div>
    </div>

    <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3">
      <p className="text-xs text-blue-300">
        <strong>Note:</strong> Increase this if you see "Exceeds spending cap" errors. 
        This limits how much the agent can spend per transaction.
      </p>
    </div>
  </div>
</motion.div>
```

## Summary

This adds a fourth section to the Agent Control Panel that allows you to:
1. View the current spending cap
2. Update it to a higher amount
3. Shows helpful note about when to use it

The UI follows the same design pattern as the other three sections (Fund, Authorize, Repay).
