// app/(auth)/register/page.tsx
"use client";

import { RegisterData, registerUser } from "@/lib/api";
import { handleError } from "@/lib/utils/errorHandler";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { MenuItem } from "@mui/material";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function RegisterPage() {
  // ... (rest of the component state and logic remains the same)
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [position, setPosition] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    // ... (handleSubmit logic remains the same)
    e.preventDefault();
    setIsLoading(true);
    setIsSubmitting(true);
    setError("");

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    // Check if terms are accepted
    if (!acceptedTerms) {
      setError("You must accept the Terms & Conditions to continue");
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    // Validate password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters with 1 uppercase letter, 1 lowercase letter, and 1 number",
      );
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    try {
      const registerData: RegisterData = {
        fullname: name,
        email: email,
        phone: phoneNumber,
        company: companyName,
        position: position,
        password: password,
        confirm_password: confirmPassword,
      };

      const response = await registerUser(registerData);

      if (response.success) {
        // Registration successful - redirect to email verification page with email
        router.push(`/email-verification?email=${encodeURIComponent(email)}`);
      } else {
        // Handle API error response structure: { success: false, error: { message: "..." } }
        const errorMessage =
          response.error?.message || "Registration failed. Please try again.";
        setError(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = handleError(
        err,
        "Registration error",
        "Registration failed. Please try again.",
      );
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const toggleTerms = () => {
    setAcceptedTerms(!acceptedTerms);
  };

  const positions = [
    { value: "", label: "Select a position" },
    { value: "Staff", label: "Staff" },
    { value: "Business Owner", label: "Business Owner" },
    { value: "C-Level", label: "C-Level (CEO/CFO/COO, etc)" },
    { value: "Senior Manager", label: "Senior Manager (Head/VP, etc)" },
    { value: "Other", label: "Other" },
  ];

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
      <section className="flex flex-col md:col-span-1 justify-center px-8 md:px-15 py-10 bg-white">
        <h1
          className={`text-3xl font-bold text-gray-900 leading-tight text-center ${poppins.className}`}
        >
          Make New Account
        </h1>

        <h2
          className={`text-3xl font-bold mt-0 text-center ${poppins.className}`}
        >
          <span className="text-blue-600">Super</span>
          <span className="text-green-600">Contact</span>
        </h2>

        <p className="mt-2 text-sm text-gray-500 text-center">
          Start managing your CRM in minutes.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <AppInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Work Email <span className="text-red-500">*</span>
            </label>
            <AppInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <AppInput
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <AppInput
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter your company name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Position <span className="text-red-500">*</span>
            </label>
            <AppInput
              select
              id="position"
              name="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            >
              {positions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  disabled={option.value === ""}
                >
                  {option.label}
                </MenuItem>
              ))}
            </AppInput>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <AppInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              helperText="(Minimal 8 karakter, 1 angka, 1 huruf besar)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <AppInput
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Enter your confirm password"
              required
            />
          </div>

          {/* <div className="flex justify-start mt-6 text-sm text-gray-600 text-start">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={acceptedTerms}
              onChange={toggleTerms}
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
              I agree with{" "}
              <Link
                href="/terms-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:underline"
              >
                Terms & Conditions
              </Link>
            </label>
          </div> */}

          <AppButton
            type="submit"
            disabled={isLoading || isSubmitting}
            fullWidth
            variantStyle="primary"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </AppButton>
        </form>

        <p className="mt-6 text-sm text-gray-600 text-start">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
