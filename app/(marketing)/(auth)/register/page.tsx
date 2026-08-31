// app/(marketing)/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthShell from "@/components/auth/AuthShell";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { RegisterData, registerUser } from "@/lib/api";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { handleError } from "@/lib/utils/errorHandler";
import { trackSignUp } from "@/lib/analytics/events";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const PHONE_REGEX = /^\+?[0-9][0-9\s-]{6,}$/;

export default function RegisterPage() {
  useLanguage();
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
  const router = useRouter();

  // Realtime field states — only flagged once the field has content, so the
  // form doesn't open covered in red.
  const passwordInvalid = password !== "" && !PASSWORD_REGEX.test(password);
  const confirmMismatch = confirmPassword !== "" && confirmPassword !== password;
  const phoneInvalid = phoneNumber !== "" && !PHONE_REGEX.test(phoneNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Submit-time backstop for the realtime checks above.
    if (!PASSWORD_REGEX.test(password)) {
      setError(strings.auth_password_rule_error);
      return;
    }
    if (password !== confirmPassword) {
      setError(strings.auth_password_mismatch);
      return;
    }
    if (!PHONE_REGEX.test(phoneNumber)) {
      setError(strings.auth_phone_invalid);
      return;
    }
    if (!acceptedTerms) {
      setError(strings.auth_terms_error);
      return;
    }

    setIsLoading(true);
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
        trackSignUp();
        // Registration successful - redirect to email verification page with email
        router.push(`/email-verification?email=${encodeURIComponent(email)}`);
      } else {
        // Handle API error response structure: { success: false, error: { message: "..." } }
        setError(response.error?.message || strings.auth_register_failed);
      }
    } catch (err: unknown) {
      setError(handleError(err, "Registration error", strings.auth_register_failed));
    } finally {
      setIsLoading(false);
    }
  };

  // Values stay in English — they're what the API stores; only labels translate.
  const positions = [
    { value: "", label: strings.auth_position_placeholder },
    { value: "Staff", label: strings.auth_position_staff },
    { value: "Business Owner", label: strings.auth_position_owner },
    { value: "C-Level", label: strings.auth_position_clevel },
    { value: "Senior Manager", label: strings.auth_position_senior },
    { value: "Other", label: strings.auth_position_other },
  ];

  return (
    <AuthShell>
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
          {strings.auth_register_title}
        </h1>
        <p className="mt-2 text-sm text-gray-500">{strings.auth_register_subtitle}</p>
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
          <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">
            {strings.auth_fullname_label} <span className="text-red-500">*</span>
          </label>
          <AppInput
            id="fullname"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={strings.auth_fullname_placeholder}
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {strings.auth_work_email_label} <span className="text-red-500">*</span>
          </label>
          <AppInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={strings.auth_work_email_placeholder}
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            {strings.auth_phone_label} <span className="text-red-500">*</span>
          </label>
          <AppInput
            id="phone"
            type="tel"
            inputProps={{ inputMode: "tel" }}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder={strings.auth_phone_placeholder}
            required
            error={phoneInvalid}
            helperText={phoneInvalid ? strings.auth_phone_invalid : undefined}
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            {strings.auth_company_label} <span className="text-red-500">*</span>
          </label>
          <AppInput
            id="company"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={strings.auth_company_placeholder}
            required
          />
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">
            {strings.auth_position_label} <span className="text-red-500">*</span>
          </label>
          <AppSelect
            id="position"
            name="position"
            placeholder={strings.auth_position_placeholder}
            value={position}
            onChange={(e) => setPosition(e.target.value as string)}
            required
            options={positions}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {strings.auth_password_label} <span className="text-red-500">*</span>
          </label>
          <AppInput
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={strings.auth_password_placeholder}
            required
            error={passwordInvalid}
            helperText={
              passwordInvalid ? strings.auth_password_rule_error : strings.auth_password_helper
            }
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
            {strings.auth_confirm_password_label} <span className="text-red-500">*</span>
          </label>
          <AppInput
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={strings.auth_confirm_password_placeholder}
            required
            error={confirmMismatch}
            helperText={confirmMismatch ? strings.auth_password_mismatch : undefined}
          />
        </div>

        <div className="flex justify-start items-center mt-6 text-sm text-gray-600 text-start">
          <AppInput
            type="checkbox"
            id="terms"
            name="terms"
            checked={acceptedTerms}
            onChange={() => setAcceptedTerms((prev) => !prev)}
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
            {strings.auth_terms_agree}{" "}
            <Link
              href="/terms-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand font-medium hover:underline"
            >
              {strings.auth_terms_link}
            </Link>
          </label>
        </div>

        <AppButton type="submit" disabled={isLoading} fullWidth variantStyle="primary">
          {isLoading ? strings.auth_creating_account : strings.auth_create_account}
        </AppButton>
      </form>

      <p className="mt-6 text-sm text-gray-600 text-center">
        {strings.auth_have_account}{" "}
        <Link href="/login" className="text-brand font-medium hover:underline">
          {strings.auth_signin}
        </Link>
      </p>
    </AuthShell>
  );
}
