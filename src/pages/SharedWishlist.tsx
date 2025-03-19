import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import WishlistItem from "../components/WishlistItem";
import { useAuth } from "../components/AuthProvider";
import Card from "../components/ui/Card";

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
};

const SharedWishlist = () => {
  const { shareCode } = useParams<{ shareCode: string }>(); 
  const [wishlist, setWishlist] = useState<WishlistType | null>(null);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();

  useEffect(() => {
    const fetchSharedWishlist = async () => {
      setLoading(true);
      const token = await firebaseUser?.getIdToken(); // ✅ Get token if logged in
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const response = await fetch(`http://localhost:5140/api/shared-links/${shareCode}`, {
          method: "GET",
          headers: headers
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

  // ✅ Function to toggle reservation (Only logged-in users can reserve/unreserve)
  const toggleReservation = async (itemId: string) => {
    const token = await firebaseUser?.getIdToken();
    if (!token) return alert("You need to be logged in to reserve items.");

    const response = await fetch(`http://localhost:5140/api/wishlist-items/${itemId}/reserve`, {
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
                item.id === itemId ? { ...item, isReserved: updatedItem.isReserved, reservedBy: updatedItem.reservedBy } : item
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
      <Card className="p-6">
        <h2 className="text-3xl font-semibold">{wishlist.name}</h2>
        <p className="text-gray-400 text-sm mt-2">
        Shared by: {wishlist.ownerId === firebaseUser?.uid ? "You" : wishlist.ownerName || "Unknown"}
        </p>
      </Card>

      <div className="mt-6 space-y-3">
        {wishlist.items.length > 0 ? (
          wishlist.items.map((item) => (
            <WishlistItem
              key={item.id}
              id={item.id}
              name={item.name}
              link={item.link}
              isReserved={item.isReserved}
              reservedBy={item.reservedBy || ""}
              wishlistOwner={wishlist.ownerId}
              currentUser={firebaseUser?.uid || ""} 
              onToggleReserve={() => toggleReservation(item.id)}
            />
          ))
        ) : (
          <p className="text-gray-400 text-center">No items in this wishlist.</p>
        )}
      </div>
    </div>
  );
};

export default SharedWishlist;
