export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-8">Sales Mgmt</h2>
      <nav className="space-y-4">
        <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800">Dashboard</a>
        <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800">Leads</a>
        <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800">Contacts</a>
        <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800">Settings</a>
      </nav>
    </aside>
  );
}