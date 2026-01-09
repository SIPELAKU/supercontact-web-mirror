'use client';

import { resetPassword } from "@/lib/api";
import { logger } from "@/lib/utils/logger";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirm_password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get reset token from localStorage
    const tokenFromStorage = localStorage.getItem('reset_token');
    
    if (tokenFromStorage) {
      setResetToken(tokenFromStorage);
      logger.info("Reset token found in localStorage");
    } else {
      setError('Token reset tidak ditemukan. Silakan ulangi proses reset password.');
      logger.error("No reset token found");
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.password) {
      setError('Password baru harus diisi');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return false;
    }
    if (!formData.confirm_password) {
      setError('Konfirmasi password harus diisi');
      return false;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Password dan konfirmasi password tidak sama');
      return false;
    }
    if (!resetToken) {
      setError('Token reset tidak valid. Silakan ulangi proses reset password.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      logger.info("Attempting to reset password with token");
      
      const result = await resetPassword({
        password: formData.password,
        confirm_password: formData.confirm_password
      }, resetToken!);

      if (result.success) {
        setSuccess('Password berhasil diubah! Anda akan diarahkan ke halaman login...');
        logger.info("Password reset successful");
        
        // Clear the reset token from localStorage
        localStorage.removeItem('reset_token');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(result.message || 'Gagal mengubah password');
        logger.error("Password reset failed", { message: result.message });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Terjadi kesalahan saat mengubah password';
      setError(errorMessage);
      logger.error("Password reset error", { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center w-full md:w-1/3 bg-gray-50">
        <div className="pt-6">
            <Image
            src="/assets/logo-supercontact.png"
            alt="Supercontact Logo"
            width={200}
            height={200}
            />
        </div>
      <section className="flex flex-col h-full justify-center px-8 md:px-20 py-10 bg-white">
        <h1 className="text-3xl font-bold text-gray-900 leading-tight text-center">
          Atur ulang Password Anda
        </h1>
        
        <span className="text-md text-gray-500 mt-2 text-center">Buat password baru yang kuat untuk akun Anda.</span>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Password Baru</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Masukkan password baru"
              disabled={isLoading || !resetToken}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Konfirmasi password baru"
              disabled={isLoading || !resetToken}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !resetToken}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan password baru & login'}
          </button>
        </form>

        <div className="w-full border-b border-gray-300 text-black py-3 flex items-center justify-center gap-2 hover:bg-gray-50">
        </div>
      </section>
    </main>
  );
}