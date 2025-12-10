import Image from "next/image";

export default function NewPassword() {
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

        <form className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Password Baru</label>
            <input
              type="password"
              className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder=""
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
            <input
              type="password"
              className="mt-1 w-full border bg-yellow-50 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder=""
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition"
          >
            Simpan password baru & login
          </button>
        </form>

        <div className="w-full border-b border-gray-300 text-black py-3 flex items-center justify-center gap-2 hover:bg-gray-50">
        </div>
      </section>
    </main>
  );
}
