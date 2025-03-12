import { createContext, useContext, useState, useEffect } from "react";
import { 
  loginUser, 
  logoutUser, 
  getAuthToken, 
  fetchUserDataWithToken, 
  registerUser
} from "../api/authApi";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const navigate = useNavigate();

  // Fetch user data if there's a stored token
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchUserDataWithToken()
        .then((userData) => setUser(userData))
        .catch(console.error);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await loginUser(email, password);
      if (userData) {
        setUser(userData);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await registerUser(name, email, password); // ✅ Use correct function
      setUser({ name: response.username, email: response.email }); // ✅ Match property names
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
