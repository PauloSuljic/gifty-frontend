import { useState } from "react";
import Sidebar from "../Sidebar";
import DashboardHeader from "../DashboardHeader";
import { FiMenu } from "react-icons/fi";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 👈 Sidebar closed by default on mobile

  return (
    <div className="flex h-screen relative">
      {/* ✅ Mobile Hamburger Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="absolute top-4 left-4 z-50 text-white p-2 bg-gray-800 rounded-lg shadow-lg lg:hidden"
      >
        <FiMenu size={24} />
      </button>

      {/* ✅ Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* ✅ Main Content Area */}
      <div className="flex flex-1 p-6">
        <div className="flex-1 flex flex-col pr-6">
          <DashboardHeader />
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>

        <aside className="w-64 hidden lg:block bg-gray-900 p-4 rounded-lg shadow-lg ml-6">
          <p className="text-gray-400">Coming Soon: Widgets & Insights</p>
        </aside>
      </div>
    </div>
  );
};

export default Layout;
