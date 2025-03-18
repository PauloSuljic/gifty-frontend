import { Link } from "react-router-dom";
import { FiGift, FiLogOut, FiHome } from "react-icons/fi";
import { useAuth } from "../components/AuthProvider";

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="h-screen w-64 bg-gray-900 text-white shadow-lg p-5 flex flex-col">
      <h2 className="text-2xl font-bold text-blue-400">Gifty</h2>
      
      <nav className="mt-10 space-y-4">
        <Link to="/dashboard" className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md">
          <FiHome size={20} /> <span>Home</span>
        </Link>
        <Link to="/shared-with-me" className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md">
          <FiGift size={20} /> <span>Shared With Me</span>
        </Link>
      </nav>

      <button onClick={logout} className="mt-auto flex items-center space-x-2 p-3 hover:bg-red-600 rounded-md">
        <FiLogOut size={20} /> <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
