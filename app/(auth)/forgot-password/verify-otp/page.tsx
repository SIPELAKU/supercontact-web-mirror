"use client";

import { AppButton } from "@/components/ui/app-button";
import { resendOTP, verifyOTP } from "@/lib/api";
import { logger } from "@/lib/utils/logger";
import { Poppins } from "next/font/google";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function ForgotPasswordVerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      logger.info("Verifying OTP for password reset");

      const response = await verifyOTP({
        email: email,
        code: otpCode,
        otp_type: "Reset Password",
      });

      if (response.success && response.data?.reset_token) {
        logger.info("OTP verification successful, storing reset token");

        // Store the reset token in localStorage
        localStorage.setItem("reset_token", response.data.reset_token);

        // Redirect to new password page
        router.push(`/new-password`);
      } else {
        setError(response.message || "Invalid OTP code");
        logger.error("OTP verification failed", { message: response.message });
      }
    } catch (error: any) {
      const errorMessage =
        error.message || "Something went wrong. Please try again.";
      setError(errorMessage);
      logger.error("OTP verification error", { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      logger.info("Resending OTP code");

      await resendOTP({
        email: email,
        otp_type: "Reset Password",
      });

      setCountdown(59);
      setCanResend(false);
      setError("");
      logger.info("OTP resend successful");
    } catch (error: any) {
      const errorMessage = "Failed to resend code. Please try again.";
      setError(errorMessage);
      logger.error("OTP resend error", { error: error.message });
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
              Verification your email
            </h1>
            <p className="text-[#6B7280] text-sm leading-relaxed px-0">
              We have sent a 6 digit OTP code to:
            </p>
            <p className="text-gray-900 font-medium">
              {email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}
            </p>
          </div>

          {/* OTP Input */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Input OTP Code
              </label>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5479EE] focus:border-[#5479EE] outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 p-3 rounded-lg">
                {error}
              </div>
            )}

            <AppButton
              variantStyle="primary"
              color="primary"
              disabled={isLoading || otp.join("").length !== 6}
              fullWidth
              onClick={handleVerifyOtp}
            >
              {isLoading ? "Verifying..." : "Continue Reset Password"}
            </AppButton>
          </div>

          {/* Resend Code */}
          <div className="text-center text-sm">
            <span className="text-gray-500">Didn't receive the code? </span>
            {canResend ? (
              <AppButton
                variantStyle="primary"
                color="primary"
                disabled={isLoading}
                fullWidth
                onClick={handleResendCode}
              >
                Resend Code
              </AppButton>
            ) : (
              <span className="text-gray-400">
                Resend Code ({countdown.toString().padStart(2, "0")})
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="pt-4 border-t border-gray-100"></div>
        </div>
      </div>
    </div>
  );
}
