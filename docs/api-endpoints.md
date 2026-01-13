# API Endpoints: PayFi-Cred Backend Services

## 🎯 Overview

PayFi-Cred implements a comprehensive REST API architecture that handles credit operations, KYC verification, income proof validation, and blockchain interactions. All endpoints follow RESTful conventions with JSON responses and implement proper authentication and error handling.

## 🔧 API Architecture

### Base Configuration

```typescript
// lib/api-config.ts
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.API_KEY,
  },
};
```

### Authentication Middleware

```typescript
// lib/auth-middleware.ts
export async function authenticateWallet(request: Request): Promise<string> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);
  const walletAddress = await verifyWalletToken(token);

  return walletAddress;
}

export async function verifyWalletToken(token: string): Promise<string> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.walletAddress;
  } catch (error) {
    throw new Error("Invalid wallet token");
  }
}
```

## 📋 Core API Endpoints

### 1. KYC Verification Endpoints

#### POST `/api/pan-verification/send-otp`

Send OTP for PAN verification.

**Request Body:**

```json
{
  "panNumber": "ABCDE1234F",
  "panName": "JOHN DOE",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

**Response:**

```json
{
  "success": true,
  "verificationId": "ver_1234567890",
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

**Implementation:**

```typescript
// app/api/pan-verification/send-otp/route.ts
export async function POST(request: Request) {
  try {
    const { panNumber, panName, walletAddress } = await request.json();

    // Validate input
    if (!panNumber || !panName || !walletAddress) {
      return Response.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Check if PAN is already verified
    const existingVerification = await db
      .collection("kyc_verifications")
      .findOne({
        walletAddress: walletAddress.toLowerCase(),
        verificationStatus: "verified",
      });

    if (existingVerification) {
      return Response.json(
        {
          success: false,
          message: "PAN already verified for this wallet",
        },
        { status: 409 }
      );
    }

    // Generate verification ID
    const verificationId = `ver_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Encrypt sensitive data
    const encryptedPAN = await encryptData(panNumber);
    const encryptedName = await encryptData(panName);

    // Store verification request
    await db.collection("kyc_verifications").insertOne({
      walletAddress: walletAddress.toLowerCase(),
      panNumber: encryptedPAN,
      panName: encryptedName,
      verificationStatus: "pending",
      verificationId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Send OTP via external service
    const otpResult = await sendOTP(panNumber);

    if (!otpResult.success) {
      return Response.json(
        {
          success: false,
          message: "Failed to send OTP",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      verificationId,
      message: "OTP sent successfully",
      expiresIn: 300,
    });
  } catch (error) {
    console.error("PAN OTP send error:", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
```

#### POST `/api/pan-verification/verify-otp`

Verify PAN with OTP.

**Request Body:**

```json
{
  "verificationId": "ver_1234567890",
  "otp": "123456",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

**Response:**

```json
{
  "success": true,
  "message": "PAN verified successfully",
  "panLastFour": "E1234F",
  "verificationDate": "2024-01-15T10:30:00Z"
}
```

#### POST `/api/aadhaar-verification/send-otp`

Send OTP for Aadhaar verification.

**Request Body:**

```json
{
  "aadhaarNumber": "123456789012",
  "aadhaarName": "JOHN DOE",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

#### POST `/api/aadhaar-verification/verify-otp`

Verify Aadhaar with OTP.

### 2. Income Verification Endpoints

#### POST `/api/verify-income`

Verify user income using confidential computing.

**Request Body:**

```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "incomeData": {
    "monthlyIncome": 50000,
    "employmentType": "salaried",
    "employerName": "Tech Corp"
  },
  "proofType": "confidential"
}
```

**Response:**

```json
{
  "success": true,
  "verificationId": "inc_ver_1234567890",
  "incomeVerified": true,
  "creditLimit": 150000,
  "zkpProof": "proof_data_here",
  "blockchainTxHash": "0x..."
}
```

**Implementation:**

```typescript
// app/api/verify-income/route.ts
export async function POST(request: Request) {
  try {
    const { walletAddress, incomeData, proofType } = await request.json();

    // Authenticate wallet
    const authenticatedWallet = await authenticateWallet(request);
    if (authenticatedWallet !== walletAddress) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Use Inco for confidential income verification
    const verificationResult = await inco.verifyIncomeConfidentially(
      incomeData,
      walletAddress
    );

    if (!verificationResult.verified) {
      return Response.json(
        {
          success: false,
          message: "Income verification failed",
        },
        { status: 400 }
      );
    }

    // Generate ZK proof using vlayer
    const zkpProof = await vlayer.generateIncomeProof(
      incomeData,
      verificationResult.proof
    );

    // Calculate credit limit based on income
    const creditLimit = calculateCreditLimit(incomeData.monthlyIncome);

    // Store verification result
    const verificationId = `inc_ver_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await db.collection("income_verifications").insertOne({
      verificationId,
      walletAddress: walletAddress.toLowerCase(),
      incomeData: await encryptData(JSON.stringify(incomeData)),
      creditLimit,
      zkpProof,
      verificationDate: new Date(),
      status: "verified",
    });

    // Store proof on blockchain
    const txHash = await storeIncomeProofOnChain(walletAddress, zkpProof);

    return Response.json({
      success: true,
      verificationId,
      incomeVerified: true,
      creditLimit,
      zkpProof: zkpProof.publicSignals,
      blockchainTxHash: txHash,
    });
  } catch (error) {
    console.error("Income verification error:", error);
    return Response.json(
      {
        success: false,
        message: "Income verification failed",
      },
      { status: 500 }
    );
  }
}
```

### 3. Credit Operations Endpoints

#### POST `/api/credit/apply`

Apply for credit line.

**Request Body:**

```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "requestedAmount": 100000,
  "loanTerm": 12,
  "purpose": "business_expansion"
}
```

**Response:**

```json
{
  "success": true,
  "creditId": "cred_1234567890",
  "approvedAmount": 100000,
  "interestRate": 12.5,
  "monthlyPayment": 9000,
  "blockchainTxHash": "0x..."
}
```

#### GET `/api/credit/status/:walletAddress`

Get credit status for a wallet.

**Response:**

```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "creditLimit": 150000,
  "availableCredit": 120000,
  "outstandingBalance": 30000,
  "nextPaymentDate": "2024-02-15",
  "paymentHistory": [
    {
      "date": "2024-01-15",
      "amount": 9000,
      "status": "paid"
    }
  ]
}
```

#### POST `/api/credit/repayment`

Make a credit repayment.

**Request Body:**

```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "creditId": "cred_1234567890",
  "paymentAmount": 9000,
  "paymentMethod": "wallet"
}
```

### 4. Agent Risk Assessment Endpoints

#### POST `/api/agent-risk/assess`

Perform AI agent risk assessment.

**Request Body:**

```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "transactionData": {
    "amount": 50000,
    "merchant": "Amazon",
    "category": "shopping"
  },
  "userProfile": {
    "creditScore": 750,
    "incomeVerified": true,
    "previousDefaults": 0
  }
}
```

**Response:**

```json
{
  "riskScore": 0.15,
  "riskLevel": "low",
  "recommendation": "approve",
  "confidence": 0.92,
  "factors": {
    "incomeStability": 0.95,
    "creditHistory": 0.88,
    "transactionPattern": 0.85
  }
}
```

**Implementation:**

```typescript
// app/api/agent-risk/route.ts
export async function POST(request: Request) {
  try {
    const { walletAddress, transactionData, userProfile } =
      await request.json();

    // Get AI agent instance
    const agent = await getAgentInstance(walletAddress);

    // Perform risk assessment
    const riskAssessment = await agent.assessTransactionRisk({
      transactionData,
      userProfile,
      historicalData: await getUserTransactionHistory(walletAddress),
    });

    // Store assessment result
    await db.collection("risk_assessments").insertOne({
      walletAddress: walletAddress.toLowerCase(),
      transactionData,
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.level,
      recommendation: riskAssessment.recommendation,
      confidence: riskAssessment.confidence,
      factors: riskAssessment.factors,
      timestamp: new Date(),
    });

    return Response.json({
      success: true,
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.level,
      recommendation: riskAssessment.recommendation,
      confidence: riskAssessment.confidence,
      factors: riskAssessment.factors,
    });
  } catch (error) {
    console.error("Risk assessment error:", error);
    return Response.json(
      {
        success: false,
        message: "Risk assessment failed",
      },
      { status: 500 }
    );
  }
}
```

### 5. Payment Request Endpoints

#### POST `/api/payment-requests/create`

Create a payment request.

**Request Body:**

```json
{
  "requesterWallet": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "payeeWallet": "0x8ba1f109551bD432803012645261ad5D634A2B",
  "amount": 5000,
  "description": "Invoice payment",
  "dueDate": "2024-02-01",
  "category": "business"
}
```

**Response:**

```json
{
  "success": true,
  "requestId": "req_1234567890",
  "paymentLink": "https://payfi-cred.com/pay/req_1234567890",
  "qrCode": "data:image/png;base64,...",
  "expiresAt": "2024-02-01T23:59:59Z"
}
```

#### GET `/api/payment-requests/:requestId`

Get payment request details.

#### POST `/api/payment-requests/:requestId/pay`

Pay a payment request.

### 6. Transaction History Endpoints

#### GET `/api/transactions/:walletAddress`

Get transaction history for a wallet.

**Query Parameters:**

- `limit`: Number of transactions (default: 20)
- `offset`: Pagination offset (default: 0)
- `startDate`: Filter from date
- `endDate`: Filter to date
- `category`: Filter by category

**Response:**

```json
{
  "transactions": [
    {
      "id": "tx_1234567890",
      "type": "credit_payment",
      "amount": 9000,
      "description": "Monthly credit payment",
      "date": "2024-01-15T10:30:00Z",
      "status": "completed",
      "blockchainTxHash": "0x...",
      "category": "credit"
    }
  ],
  "totalCount": 150,
  "hasMore": true
}
```

### 7. Dashboard Analytics Endpoints

#### GET `/api/dashboard/:walletAddress`

Get dashboard data for a wallet.

**Response:**

```json
{
  "credit": {
    "limit": 150000,
    "available": 120000,
    "utilization": 20
  },
  "transactions": {
    "thisMonth": 45000,
    "lastMonth": 52000,
    "trend": -13.5
  },
  "payments": {
    "pending": 2,
    "overdue": 0,
    "nextDue": "2024-02-15"
  },
  "risk": {
    "score": 0.15,
    "level": "low",
    "lastAssessment": "2024-01-15T10:30:00Z"
  }
}
```

## 🔒 Security & Authentication

### JWT Token Generation

```typescript
// lib/jwt-utils.ts
export function generateWalletToken(
  walletAddress: string,
  signature: string
): string {
  const payload = {
    walletAddress: walletAddress.toLowerCase(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
}

export function verifyWalletSignature(
  message: string,
  signature: string,
  walletAddress: string
): boolean {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    return false;
  }
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
export class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();

  async checkLimit(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000
  ): Promise<boolean> {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier);

    if (!userAttempts || now > userAttempts.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userAttempts.count >= maxAttempts) {
      return false;
    }

    userAttempts.count++;
    return true;
  }
}
```

### Input Validation

```typescript
// lib/validation.ts
export function validatePAN(pan: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

export function validateAadhaar(aadhaar: string): boolean {
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar) && validateAadhaarChecksum(aadhaar);
}

export function validateWalletAddress(address: string): boolean {
  return ethers.utils.isAddress(address);
}
```

## 📊 Error Handling

### Standardized Error Responses

```typescript
// lib/error-responses.ts
export const ERROR_RESPONSES = {
  INVALID_INPUT: {
    code: "INVALID_INPUT",
    message: "Invalid input parameters",
    status: 400,
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "Authentication required",
    status: 401,
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    message: "Access denied",
    status: 403,
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    message: "Resource not found",
    status: 404,
  },
  RATE_LIMITED: {
    code: "RATE_LIMITED",
    message: "Too many requests",
    status: 429,
  },
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "Internal server error",
    status: 500,
  },
};

export function createErrorResponse(
  errorType: keyof typeof ERROR_RESPONSES,
  details?: any
) {
  const error = ERROR_RESPONSES[errorType];
  return Response.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(details && { details }),
      },
    },
    { status: error.status }
  );
}
```

## 🔄 Webhook Integration

### Payment Status Webhooks

```typescript
// app/api/webhooks/payment-status/route.ts
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const signature = request.headers.get("X-Webhook-Signature");

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { transactionId, status, amount, walletAddress } = payload;

    // Update transaction status in database
    await db.collection("transactions").updateOne(
      { transactionId },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    // Trigger notifications if needed
    if (status === "completed") {
      await sendPaymentNotification(walletAddress, amount);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
```

## 📈 Monitoring & Analytics

### API Metrics Collection

```typescript
// lib/api-metrics.ts
export class APIMetrics {
  async recordRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number
  ) {
    await db.collection("api_metrics").insertOne({
      endpoint,
      method,
      statusCode,
      duration,
      timestamp: new Date(),
      userAgent: getUserAgent(),
      ipAddress: getClientIP(),
    });
  }

  async getMetrics(timeRange: string) {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - parseInt(timeRange));

    return await db
      .collection("api_metrics")
      .aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        {
          $group: {
            _id: {
              endpoint: "$endpoint",
              method: "$method",
            },
            count: { $sum: 1 },
            avgDuration: { $avg: "$duration" },
            errorCount: {
              $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] },
            },
          },
        },
      ])
      .toArray();
  }
}
```

## 🧪 Testing Strategy

### API Testing with Jest

```typescript
// __tests__/api/pan-verification.test.ts
describe("PAN Verification API", () => {
  it("should send OTP successfully", async () => {
    const response = await request(app)
      .post("/api/pan-verification/send-otp")
      .send({
        panNumber: "ABCDE1234F",
        panName: "JOHN DOE",
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.verificationId).toBeDefined();
  });

  it("should reject invalid PAN format", async () => {
    const response = await request(app)
      .post("/api/pan-verification/send-otp")
      .send({
        panNumber: "INVALID",
        panName: "JOHN DOE",
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

### Load Testing

```bash
# Load test with Artillery
artillery quick --count 50 --num 10 http://localhost:3000/api/dashboard/0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

## 🚀 Deployment & Scaling

### API Gateway Configuration

```yaml
# api-gateway.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: payfi-cred-api
spec:
  rules:
    - host: api.payfi-cred.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
```

### Horizontal Scaling

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payfi-cred-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payfi-cred-api
  template:
    metadata:
      labels:
        app: payfi-cred-api
    spec:
      containers:
        - name: api
          image: payfi-cred/api:latest
          ports:
            - containerPort: 3000
          env:
            - name: MONGODB_URI
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: uri
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```

---

_Comprehensive REST API architecture for secure, scalable credit operations._</content>
<parameter name="filePath">/Users/shashikumarezhil/Documents/HProjects/PayFi-Cred/docs/api-endpoints.md
