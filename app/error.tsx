'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full px-6 py-8 text-center">
                {/* Error Icon */}
                <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-red-100 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                {/* Error Message */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Terjadi Kesalahan
                </h1>
                <p className="text-gray-600 mb-6">
                    Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi tim support jika masalah berlanjut.
                </p>

                {/* Error Details (Development only) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                        <p className="text-sm font-mono text-red-600 break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-gray-500 mt-2">
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Coba Lagi
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        </div>
    );
}
