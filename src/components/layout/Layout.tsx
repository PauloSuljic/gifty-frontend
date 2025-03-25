import { useState } from "react";
import Sidebar from "../Sidebar";
import DashboardHeader from "../DashboardHeader";
import { FiMenu } from "react-icons/fi";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 👈 Sidebar closed by default on mobile

  return (
    <div className="flex h-screen relative">
      {/* ✅ Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
  
      {/* ✅ Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* ✅ Mobile Top Bar: Hamburger + Centered Logo */}
        <div className="lg:hidden flex items-center justify-between px-4 pt-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-white p-2 bg-gray-800 rounded-lg shadow-lg"
          >
            <FiMenu size={24} />
          </button>
          <h2 className="text-5xl text-purple-400 font-tually border border-purple rounded-2xl px-6 py-2 text-center">
            Gifty
          </h2>
  
          {/* Spacer div to keep logo centered */}
          <div className="w-10" />
        </div>
  
        {/* ✅ Main Layout Content */}
        <div className="flex flex-1 p-6 lg:pt-6">
          <div className="flex-1 flex flex-col pr-6">
            <DashboardHeader />
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </div>
  
          <aside className="w-64 hidden lg:block bg-gray-900 p-4 rounded-lg shadow-lg ml-6">
            <p className="text-gray-400">Coming Soon: Widgets & Insights</p>
          </aside>
        </div>
      </div>
    </div>
  );  
};

export default Layout;
