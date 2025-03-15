import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { GiftyUser } from "../components/PrivateRoute";

const DashboardHeader = () => {
  const { firebaseUser } = useAuth();
  const [user, setUser] = useState<GiftyUser | null>(null);

  useEffect(() => {
    if (firebaseUser) {
      const fetchUserData = async () => {
        const token = await firebaseUser.getIdToken();
        const response = await fetch(`http://localhost:5140/api/users/${firebaseUser.uid}`, {
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
        <img src={user?.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full mr-3" />
        <div>
          <h2 className="text-xl font-bold">{user?.username || "Guest"}</h2>
          <p className="text-gray-400">{user?.bio || "No bio available"}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
