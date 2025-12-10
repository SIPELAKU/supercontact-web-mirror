// app/(auth)/login/page.tsx
import Link from "next/link";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
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
          Selamat Datang <br /> Kembali!
        </h1>
        
        <h2 className="text-3xl font-bold mt-2 text-center">
          <span className="text-blue-600">Super</span>
          <span className="text-green-600">Contact</span>
        </h2>

        <p className="mt-2 text-sm text-gray-500 text-center">Login ke akun Anda</p>

        <form className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder=""
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder=""
            />
          </div>

          <div className="flex justify-start">
            <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
              Lupa Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition"
          >
            Masuk
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-gray-300 flex-1" />
          <span className="text-sm text-gray-500">Atau masuk menggunakan</span>
          <div className="h-px bg-gray-300 flex-1" />
        </div>

        <button className="w-full border text-primary cursor-pointer rounded-md py-2 flex items-center justify-center gap-2 hover:bg-gray-50 transition">
          <FcGoogle/>
          Continue with Google
        </button>

        <p className="mt-6 text-sm text-gray-600 text-start">
          Belum memiliki akun? {" "}
          <Link href="/register" className="text-blue-600 font-medium hover:underline">
            Registrasi disini
          </Link>
        </p>
      </section>
    </main>
  );
}
