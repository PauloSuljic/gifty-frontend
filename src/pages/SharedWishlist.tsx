import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import Card from "../components/ui/Card";
import { apiFetch } from "../api";

// ✅ Define TypeScript types
type WishlistItemType = {
  id: string;
  name: string;
  link: string;
  isReserved: boolean;
  reservedBy?: string | null;
};

type WishlistType = {
  id: string;
  name: string;
  items: WishlistItemType[];
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl: string;
};

const SharedWishlist = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [wishlist, setWishlist] = useState<WishlistType | null>(null);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();

  useEffect(() => {
    const fetchSharedWishlist = async () => {
      setLoading(true);
      const token = await firebaseUser?.getIdToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const response = await apiFetch(`/api/shared-links/${shareCode}`, {
          method: "GET",
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          setWishlist(data);
        } else {
          console.error("Failed to fetch shared wishlist.");
          setWishlist(null);
        }
      } catch (error) {
        console.error("Error fetching shared wishlist:", error);
        setWishlist(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedWishlist();
  }, [shareCode, firebaseUser]);

  const toggleReservation = async (itemId: string) => {
    const token = await firebaseUser?.getIdToken();
    if (!token) return alert("You need to be logged in to reserve items.");

    const response = await apiFetch(`/api/wishlist-items/${itemId}/reserve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const updatedItem = await response.json();
      setWishlist((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      isReserved: updatedItem.isReserved,
                      reservedBy: updatedItem.reservedBy,
                    }
                  : item
              ),
            }
          : null
      );
    }
  };

  if (loading) return <p className="text-white text-center">Loading...</p>;
  if (!wishlist) return <p className="text-gray-300 text-center mt-6">Invalid or expired shared link.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      {/* 🎁 Wishlist Header */}
      <Card className="p-6 bg-gray-800 flex items-center gap-4">
        <img
          src={wishlist.ownerAvatarUrl || "/avatars/avatar1.png"}
          alt="Sharer Avatar"
          className="w-14 h-14 rounded-full border border-white/20"
        />
        <div>
          <h2 className="text-3xl font-bold text-purple-400">{wishlist.name}</h2>
          <p className="text-gray-300 mt-1">
            Shared by:{" "}
            <span className="text-white font-medium">
              {wishlist.ownerId === firebaseUser?.uid ? "You" : wishlist.ownerName || "Unknown"}
            </span>
          </p>
        </div>
      </Card>

      {/* 🔐 Login/Register suggestion */}
      {!firebaseUser && (
        <div className="bg-yellow-900/40 border border-yellow-600 rounded-lg mt-6 p-4 text-center">
          <p className="text-yellow-300 text-sm mb-3">
            Want to reserve gifts or track your own wishlists?
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/login"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* 📦 Wishlist Items */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {wishlist.items.length > 0 ? (
          wishlist.items.map((item) => {
            const isReserver = item.reservedBy === firebaseUser?.uid;
            const isGuest = !firebaseUser;

            return (
              <Card key={item.id} className="p-4 bg-gray-800 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-sm underline"
                  >
                    View Item ↗
                  </a>
                </div>

                <div className="flex justify-between items-center">
                  {item.isReserved ? (
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        isReserver ? "bg-green-700" : "bg-red-700"
                      }`}
                    >
                      {isReserver ? "You reserved this" : "Reserved"}
                    </span>
                  ) : isGuest ? (
                    <span className="text-sm text-red-400 italic">Login to reserve</span>
                  ) : (
                    <button
                      onClick={() => toggleReservation(item.id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
                    >
                      Reserve
                    </button>
                  )}

                  {isReserver && (
                    <button
                      onClick={() => toggleReservation(item.id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
                    >
                      Unreserve
                    </button>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <p className="text-gray-400 text-center">No items in this wishlist.</p>
        )}
      </div>
    </div>
  );
};

export default SharedWishlist;
