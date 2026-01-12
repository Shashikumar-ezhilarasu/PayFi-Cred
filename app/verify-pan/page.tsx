"use client";

import PANVerification from '@/components/credit/PANVerification';
import { useRouter } from 'next/navigation';

export default function VerifyPANPage() {
  const router = useRouter();

  const handleVerificationComplete = (userData: any) => {
    console.log('Verification complete:', userData);
    // You can redirect to dashboard or store user data
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            PAN Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Secure verification using OTP sent to your registered email
          </p>
        </div>
        
        <PANVerification onVerificationComplete={handleVerificationComplete} />
      </div>
    </div>
  );
}
