import { Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../api";

// Define our database user type
export type GiftyUser = {
  id: string;
  username: string;
  bio: string;
  email: string;
  avatarUrl: string;
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { firebaseUser, loading } = useAuth();
  const [user, setUser] = useState<GiftyUser | null>(null);
  const [fetching, setFetching] = useState(true);
  const hasFetched = useRef(false); // ✅ Prevents multiple calls

  useEffect(() => {
    const fetchUserData = async () => {
      if (!firebaseUser || hasFetched.current) return;
      hasFetched.current = true;

      setFetching(true);
    
      try {
        const token = await firebaseUser.getIdToken();
        let response = await apiFetch(`/api/users/${firebaseUser.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        // ✅ If user does NOT exist (404 error), create user in database
        if (response.status === 404) {
          console.log("User not found, creating new user...");
          await apiFetch("/api/users", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: firebaseUser.uid,
              username: firebaseUser.displayName || "New User",
              email: firebaseUser.email,
              avatarUrl: "",
              bio: "",
            }),
          });
    
          // Fetch again after creating user
          response = await apiFetch(`/api/users/${firebaseUser.uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
    
        if (!response.ok) throw new Error("Failed to fetch user data");
    
        const userData = await response.json();
        setUser({
          id: userData.id,
          username: userData.username || firebaseUser.displayName || "Unknown",
          bio: userData.bio || "",
          email: userData.email,
          avatarUrl: ""
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchUserData();
  }, [firebaseUser]);

  if (loading || fetching) return <p className="text-center mt-10">Loading...</p>;

  return firebaseUser && user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
