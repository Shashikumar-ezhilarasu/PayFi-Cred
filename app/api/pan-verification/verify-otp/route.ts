import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://shashikumarezhil_db_user:qwerty1234@payfi.ttbkd39.mongodb.net/?appName=payfi";

// Import the same OTP store (in production, use shared storage like Redis)
declare global {
  var otpStore: Map<string, { otp: string; expiresAt: number }>;
}

if (!global.otpStore) {
  global.otpStore = new Map();
}

const otpStore = global.otpStore;

export async function POST(request: Request) {
  try {
    const { pan, otp } = await request.json();

    if (!pan || !otp) {
      return NextResponse.json(
        { error: 'PAN and OTP are required' },
        { status: 400 }
      );
    }

    const panKey = pan.toUpperCase().trim();
    const storedData = otpStore.get(panKey);

    if (!storedData) {
      return NextResponse.json(
        { error: 'OTP expired or not found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(panKey);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp.trim()) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP verified successfully - remove from store
    otpStore.delete(panKey);

    // Get user details from MongoDB
    const client = new MongoClient(uri);
    await client.connect();

    const database = client.db("payfi");
    const collection = database.collection("users");

    const user = await collection.findOne({ 
      pan: { $regex: new RegExp(`^${panKey}$`, 'i') } 
    });

    await client.close();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'PAN verified successfully',
      user: {
        name: user.name,
        email: user.email,
        pan: user.pan,
        aadhar: user.aadhar,
        phone: user.phone
      }
    });

  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}
