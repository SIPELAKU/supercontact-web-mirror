"use client";

import { resendOTP, verifyOTP } from "@/lib/api";
import { handleError } from "@/lib/utils/errorHandler";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmailVerification() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get email from URL params if available
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Countdown timer for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      setIsLoading(false);
      return;
    }

    try {
      const response = await verifyOTP({ 
        email, 
        otp_type: "Verification Email",
        code: otp 
      });
      
      if (response.success) {
        // On success, redirect to login with success message
        router.push('/login?verified=true');
      } else {
        // Handle API error response structure: { success: false, error: { message: "..." } }
        const errorMessage = response.error?.message || response.message || 'Invalid OTP code. Please try again.';
        setError(errorMessage);
      }
      
    } catch (err: any) {
      const errorMessage = handleError(err, 'OTP verification error', 'Invalid OTP code. Please try again.');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setIsResending(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await resendOTP({ 
        email, 
        otp_type: "Verification Email" 
      });
      
      if (response.success) {
        setResendCooldown(60); // 60 second cooldown
        setSuccessMessage('OTP code has been resent to your email');
      } else {
        // Handle API error response structure: { success: false, error: { message: "..." } }
        const errorMessage = response.error?.message || response.message || 'Failed to resend OTP. Please try again.';
        setError(errorMessage);
      }
      
    } catch (err: any) {
      const errorMessage = handleError(err, 'Resend OTP error', 'Failed to resend OTP. Please try again.');
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const maskEmail = (email: string) => {
    if (!email) return 'your email';
    const [username, domain] = email.split('@');
    if (!domain) return email;
    const maskedUsername = username.charAt(0) + '*'.repeat(Math.max(0, username.length - 2)) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/assets/logo-supercontact.png"
            alt="Supercontact Logo"
            width={200}
            height={80}
            className="mx-auto"
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Verify Your Email
          </h1>

          <p className="text-sm text-gray-600 text-center mb-6">
            We've sent a 6-digit OTP code to: <br />
            <span className="font-medium">{maskEmail(email)}</span>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm mb-4">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to your email</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify & Complete Registration"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button
                onClick={handleResendOTP}
                disabled={isResending || resendCooldown > 0}
                className="text-blue-600 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/register" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Registration
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
