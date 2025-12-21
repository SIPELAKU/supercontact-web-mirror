import Sidebar from "../header/sidebar";
import Navbar from "../header/navbar";

export default function DashboardLayout({children}: {children: React.ReactNode;}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Sidebar />
      <div className="ml-80 flex min-h-screen flex-col">
        <Navbar /> */}
        <main className="flex-1 p-4">{children}</main>
      {/* </div> */}
    </div>
  );
}
