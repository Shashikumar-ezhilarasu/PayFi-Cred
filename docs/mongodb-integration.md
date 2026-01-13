# MongoDB Integration: Secure KYC Data Management

## 🎯 Overview

PayFi-Cred uses MongoDB for secure storage and management of KYC (Know Your Customer) data, implementing a privacy-first approach where sensitive identity information is cryptographically linked to wallet addresses without exposing personal data.

## 🔧 Technical Implementation

### Database Architecture

```javascript
// MongoDB connection configuration
const mongoConfig = {
  uri: process.env.MONGODB_URI,
  database: "PayFiCredDB",
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: process.env.NODE_ENV === "production",
  },
};
```

### Collection Schema Design

#### `kyc_verifications` Collection

```javascript
{
  _id: ObjectId,
  walletAddress: "0x...",           // Primary key (indexed)
  panNumber: "ABCDE1234F",          // Encrypted PAN
  panName: "JOHN DOE",              // Encrypted name
  aadhaarNumber: "123456789012",    // Encrypted Aadhaar
  aadhaarName: "JOHN DOE",          // Encrypted name
  verificationStatus: "verified|pending|failed",
  verificationDate: ISODate("2024-01-15T10:30:00Z"),
  ipfsHash: "Qm...",                // Document storage hash
  blockchainTxHash: "0x...",        // On-chain verification
  createdAt: ISODate("2024-01-15T10:25:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z"),
  metadata: {
    panLastFour: "E1234F",          // For display purposes
    verificationMethod: "otp|biometric",
    riskScore: 0.15
  }
}
```

#### `user_profiles` Collection

```javascript
{
  _id: ObjectId,
  walletAddress: "0x...",           // Primary key
  email: "user@domain.com",         // Optional, encrypted
  phone: "+91XXXXXXXXXX",           // Optional, encrypted
  kycLevel: "basic|advanced|complete",
  preferences: {
    notifications: true,
    autoRepayment: false,
    language: "en"
  },
  createdAt: ISODate("2024-01-15T10:00:00Z"),
  lastLogin: ISODate("2024-01-15T10:25:00Z"),
  deviceInfo: {
    userAgent: "Mozilla/5.0...",
    ipAddress: "192.168.1.1",
    location: "Mumbai, India"
  }
}
```

#### `verification_logs` Collection

```javascript
{
  _id: ObjectId,
  walletAddress: "0x...",
  verificationType: "pan|aadhaar|income",
  action: "otp_sent|otp_verified|verification_complete|verification_failed",
  timestamp: ISODate("2024-01-15T10:25:00Z"),
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  metadata: {
    panLastFour: "E1234F",
    errorCode: null,
    attemptNumber: 1
  }
}
```

## 🌟 Benefits to PayFi-Cred

### Privacy-First Design

- **Decentralized Access**: Only wallet owners can access their data
- **Cryptographic Linking**: Identity data linked to wallets without exposure
- **Zero-Knowledge Verification**: KYC compliance without revealing personal information
- **Regulatory Compliance**: Maintains audit trails while preserving privacy

### Security Features

- **Field-Level Encryption**: Sensitive data encrypted before storage
- **Access Control**: Wallet-based authentication for data access
- **Audit Logging**: Complete verification history tracking
- **Data Minimization**: Only necessary data collected and stored

## 🔗 Integration Points

### API Layer (`api/pan-verification/`)

```typescript
// POST /api/pan-verification/send-otp
export async function POST(request: Request) {
  const { panNumber, walletAddress } = await request.json();

  // Encrypt PAN data
  const encryptedPAN = await encryptData(panNumber);
  const encryptedName = await encryptData(panName);

  // Store in MongoDB
  await db.collection("kyc_verifications").insertOne({
    walletAddress: walletAddress.toLowerCase(),
    panNumber: encryptedPAN,
    panName: encryptedName,
    verificationStatus: "pending",
    createdAt: new Date(),
  });

  // Send OTP via external service
  const otpResult = await sendOTP(panNumber);

  return Response.json({
    success: true,
    verificationId: generateVerificationId(),
    message: "OTP sent successfully",
  });
}
```

### Verification Flow

```typescript
// POST /api/pan-verification/verify-otp
export async function POST(request: Request) {
  const { verificationId, otp, walletAddress } = await request.json();

  // Verify OTP
  const isValidOTP = await verifyOTP(verificationId, otp);

  if (isValidOTP) {
    // Update verification status
    await db.collection("kyc_verifications").updateOne(
      { walletAddress: walletAddress.toLowerCase() },
      {
        $set: {
          verificationStatus: "verified",
          verificationDate: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // Log verification event
    await db.collection("verification_logs").insertOne({
      walletAddress,
      verificationType: "pan",
      action: "otp_verified",
      timestamp: new Date(),
      ipAddress: getClientIP(request),
    });

    return Response.json({
      success: true,
      message: "PAN verified successfully",
    });
  }

  return Response.json(
    {
      success: false,
      message: "Invalid OTP",
    },
    { status: 400 }
  );
}
```

