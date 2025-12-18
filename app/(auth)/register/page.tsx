// app/(auth)/register/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [position, setPosition] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const success = await login(email, password);
            if (!success) {
                setError("Invalid email or password. Please try again.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }

        if (acceptedTerms) {
            console.log('Syarat dan ketentuan diterima. Mengirim data...');
            alert('Pendaftaran berhasil! Syarat & Ketentuan telah disetujui.');
        } else {
            alert('Anda harus menyetujui Syarat & Ketentuan untuk melanjutkan.');
        }
        setIsSubmitting(false);
    };

    const toggleTerms = () => {
        setAcceptedTerms(!acceptedTerms);
    };

    const positions = [ 
        { value: '', label: 'Select an position' },
        { value: 'staff', label: 'Staff' },
        { value: 'bo', label: 'Business Owner' },
        { value: 'cl', label: 'C-Level (CEO/CFO/COO,etc)' },
        { value: 'sm', label: 'Senior Manager (Head/VP,etc)' },
        { value: 'etc', label: 'Lainnya' },
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
            <section className="flex flex-col md:col-span-1 justify-center px-8 md:px-20 py-10 bg-white">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight text-center">
                    Make New Account
                </h1>

                <h2 className="text-3xl font-bold mt-2 text-center">
                    <span className="text-blue-600">Super</span>
                    <span className="text-green-600">Contact</span>
                </h2>

                <p className="mt-2 text-sm text-gray-500 text-center">Start managing your CRM in minutes.</p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Work Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter your work email"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <input
                            type="company name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter your company"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="position" style={{ display: 'block', marginBottom: '5px' }}>
                            Position
                        </label>
                        <select
                            id="position"
                            name="position"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required 
                            style={{ width: '100%', padding: '8px' }}
                        >
                            {positions.map((option) => (
                                <option className="block text-sm font-medium text-gray-600" key={option.value} value={option.value} disabled={option.value === ''}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter your password"
                            required
                        />
                        <label className="mt-6 text-sm text-gray-600 text-start">
                            (Minimal 8 karakter, 1 angka, 1 huruf besar)
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter your confirm password"
                            required
                        />
                    </div>

                    <div className="flex justify-start mt-6 text-sm text-gray-600 text-start">
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
                            I agree with{' '}
                            <Link href="/terms-conditions" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">
                                Terms & Conditions
                            </Link>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Link href="/email-verification" className="">
                        </Link>
                        {isLoading ? "Create Account..." : "Create Account"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-gray-600 text-start">
                    Sudah memiliki akun? {" "}
                    <Link href="/login" className="text-blue-600 font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </section>
        </main>
    );
}
