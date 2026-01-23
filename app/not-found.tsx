import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full px-6 py-8 text-center">
                {/* 404 Illustration */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-gray-200">404</h1>
                </div>

                {/* Error Message */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Halaman Tidak Ditemukan
                </h2>
                <p className="text-gray-600 mb-8">
                    Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-block"
                    >
                        Kembali ke Beranda
                    </Link>
                    <Link
                        href="/analytics/dashboard"
                        className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors inline-block"
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
