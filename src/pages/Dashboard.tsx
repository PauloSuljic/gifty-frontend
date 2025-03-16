import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import Wishlist from "../components/Wishlist";

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 p-6">
        <DashboardHeader />
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Your Wishlists</h2>
          <Wishlist />  {/* ✅ Add Wishlist Component Here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
