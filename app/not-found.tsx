import Link from 'next/link';
import { AppButton } from '@/components/ui/app-button';

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
                    Page Not Found
                </h2>
                <p className="text-gray-600 mb-8">
                    Sorry, the page you are looking for does not exist or has been moved.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/">
                        <AppButton variantStyle="primary" color="primary">
                            Back to Home
                        </AppButton>
                    </Link>
                    <Link href="/analytics/dashboard">
                        <AppButton variantStyle="outline" color="primary">
                            Dashboard
                        </AppButton>
                    </Link>
                </div>
            </div>
        </div>
    );
}
