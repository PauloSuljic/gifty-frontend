import { useAuth } from "../../providers/AuthProvider";

const LogoutButton = () => {
  const { logout } = useAuth();

  return <button onClick={logout}>Logout</button>;
};

export default LogoutButton;
