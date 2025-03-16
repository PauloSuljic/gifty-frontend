import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import WishlistItem from "../components/WishlistItem";
import { useAuth } from "../components/AuthProvider";

// ✅ Define type for Wishlist & Items
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
  userId: string;
};

const SharedWishlist = () => {
  const { shareCode } = useParams<{ shareCode: string }>(); 
  const [wishlist, setWishlist] = useState<WishlistType | null>(null); 
  const { firebaseUser } = useAuth();

  useEffect(() => {
    fetch(`http://localhost:5140/api/shared-links/${shareCode}`)
      .then((res) => res.json())
      .then((data) => setWishlist(data))
      .catch(() => setWishlist(null));
  }, [shareCode]);

  // ✅ Function to toggle reservation (Guests can only reserve/unreserve items)
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

  if (!wishlist) return <p className="text-white text-center">Loading or invalid link...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h2 className="text-3xl font-semibold">{wishlist.name}</h2>
      <div className="mt-4 space-y-3">
        {wishlist.items.map((item) => (
          <WishlistItem
            key={item.id}
            id={item.id}
            name={item.name}
            link={item.link}
            isReserved={item.isReserved}
            reservedBy={item.reservedBy || ""}
            wishlistOwner={wishlist.userId}
            currentUser={firebaseUser?.uid || ""} 
            onToggleReserve={() => toggleReservation(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default SharedWishlist;
