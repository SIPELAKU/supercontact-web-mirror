"use client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp/resend`, {
        email: email,
        otp_type: "Reset Password"
      });

      if (response.status === 200) {
        // Redirect to OTP verification page
        router.push(`/forgot-password/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setError(response.data?.message || "Failed to send reset link");
      }
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data?.message || "Failed to send reset link");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Image
            src="/assets/sc-logo.png"
            alt="SuperContact Logo"
            width={240}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Forget Password?
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Don't worry. Enter your registered email address and we'll send you a password reset link.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5479EE] focus:border-[#5479EE] focus:bg-white outline-none transition-all placeholder-gray-400"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-[#5479EE] hover:bg-[#4366d9] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {isLoading ? "Sending..." : "Send Link Reset Password"}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <span className="text-gray-500">Back to </span>
            <Link
              href="/login"
              className="text-[#5479EE] hover:text-[#4366d9] font-medium transition-colors"
            >
              Login Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}