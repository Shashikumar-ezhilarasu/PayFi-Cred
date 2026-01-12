/**
 * API utility for interacting with the DeFi Agent backend
 * The agent performs autonomous trading strategies and debt repayment
 */

// Configuration
const AGENT_API_BASE_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || 'https://agent-c012.onrender.com';

interface AgentResponse {
  status?: 'success' | 'error';
  message?: string;
}

interface AgentRequest {
  agent_smart_wallet_address: string;
  target_user_address: string;
}

/**
 * Calls the DeFi Agent to execute an autonomous trading strategy and repay debt
 * @param agentWalletAddress - The address of the agent smart wallet that will execute trades
 * @param targetUserAddress - The wallet address of the user whose debt should be repaid
 * @returns The markdown-formatted summary message from the agent
 * @throws Error if the request fails
 */
export async function runAgentStrategy(
  agentWalletAddress: string,
  targetUserAddress: string
): Promise<string> {
  if (!agentWalletAddress || !targetUserAddress) {
    throw new Error('Both agent wallet address and target user address are required');
  }

  // Validate Ethereum address formats
  if (!/^0x[a-fA-F0-9]{40}$/.test(agentWalletAddress)) {
    throw new Error('Invalid agent wallet address format');
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(targetUserAddress)) {
    throw new Error('Invalid target user address format');
  }

  const endpoint = `${AGENT_API_BASE_URL}/agent`;

  const requestBody: AgentRequest = {
    agent_smart_wallet_address: agentWalletAddress,
    target_user_address: targetUserAddress,
  };

  try {
    // Use a longer timeout for blockchain transactions (180 seconds / 3 minutes)
    // Backend needs time for: checking debt, executing Aave strategy, waiting for confirmations, repaying debt
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // Increased to 3 minutes

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent API error (${response.status}): ${errorText}`);
    }

    // Check if response is JSON or plain text
    const contentType = response.headers.get('content-type');
    let message: string;

    if (contentType?.includes('application/json')) {
      const data: AgentResponse = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || 'Agent execution failed');
      }
      
      // Ensure we have a string message
      message = data.message || JSON.stringify(data);
    } else {
      // Response is plain text (string)
      message = await response.text();
    }

    // Ensure message is a string (fallback for any edge cases)
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }

    return message;
  } catch (error: any) {
    // Handle timeout errors specifically
    if (error.name === 'AbortError') {
      throw new Error('The agent is taking longer than expected (>3 minutes). This may happen if:\n• The backend server is cold-starting (Render free tier)\n• Multiple blockchain transactions are being processed\n• Network congestion on Sepolia testnet\n\nThe agent may still be working. Please wait a few more minutes and check your debt balance.');
    }

    // Re-throw other errors with context
    throw new Error(error.message || 'Failed to execute agent strategy');
  }
}

/**
 * Check if the Agent API is healthy
 * @returns true if the API is reachable
 */
export async function checkAgentHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${AGENT_API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
