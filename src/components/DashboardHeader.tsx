import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { GiftyUser } from "../components/PrivateRoute";
import { apiFetch } from "../api";

const DashboardHeader = () => {
  const { firebaseUser } = useAuth();
  const [user, setUser] = useState<GiftyUser | null>(null);

  useEffect(() => {
    if (firebaseUser) {
      const fetchUserData = async () => {
        const token = await firebaseUser.getIdToken();
        const response = await apiFetch(`/api/users/${firebaseUser.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");
        const userData = await response.json();
        setUser(userData);
      };

      fetchUserData();
    }
  }, [firebaseUser]);

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 text-white rounded-lg shadow-lg">
      <div className="flex items-center">
        <img src={user?.avatarUrl} alt="Avatar" className="w-15 h-15 rounded-full mr-3" />
        <div>
          <h2 className="text-xl font-bold">{user?.username || "Guest"}</h2>
          <p className="text-gray-400">{user?.bio || "No bio available"}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
