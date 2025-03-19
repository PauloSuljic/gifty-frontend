import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import Sidebar from "../components/Sidebar";

const avatarOptions = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
  "/avatars/avatar5.png",
  "/avatars/avatar6.png",
  "/avatars/avatar7.png",
  "/avatars/avatar8.png",
  "/avatars/avatar9.png"
];

const Profile = () => {
  const { firebaseUser } = useAuth();
  const [user, setUser] = useState({ username: "", bio: "", avatarUrl: "" });
  const [selectedAvatar, setSelectedAvatar] = useState("");

  useEffect(() => {
    if (!firebaseUser) return;

    const fetchUserData = async () => {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`http://localhost:5140/api/users/${firebaseUser.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch user data");

      const userData = await response.json();
      setUser(userData);
      setSelectedAvatar(userData.avatarUrl);
    };

    fetchUserData();
  }, [firebaseUser]);

  const handleUpdateProfile = async () => {
    const token = await firebaseUser?.getIdToken();

    const response = await fetch(`http://localhost:5140/api/users/${firebaseUser?.uid}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ 
        username: user.username, 
        bio: user.bio, 
        avatarUrl: selectedAvatar 
      })
    });

    if (!response.ok) {
      alert("Failed to update profile");
      return;
    }

    alert("Profile updated successfully!");
  };

  return (
    <div className="flex h-screen">
      {/* ✅ Sidebar */}
      <Sidebar />

      {/* ✅ Main Profile Content */}
      <div className="flex-1 overflow-y-auto p-6 text-white">
      {/* Create New Wishlist */}
        <h2 className="text-3xl font-semibold mb-6">Edit Profile</h2>
        {/* Username */}
        <div className="mb-4">
          <label className="block text-gray-400">Username</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white outline-none"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
          />
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-gray-400">Bio</label>
          <textarea
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white outline-none resize-none"
            value={user.bio}
            onChange={(e) => setUser({ ...user, bio: e.target.value })}
            maxLength={100}
          />
        </div>

        {/* Avatar Selection */}
        <div className="mb-6">
          <label className="block text-gray-400 mb-2">Select Avatar</label>
          <div className="grid grid-cols-5 gap-4">
            {avatarOptions.map((avatar) => (
              <img
                key={avatar}
                src={avatar}
                alt="Avatar"
                className={`w-25 h-25 rounded-full cursor-pointer border-4 ${
                  selectedAvatar === avatar ? "border-blue-500" : "border-transparent"
                }`}
                onClick={() => setSelectedAvatar(avatar)}
              />
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleUpdateProfile}
          className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg transition shadow-lg w-full"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;
