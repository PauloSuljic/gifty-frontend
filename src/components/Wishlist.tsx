import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import Card from "./ui/Card";
import WishlistItem from "./WishlistItem";
import { FiTrash2 } from "react-icons/fi";

// Define TypeScript types
type WishlistType = {
  id: string;
  userId: string;
  name: string;
  isPublic: boolean;
};

type WishlistItemType = {
  id: string;
  name: string;
  link: string;
  wishlistId: string;
  isReserved: boolean;
  reservedBy: string;
};

const Wishlist = () => {
  const { firebaseUser } = useAuth();
  const [wishlists, setWishlists] = useState<WishlistType[]>([]);
  const [wishlistItems, setWishlistItems] = useState<{ [key: string]: WishlistItemType[] }>({});
  const [newWishlist, setNewWishlist] = useState<string>(""); // Wishlist name input
  const [newItem, setNewItem] = useState<{ [key: string]: { name: string; link: string  } }>({});

  useEffect(() => {
    if (firebaseUser) fetchWishlists();
  }, [firebaseUser]);

  const fetchWishlists = async () => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const response = await fetch("http://localhost:5140/api/wishlists", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      setWishlists(data);
      data.forEach((wishlist: WishlistType) => fetchWishlistItems(wishlist.id));
    }
  };

  const createWishlist = async () => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const response = await fetch("http://localhost:5140/api/wishlists", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userId: firebaseUser.uid, 
        name: newWishlist, 
        isPublic: false 
      }),
    });

    if (response.ok) {
      fetchWishlists();
      setNewWishlist("");
    }
  };

  const deleteWishlist = async (wishlistId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this wishlist?");
    if (!confirmDelete) return; // ✅ Prevent accidental deletions
  
    const token = await firebaseUser?.getIdToken();
    
    const response = await fetch(`http://localhost:5140/api/wishlists/${wishlistId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (response.ok) {
      setWishlists((prev) => prev.filter((wishlist) => wishlist.id !== wishlistId)); // ✅ Remove from UI immediately
      setWishlistItems((prev) => {
        const updatedItems = { ...prev };
        delete updatedItems[wishlistId]; // ✅ Remove related items from state
        return updatedItems;
      });
    } else {
      console.error("Error deleting wishlist:", await response.json());
    }
  };

  const fetchWishlistItems = async (wishlistId: string) => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const response = await fetch(`http://localhost:5140/api/wishlist-items/${wishlistId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      setWishlistItems((prev) => ({ ...prev, [wishlistId]: data }));
    }
  };

  const addWishlistItem = async (wishlistId: string) => {
    if (!newItem[wishlistId]?.name.trim() || !newItem[wishlistId]?.link.trim()) {
        alert("Please enter both item name and link.");
        return;
    };

    const token = await firebaseUser?.getIdToken();

    const response = await fetch("http://localhost:5140/api/wishlist-items", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newItem[wishlistId].name,
        link: newItem[wishlistId].link,
        wishlistId,
        reservedBy: null
      }),
    });
    
    if (response.ok) {
      const createdItem = await response.json();
      setWishlistItems((prev) => ({
        ...prev,
        [wishlistId]: [...(prev[wishlistId] || []), createdItem],
      }));
      setNewItem((prev) => ({ ...prev, [wishlistId]: { name: "", link: ""} })); // ✅ Reset item input
    } else {
        console.error("Error adding item:", await response.json());
    }
  };

  const deleteWishlistItem = async (wishlistId: string, itemId: string) => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const response = await fetch(`http://localhost:5140/api/wishlist-items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });

    if (response.ok) {
      setWishlistItems((prev) => ({
        ...prev,
        [wishlistId]: prev[wishlistId].filter((item) => item.id !== itemId),
      }));
    }
  };

  const toggleReservation = async (wishlistId: string, itemId: string) => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const response = await fetch(`http://localhost:5140/api/wishlist-items/${itemId}/reserve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });

    if (response.ok) {
      const updatedItem = await response.json();
      setWishlistItems((prev) => ({
        ...prev,
        [wishlistId]: prev[wishlistId].map((item) =>
          item.id === itemId ? { ...item, isReserved: updatedItem.isReserved } : item
        ),
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      {/* Create New Wishlist */}
      <div className="flex items-center space-x-4 mb-6">
        <input
          value={newWishlist}
          onChange={(e) => setNewWishlist(e.target.value)}
          placeholder="New Wishlist Name"
          className="flex-1 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-md text-white placeholder-gray-300 outline-none"
        />
        <button
          onClick={createWishlist}
          className="px-6 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 transition shadow-lg"
          disabled={!newWishlist.trim()}
        >
          Create
        </button>
      </div>
  
      {/* Display Wishlists and Items */}
      {wishlists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wishlists.map((wishlist) => (
            <Card key={wishlist.id} className="relative">
              
              {/* Wishlist Title & Delete Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">{wishlist.name}</h3>
                <button
                  onClick={() => deleteWishlist(wishlist.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
  
              {/* Add Wishlist Item */}
              <div className="mt-4 flex flex-col space-y-2">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={newItem[wishlist.id]?.name || ""}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, [wishlist.id]: { ...prev[wishlist.id], name: e.target.value } }))
                  }
                  className="px-4 py-2 rounded bg-white/20 backdrop-blur-md text-white placeholder-gray-300 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Item Link"
                  value={newItem[wishlist.id]?.link || ""}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, [wishlist.id]: { ...prev[wishlist.id], link: e.target.value } }))
                  }
                  className="px-4 py-2 rounded bg-white/20 backdrop-blur-md text-white placeholder-gray-300 outline-none"
                  required
                />
                <button
                  onClick={() => addWishlistItem(wishlist.id)}
                  className="px-4 py-2 bg-purple-500 rounded-lg transition hover:bg-purple-600"
                >
                  Add Item
                </button>
              </div>
  
              {/* Display Wishlist Items */}
              <div className="mt-4 space-y-3">
                {wishlistItems[wishlist.id]?.map((item) => (
                  <WishlistItem
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    link={item.link}
                    isReserved={item.isReserved}
                    reservedBy={item.reservedBy}
                    wishlistOwner={wishlist.userId} // ✅ Pass wishlist owner ID
                    currentUser={firebaseUser?.uid}
                    onDelete={() => deleteWishlistItem(wishlist.id, item.id)}
                    onToggleReserve={() => toggleReservation(wishlist.id, item.id)}
                  />
                ))}
              </div>
  
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-300 text-center">No wishlists found. Create one to get started!</p>
      )}
    </div>
  );  
};

export default Wishlist;
