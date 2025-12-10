import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col ml-80">
        <Navbar />
        <main className="flex-1 ">{children}</main>
      </div>
    </div>
  );
}