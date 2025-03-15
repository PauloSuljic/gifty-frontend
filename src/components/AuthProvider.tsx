import { createContext, useContext, useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signOut, User as FirebaseUser, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

// Define user type from PostgreSQL
export type GiftyUser = {
  id: string;
  email: string;
  username: string;
  bio: string;
  avatarUrl: string;
};

// Context Type
interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      auth.useDeviceLanguage(); // ✅ Fix popup COOP issue
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Sign-In Error", error);
    }
  };  

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, loading, loginWithGoogle, logout }}>
      {loading ? <p className="text-center mt-10">Loading...</p> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
