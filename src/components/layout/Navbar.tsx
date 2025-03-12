import { useAuth } from "../../providers/AuthProvider";
import Button from "../ui/Button";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="p-4 bg-gray-900 text-white flex justify-between">
      <span className="text-lg font-bold">Gifty</span>
      {user ? <Button onClick={logout} variant="outline">Logout</Button> : null}
    </nav>
  );
};

export default Navbar;
