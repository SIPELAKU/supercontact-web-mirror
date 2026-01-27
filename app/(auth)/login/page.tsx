// app/(auth)/login/page.tsx
"use client";

import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { useAuth } from "@/lib/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user came from email verification
    const verified = searchParams.get("verified");
    if (verified === "true") {
      setSuccessMessage("Email verified successfully! You can now log in.");

      // Auto-dismiss success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Cleanup timer on component unmount
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      if (success) {
        // Redirect to home page after successful login
        router.push("/");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage =
        err?.message ||
        err?.error ||
        (typeof err === "string"
          ? err
          : "An error occurred. Please try again.");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-3 bg-gray-50">
      {/* Left Section */}
      <section className="hidden md:flex md:col-span-2 items-center justify-center bg-gray-100">
        <div className="p-10">
          <Image
            src="/assets/logo3d.png"
            alt="Supercontact Logo"
            width={400}
            height={400}
          />
        </div>
      </section>

      {/* Right Section */}
      <section
        className={`flex flex-col md:col-span-1 justify-center px-8 md:px-20 py-10 bg-white`}
      >
        <h1
          className={`text-[32px] font-bold text-gray-900 leading-tight text-center ${poppins.className}`}
        >
          Welcome back!
        </h1>

        <h2
          className={`text-[32px] font-bold text-center ${poppins.className}`}
        >
          <span className="text-[#5479EE]">Super</span>
          <span className="text-[#5BC557]">Contact</span>
        </h2>

        <p className="mt-2 text-sm text-gray-500 text-center">
          Login to your account
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm flex items-center justify-between">
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage("")}
                className="ml-2 text-green-400 hover:text-green-600 focus:outline-none"
                aria-label="Dismiss message"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <AppInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <AppInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex justify-start">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <AppButton
            variantStyle="primary"
            color="primary"
            disabled={isLoading}
            onClick={handleSubmit}
            fullWidth
            type="submit"
          >
            {isLoading ? "Masuk..." : "Masuk"}
          </AppButton>
        </form>

        <p className="mt-6 text-sm text-gray-600 text-start">
          Don't have account?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Register here
          </Link>
        </p>
      </section>
    </main>
  );
}
