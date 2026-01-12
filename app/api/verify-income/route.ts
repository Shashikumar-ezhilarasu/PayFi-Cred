import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userAddress, incomeAmount } = body;

    if (!userAddress || !incomeAmount) {
      return NextResponse.json(
        { error: 'Missing userAddress or incomeAmount' },
        { status: 400 }
      );
    }

    console.log(`Verifying income for ${userAddress} with amount ${incomeAmount}`);

    // Determine income bucket based on amount
    // Buckets: 0, 500, 1000, 2000
    let incomeBucket = 0;
    const amount = Number(incomeAmount);

    if (amount >= 2000) {
      incomeBucket = 2000;
    } else if (amount >= 1000) {
      incomeBucket = 1000;
    } else if (amount >= 500) {
      incomeBucket = 500;
    }

    // Generate a mock proof hash (simulating Vlayer/Vouch proof)
    // In production, this would be a real ZK proof hash
    const timestamp = Math.floor(Date.now() / 1000);
    const mockData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'uint256', 'uint256', 'string'],
      [userAddress, incomeBucket, timestamp, 'mock-proof-salt']
    );
    const proofHash = ethers.keccak256(mockData);

    return NextResponse.json({
      success: true,
      data: {
        userAddress,
        incomeBucket,
        proofHash,
        timestamp,
        formattedAmount: amount
      }
    });
  } catch (error: any) {
    console.error('Error in verify-income API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
