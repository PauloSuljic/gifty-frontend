import Sidebar from "../Sidebar";
import DashboardHeader from "../DashboardHeader";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      {/* ✅ Sidebar */}
      <Sidebar />
      {/* ✅ Main Content Area */}
        <div className="flex flex-1 p-6">
            {/* ✅ Content Section (Occupies Most of the Space) */}
            <div className="flex-1 flex flex-col pr-6"> {/* ✅ Added padding-right instead of hardcoded margin */}
                {/* ✅ Dashboard Header */}
                <DashboardHeader />

                {/* ✅ Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">{children}</div>
            </div>

            {/* ✅ Future Widgets Area (Right-Side) */}
            <aside className="w-64 hidden lg:block bg-gray-900 p-4 rounded-lg shadow-lg ml-6">
                <p className="text-gray-400">Coming Soon: Widgets & Insights</p>
            </aside>
        </div>
    </div>
  );
};

export default Layout;
