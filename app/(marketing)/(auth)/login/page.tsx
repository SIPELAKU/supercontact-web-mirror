// app/(marketing)/(auth)/login/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CircularProgress } from "@mui/material";

import AuthShell from "@/components/auth/AuthShell";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

// useSearchParams lives in its own Suspense island so the rest of the page
// stays in the prerendered HTML — without the boundary the whole route
// bails out to client-only rendering (blank first paint).
function VerifiedNotice() {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      notify.success(strings.auth_verified_success);
    }
  }, [searchParams]);
  return null;
}

export default function LoginPage() {
  useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      // Straight to the dashboard — going via "/" only flashes the homepage
      // before HomeClient redirects here anyway.
      router.push("/analytics/dashboard");
    } catch (err: unknown) {
      setError(handleError(err, "Login"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <Suspense fallback={null}>
        <VerifiedNotice />
      </Suspense>

      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
          {strings.auth_login_title}
        </h1>
        <p className="mt-2 text-sm text-gray-500">{strings.auth_login_subtitle}</p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {strings.auth_email_label}
          </label>
          <AppInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={strings.auth_email_placeholder}
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {strings.auth_password_label}
          </label>
          <AppInput
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={strings.auth_password_placeholder}
            required
          />
        </div>

        <div className="flex justify-start">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-brand hover:underline"
          >
            {strings.auth_forgot_password}
          </Link>
        </div>

        <AppButton
          variantStyle="primary"
          color="primary"
          disabled={isLoading}
          fullWidth
          type="submit"
        >
          {isLoading ? <CircularProgress size={20} /> : strings.auth_login_btn}
        </AppButton>
      </form>

      <p className="mt-6 text-sm text-gray-600 text-center">
        {strings.auth_no_account}{" "}
        <Link href="/register" className="text-brand font-medium hover:underline">
          {strings.auth_register_here}
        </Link>
      </p>
    </AuthShell>
  );
}
