import { Link } from "react-router-dom";
import { FiGift, FiLogOut, FiHome, FiUser } from "react-icons/fi";
import { useAuth } from "../components/AuthProvider";

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="h-screen w-64 bg-gray-900 text-white shadow-lg p-5 flex flex-col">
      <h2 className="p-3 m-3 text-5xl text-purple-400 font-tually border border-purple rounded-2xl flex items-center justify-center text-center">
        Gifty
      </h2>
      <nav className="mt-10 space-y-4">
        <Link to="/dashboard" className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md">
          <FiHome size={20} /> <span>Home</span>
        </Link>
        <Link to="/shared-with-me" className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md">
          <FiGift size={20} /> <span>Shared With Me</span>
        </Link>
        <Link to="/profile" className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md">
          <FiUser size={20} /> <span>Profile</span>
        </Link>
      </nav>

      <button onClick={logout} className="mt-auto flex items-center space-x-2 p-3 hover:bg-red-600 rounded-md">
        <FiLogOut size={20} /> <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