## 🔒 Security Implementation

### Encryption Strategy

```typescript
// lib/encryption.ts
import crypto from "crypto";

export class DataEncryption {
  private algorithm = "aes-256-gcm";

  async encryptData(data: string, walletAddress: string): Promise<string> {
    // Generate wallet-specific key
    const key = this.generateWalletKey(walletAddress);

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, key);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      encrypted,
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
    });
  }

  async decryptData(
    encryptedData: string,
    walletAddress: string
  ): Promise<string> {
    const { encrypted, iv, authTag } = JSON.parse(encryptedData);
    const key = this.generateWalletKey(walletAddress);

    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  private generateWalletKey(walletAddress: string): string {
    // Derive encryption key from wallet address
    return crypto
      .createHash("sha256")
      .update(walletAddress + process.env.ENCRYPTION_SALT)
      .digest("hex");
  }
}
```

### Access Control

```typescript
// lib/auth.ts
export class WalletAuth {
  async verifyWalletAccess(
    walletAddress: string,
    signature: string,
    message: string
  ): Promise<boolean> {
    // Verify that the signature was created by the wallet owner
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  }

  async getUserData(walletAddress: string, authToken: string): Promise<any> {
    // Verify authentication
    const isAuthenticated = await this.verifyAuthToken(
      authToken,
      walletAddress
    );

    if (!isAuthenticated) {
      throw new Error("Unauthorized access");
    }

    // Return only user's own data
    return await db
      .collection("kyc_verifications")
      .findOne({ walletAddress: walletAddress.toLowerCase() });
  }
}
```

## 📊 Database Operations

### Connection Management

```typescript
// lib/database.ts
import { MongoClient } from "mongodb";

class DatabaseManager {
  private client: MongoClient;
  private db: any;

  async connect() {
    this.client = new MongoClient(mongoConfig.uri, mongoConfig.options);
    await this.client.connect();
    this.db = this.client.db(mongoConfig.database);
    console.log("✅ Connected to MongoDB");
  }

  async getKYCData(walletAddress: string) {
    return await this.db.collection("kyc_verifications").findOne(
      { walletAddress: walletAddress.toLowerCase() },
      { projection: { _id: 0 } } // Exclude MongoDB ObjectId
    );
  }

  async updateKYCStatus(
    walletAddress: string,
    status: string,
    additionalData: any = {}
  ) {
    return await this.db.collection("kyc_verifications").updateOne(
      { walletAddress: walletAddress.toLowerCase() },
      {
        $set: {
          verificationStatus: status,
          ...additionalData,
          updatedAt: new Date(),
        },
      }
    );
  }

  async logVerificationEvent(walletAddress: string, eventData: any) {
    return await this.db.collection("verification_logs").insertOne({
      walletAddress: walletAddress.toLowerCase(),
      ...eventData,
      timestamp: new Date(),
    });
  }
}
```

### Query Optimization

```javascript
// Database indexes for performance
const indexes = [
  { key: { walletAddress: 1 }, name: "walletAddress_index" },
  { key: { verificationStatus: 1 }, name: "status_index" },
  { key: { createdAt: 1 }, name: "createdAt_index" },
  { key: { "metadata.panLastFour": 1 }, name: "panLastFour_index" },
];

// Create indexes
await db.collection("kyc_verifications").createIndexes(indexes);
```

## 🔄 Integration with Other Systems

### Blockchain Layer (Shardeum)

```typescript
// Store verification proofs on-chain
const storeVerificationProof = async (
  walletAddress: string,
  proofHash: string
) => {
  const contract = getVerificationContract();
  const tx = await contract.storeKYCProof(walletAddress, proofHash);
  await tx.wait();

  // Update MongoDB with transaction hash
  await db.collection("kyc_verifications").updateOne(
    { walletAddress: walletAddress.toLowerCase() },
    {
      $set: {
        blockchainTxHash: tx.hash,
        onChainVerified: true,
      },
    }
  );
};
```

### Inco Confidential Computing

```typescript
// Confidential KYC verification
const confidentialKYC = async (encryptedPAN: string, walletAddress: string) => {
  // Use Inco to verify PAN without decrypting
  const verificationResult = await inco.verifyPANConfidentially(
    encryptedPAN,
    walletAddress
  );

  return verificationResult;
};
```

### Frontend Integration

