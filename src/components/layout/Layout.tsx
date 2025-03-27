import { useState } from "react";
import Sidebar from "../Sidebar";
import DashboardHeader from "../DashboardHeader";
import { FiMenu } from "react-icons/fi";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen relative overflow-x-hidden">
      {/* ✅ Sidebar (Always in DOM) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* ✅ Main Area */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* ✅ Mobile Top Row: Hamburger + Logo */}
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

          {/* Spacer to center logo */}
          <div className="w-10" />
        </div>

        {/* ✅ Main Content */}
        <div className="flex-1 flex flex-col lg:pr-6 p-4 pt-4 lg:pt-6">
          <DashboardHeader />
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>

        {/* ✅ Right Sidebar for Widgets */}
        <aside className="w-64 hidden lg:block bg-gray-900 p-4 rounded-lg shadow-lg ml-6">
          <p className="text-gray-400">Coming Soon: Widgets & Insights</p>
        </aside>
      </div>
    </div>
  );
};

export default Layout;
