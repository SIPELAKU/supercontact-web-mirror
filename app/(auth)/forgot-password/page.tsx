"use client";

import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import axios from "axios";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/otp/resend`,
        {
          email: email,
          otp_type: "Reset Password",
        },
      );

      if (response.status === 200) {
        // Redirect to OTP verification page
        router.push(
          `/forgot-password/verify-otp?email=${encodeURIComponent(email)}`,
        );
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
    <div
      className={`min-h-screen flex items-center justify-center bg-[#F5F6FA] px-4 ${poppins.className}`}
    >
      <div className="bg-white w-full max-w-[440px] h-screen flex flex-col">
        {/* Logo */}
        <div className="flex justify-center mb-16 mt-[50px]">
          <Image
            src="/assets/sc-logo.png"
            alt="SuperContact Logo"
            width={158}
            height={38}
            className="object-contain"
            priority
          />
        </div>

        {/* Main Card */}
        <div className="p-10 space-y-8 mt-[150px]">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-[32px] font-bold text-gray-900 leading-tight">
              Forgot Password?
            </h1>
            <p className="text-[#6B7280] text-sm leading-relaxed px-0">
              Don't worry. Enter your registered email address and we'll send
              you a password reset link.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          >
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <AppInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 p-3 rounded-lg">
                {error}
              </div>
            )}

            <AppButton
              variantStyle="primary"
              color="primary"
              disabled={isLoading || !email}
              fullWidth
              onClick={handleSubmit}
            >
              {isLoading ? "Sending..." : "Send Link Reset Password"}
            </AppButton>
          </form>

          {/* Footer */}
          <div className="text-center text-sm">
            <span className="text-gray-500">Back to </span>
            <Link
              href="/login"
              className="text-[#5479EE] font-semibold hover:underline"
            >
              Login Page
            </Link>
          </div>

          {/* Divider */}
          <div className="pt-4 border-t border-gray-100"></div>
        </div>
      </div>
    </div>
  );
}
