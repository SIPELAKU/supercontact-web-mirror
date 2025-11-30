export default function Navbar() {
  return (
    <nav className="bg-white shadow h-16 flex items-center px-8">
      <h1 className="text-xl font-semibold text-gray-800">Lead Management</h1>
      <div className="ml-auto flex items-center gap-4">
        <button className="text-gray-600 hover:text-gray-900">Profile</button>
      </div>
    </nav>
  );
}