import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tradeData, agentId, userAddress } = body;

    if (!tradeData || !agentId || !userAddress) {
      return NextResponse.json(
        { error: 'Missing tradeData, agentId, or userAddress' },
        { status: 400 }
      );
    }

    console.log(`Analyzing risk for agent ${agentId} actions`);

    // Simulate off-chain analysis of trade data
    // Randomly decide if it's a Profit (+1), Loss (-1), or Neutral (0)
    // For demo purposes, we can use the input to force a result or random
    
    // Check if user requested a specific outcome in tradeData
    let pnlBucket = 0; // Default Neutral
    
    if (tradeData.action === 'WIN' || tradeData.profit > 0) {
      pnlBucket = 1;
    } else if (tradeData.action === 'LOSS' || tradeData.profit < 0) {
      pnlBucket = -1;
    } else {
      // Random if not specified
      const rand = Math.random();
      if (rand > 0.6) pnlBucket = 1;
      else if (rand < 0.3) pnlBucket = -1;
    }

    // Generate mock proof hash
    const timestamp = Math.floor(Date.now() / 1000);
    const mockData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'bytes32', 'int256', 'uint256', 'string'],
      [userAddress, agentId, pnlBucket, timestamp, 'mock-risk-proof']
    );
    const proofHash = ethers.keccak256(mockData);

    return NextResponse.json({
      success: true,
      data: {
        userAddress,
        agentId,
        pnlBucket,
        proofHash,
        timestamp,
        analysis: pnlBucket === 1 ? 'PROFITABLE' : pnlBucket === -1 ? 'RISKY' : 'NEUTRAL'
      }
    });

  } catch (error: any) {
    console.error('Error in agent-risk API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
