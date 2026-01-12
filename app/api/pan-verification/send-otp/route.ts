import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://shashikumarezhil_db_user:qwerty1234@payfi.ttbkd39.mongodb.net/?appName=payfi";

// In-memory OTP storage
declare global {
  var otpStore: Map<string, { otp: string; expiresAt: number }>;
}

if (!global.otpStore) {
  global.otpStore = new Map();
}

const otpStore = global.otpStore;

export async function POST(request: Request) {
  try {
    const { pan } = await request.json();

    if (!pan || pan.trim() === '') {
      return NextResponse.json(
        { error: 'PAN number is required' },
        { status: 400 }
      );
    }

    const client = new MongoClient(uri);
    await client.connect();

    const database = client.db("payfi");
    const collection = database.collection("users");

    // Find user by PAN
    const user = await collection.findOne({ 
      pan: { $regex: new RegExp(`^${pan.trim()}$`, 'i') } 
    });

    await client.close();

    if (!user) {
      return NextResponse.json(
        { error: 'PAN number not found in our records' },
        { status: 404 }
      );
    }

    // Generate RANDOM 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Log OTP to console (MOCK EMAIL)
    console.log('\n=================================');
    console.log('🔐 OTP Generated for PAN:', pan.toUpperCase().trim());
    console.log('📧 RANDOM OTP:', otp);
    console.log('👤 User:', user.name);
    console.log('📨 Email:', user.email);
    console.log('=================================\n');

    // Store OTP with 10 minutes expiry
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(pan.toUpperCase().trim(), { otp, expiresAt });

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully (check console)',
      email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      name: user.name,
      otp: otp // Send OTP to frontend to display in browser console
    });

  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
