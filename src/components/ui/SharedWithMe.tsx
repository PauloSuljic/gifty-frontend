import { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import Card from "../../components/ui/Card";
import WishlistItem from "../../components/WishlistItem";
import Sidebar from "../Sidebar";

type SharedWishlistItem = {
  id: string;
  name: string;
  link?: string;
  isReserved: boolean;
  reservedBy?: string | null;
};

type SharedWishlist = {
  id: string;
  name: string;
  items: SharedWishlistItem[];
};

type GroupedWishlists = {
  ownerId: string;
  ownerName: string;
  wishlists: SharedWishlist[];
};

const SharedWithMe = () => {
  const { firebaseUser } = useAuth();
  const [sharedWishlists, setSharedWishlists] = useState<GroupedWishlists[]>([]);

  useEffect(() => {
    if (!firebaseUser) return;

    const fetchSharedWishlists = async () => {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("http://localhost:5140/api/shared-links/shared-with-me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSharedWishlists(data);
      }
    };

    fetchSharedWishlists();
  }, [firebaseUser]);

  // ✅ Function to reserve/unreserve an item (Limit 1 reservation per wishlist)
  const toggleReservation = async (wishlistId: string, itemId: string) => {
    const token = await firebaseUser?.getIdToken();
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5140/api/wishlist-items/${itemId}/reserve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // ✅ If the backend returns "You can only reserve 1 item per wishlist", show an alert
        if (errorData.error === "You can only reserve 1 item per wishlist.") {
          alert("You can only reserve 1 item per wishlist.");
        }
        return; // ✅ Stop execution if an error occurs
      }

      const updatedItem = await response.json();

      // ✅ Update the state instantly after reservation/unreservation
      setSharedWishlists((prev) =>
        prev.map((group) => ({
          ...group,
          wishlists: group.wishlists.map((w) =>
            w.id === wishlistId
              ? {
                  ...w,
                  items: w.items.map((i) =>
                    i.id === itemId
                      ? { ...i, isReserved: updatedItem.isReserved, reservedBy: updatedItem.reservedBy }
                      : i
                  ),
                }
              : w
          ),
        }))
      );
    } catch (error) {
      console.error("Error toggling reservation:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* ✅ Sidebar */}
      <Sidebar />

      {/* ✅ Main Content */}
      <div className="flex-1 overflow-y-auto p-6 text-white">
        <h2 className="text-3xl font-semibold">Wishlists Shared With Me</h2>
        {sharedWishlists.length === 0 ? (
          <p className="text-gray-300 text-center mt-6">No shared wishlists yet.</p>
        ) : (
          sharedWishlists.map((group) => (
            <div key={group.ownerId} className="mt-6">
              <h3 className="text-2xl font-semibold mb-4">From: {group.ownerName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.wishlists.map((wishlist) => (
                  <Card key={`wishlist-${wishlist.id}`}>
                    <h4 className="text-xl font-semibold">{wishlist.name}</h4>
                    <div className="mt-4 space-y-3">
                      {wishlist.items.map((item) => (
                        <WishlistItem
                          key={`wishlist-item-${item.id}`}
                          id={item.id}
                          name={item.name}
                          link={item.link || ""}
                          isReserved={item.isReserved}
                          reservedBy={item.reservedBy}
                          wishlistOwner={group.ownerId}
                          currentUser={firebaseUser?.uid || ""}
                          onToggleReserve={() => toggleReservation(wishlist.id, item.id)}
                        />
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SharedWithMe;
