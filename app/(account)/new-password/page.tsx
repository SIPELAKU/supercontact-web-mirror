"use client";

import { resetPassword } from "@/lib/api";
import { logger } from "@/lib/utils/logger";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function NewPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirm_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get reset token from localStorage
    const tokenFromStorage = localStorage.getItem("reset_token");

    if (tokenFromStorage) {
      setResetToken(tokenFromStorage);
      logger.info("Reset token found in localStorage");
    } else {
      setError(
        "Token reset tidak ditemukan. Silakan ulangi proses reset password.",
      );
      logger.error("No reset token found");
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.password) {
      setError("Password baru harus diisi");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return false;
    }
    if (!formData.confirm_password) {
      setError("Konfirmasi password harus diisi");
      return false;
    }
    if (formData.password !== formData.confirm_password) {
      setError("Password dan konfirmasi password tidak sama");
      return false;
    }
    if (!resetToken) {
      setError(
        "Token reset tidak valid. Silakan ulangi proses reset password.",
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      logger.info("Attempting to reset password with token");

      const result = await resetPassword(
        {
          password: formData.password,
          confirm_password: formData.confirm_password,
        },
        resetToken!,
      );

      if (result.success) {
        setSuccess(
          "Success change password, you will be redirected to login page...",
        );
        logger.info("Password reset successful");

        // Clear the reset token from localStorage
        localStorage.removeItem("reset_token");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(result.message || "Failed to change password");
        logger.error("Password reset failed", { message: result.message });
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to change password";
      setError(errorMessage);
      logger.error("Password reset error", { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={`min-h-screen flex items-center justify-center bg-[#F5F6FA] px-4 ${poppins.className}`}>
      <div className="bg-white w-full max-w-[450px] rounded-[20px] shadow-lg flex flex-col p-8 md:p-10 my-8">
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/sc-logo-primary.svg"
            alt="SmartSales Logo"
            width={180}
            height={45}
            className="object-contain"
            priority
          />
        </div>
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-[32px] font-bold text-gray-900 leading-tight">
              Reset Your Password
            </h1>
            <p className="text-[#6B7280] text-sm leading-relaxed mt-2">
              Create a new strong password for your account.
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm text-center">
                {success}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password <span className="text-red-500">*</span>
              </label>
              <AppInput
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter new password"
                disabled={isLoading || !resetToken}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <AppInput
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                disabled={isLoading || !resetToken}
                required
              />
            </div>

            <AppButton
              type="submit"
              variantStyle="primary"
              fullWidth
              disabled={isLoading || !resetToken}
            >
              {isLoading ? "Saving..." : "Save new password & login"}
            </AppButton>
            <div className="pt-4 border-t border-gray-100"></div>
          </form>
        </section>
      </div>
    </main>
  );
}
