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
import { CircularProgress } from "@mui/material";
import { ArrowLeft } from "lucide-react";

import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user came from email verification
    const verified = searchParams.get("verified");
    if (verified === "true") {
      notify.success("Email verified successfully! You can now log in.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect to home page after successful login
      router.push("/");
    } catch (err: any) {
      console.error("Login error:", err);
      const message = handleError(err, "Login")
      notify.error("Error", {
        description: message,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-5 bg-gray-50">
      {/* Left Section */}
      <section className="hidden md:flex md:col-span-3 items-center justify-center bg-gray-100">
        <div className="p-10">
          <Image
            src="/assets/logo3d.png"
            alt="SmartSales Logo"
            width={400}
            height={400}
          />
        </div>
      </section>

      {/* Right Section */}
      <section className="flex flex-col md:col-span-2 justify-center px-6 md:px-10 lg:px-20 py-8 md:py-10 bg-white relative">
        <div className="absolute top-8 left-6 md:left-10 lg:left-20">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="flex flex-col items-center md:items-center text-center md:text-center mt-8 md:mt-0">
          <div className="md:hidden mb-6">
            <Image
              src="/assets/logo3d.png"
              alt="SmartSales Logo"
              width={80}
              height={80}
              className="mx-auto"
            />
          </div>

          <h1
            className={`text-2xl md:text-[32px] font-bold text-gray-900 leading-tight ${poppins.className}`}
          >
            Welcome back!
          </h1>

          <h2
            className={`text-2xl md:text-[32px] font-bold mt-1 ${poppins.className}`}
          >
            <span className="text-[#5479EE]">Smart</span>
            <span className="text-[#5BC557]">Sales</span>
          </h2>

          <p className="mt-2 text-sm text-gray-500">Login to your account</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>

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
            {isLoading ? <CircularProgress size={20} /> : "Login"}
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