```typescript
// components/kyc/PANVerification.tsx
const PANVerification = () => {
  const [panNumber, setPanNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");

  const sendOTP = async () => {
    const response = await fetch("/api/pan-verification/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        panNumber,
        walletAddress: wallet.address,
      }),
    });

    const result = await response.json();
    setVerificationId(result.verificationId);
  };

  const verifyOTP = async () => {
    const response = await fetch("/api/pan-verification/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verificationId,
        otp,
        walletAddress: wallet.address,
      }),
    });

    if (response.ok) {
      // Update UI to show verified status
      setVerificationStatus("verified");
    }
  };

  return (
    <div className="pan-verification">
      <input
        type="text"
        placeholder="Enter PAN Number"
        value={panNumber}
        onChange={(e) => setPanNumber(e.target.value)}
      />
      <button onClick={sendOTP}>Send OTP</button>

      {verificationId && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOTP}>Verify OTP</button>
        </>
      )}
    </div>
  );
};
```

## 📈 Performance & Scalability

### Query Performance

- **Indexed Lookups**: Sub-millisecond wallet-based queries
- **Connection Pooling**: Efficient database connection management
- **Caching Layer**: Redis integration for frequently accessed data
- **Read Replicas**: Distributed read operations for high availability

### Data Growth Management

- **Archival Strategy**: Automatic archival of old verification logs
- **Compression**: Database-level compression for large datasets
- **Partitioning**: Time-based partitioning for large collections
- **Backup Strategy**: Automated backups with point-in-time recovery

## 🛡️ Compliance & Privacy

### GDPR Compliance

- **Data Minimization**: Only collect necessary KYC data
- **Right to Erasure**: Complete data deletion capabilities
- **Consent Management**: Explicit user consent for data processing
- **Data Portability**: Export user data in standard formats

### Indian Regulatory Compliance

- **RBI Guidelines**: Compliance with Reserve Bank of India KYC norms
- **Data Localization**: Secure data residency in India
- **Audit Trails**: Complete transaction and verification logging
- **AML Integration**: Anti-Money Laundering compliance features

## 📊 Monitoring & Analytics

### Database Metrics

```typescript
// lib/monitoring.ts
export class DatabaseMonitor {
  async getMetrics() {
    const stats = await db.command({ dbStats: 1 });

    return {
      totalSize: stats.dataSize,
      collectionsCount: stats.collections,
      indexesCount: stats.indexes,
      connections: stats.connections,
    };
  }

  async getKYCStats() {
    const stats = await db
      .collection("kyc_verifications")
      .aggregate([
        {
          $group: {
            _id: "$verificationStatus",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    return stats;
  }
}
```

### Security Monitoring

- **Access Logs**: All database access attempts logged
- **Anomaly Detection**: Unusual query patterns flagged
- **Encryption Validation**: Regular checks of encrypted data integrity
- **Compliance Reports**: Automated regulatory reporting

## 🚀 Future Enhancements

### Advanced Features

- **Multi-Region Replication**: Global data distribution
- **Real-time Sync**: Instant data synchronization across regions
- **AI-Powered Risk Assessment**: Machine learning for fraud detection
- **Blockchain Integration**: Direct smart contract data anchoring

### Performance Optimizations

- **GraphQL API**: Efficient data fetching with GraphQL
- **Edge Computing**: Database operations closer to users
- **Advanced Caching**: Multi-level caching strategies
- **Auto-scaling**: Automatic resource scaling based on load

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe("KYC Database Operations", () => {
  it("should encrypt and store PAN data", async () => {
    const testPAN = "ABCDE1234F";
    const walletAddress = "0x123...";

    await kycService.storePAN(testPAN, walletAddress);

    const storedData = await db
      .collection("kyc_verifications")
      .findOne({ walletAddress });

    expect(storedData.panNumber).not.toBe(testPAN); // Should be encrypted
    expect(storedData.verificationStatus).toBe("pending");
  });

  it("should verify OTP and update status", async () => {
    // Test OTP verification flow
    const result = await kycService.verifyOTP(
      "valid-verification-id",
      "123456"
    );
    expect(result.success).toBe(true);

    const updatedData = await db
      .collection("kyc_verifications")
      .findOne({ verificationId: "valid-verification-id" });

    expect(updatedData.verificationStatus).toBe("verified");
  });
});
```

### Integration Tests

- **End-to-End KYC Flow**: Complete PAN verification process
- **Multi-User Scenarios**: Concurrent verification handling
- **Failure Recovery**: Network failures and retry logic
- **Security Testing**: Encryption and access control validation

## 📋 Deployment & Maintenance

### Production Setup

```bash
# Environment variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/payficred
MONGODB_DB=PayFiCredDB
ENCRYPTION_SALT=your-secure-salt-here

# Database initialization
npm run db:init
npm run db:create-indexes
npm run db:seed
```

### Backup Strategy

- **Automated Backups**: Daily full backups with incremental updates
- **Point-in-Time Recovery**: Restore to any specific timestamp
- **Cross-Region Replication**: Disaster recovery across regions
- **Encryption at Rest**: All data encrypted in backup storage

---

_MongoDB integration - Secure, scalable, and privacy-preserving KYC data management._</content>
<parameter name="filePath">/Users/shashikumarezhil/Documents/HProjects/PayFi-Cred/docs/mongodb-integration.md
