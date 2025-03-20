import { createContext, useContext, useEffect, useState } from "react";
import { 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  updateProfile,
  User as FirebaseUser 
} from "firebase/auth";
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
  register: (email: string, password: string, username: string) => Promise<void>;
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
      auth.useDeviceLanguage();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Sign-In Error", error);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      // ✅ Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Set Firebase display name
      await updateProfile(user, { displayName: username });

      // ✅ Get Firebase user token
      const token = await user.getIdToken();

      // ✅ Send user data to backend
      const response = await fetch("http://localhost:5140/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: user.uid, 
          email: user.email,
          username: username,
          bio: "",
          avatarUrl: ""
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register user in backend");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Failed to register. Please try again.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, loading, loginWithGoogle, register, logout }}>
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
