import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import Card from "./ui/Card";
import WishlistItem from "./WishlistItem";
import Modal from "./ui/Modal";
import { FiTrash2, FiLink, FiPlus } from "react-icons/fi";
import ConfirmDeleteModal from "./ui/ConfirmDeleteModal";
import ShareLinkModal from "./ui/ShareLinkModal";
import { apiFetch } from "../api";

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
  const [newWishlist, setNewWishlist] = useState<string>(""); 
  const [selectedWishlist, setSelectedWishlist] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<{ name: string; link: string }>({ name: "", link: "" });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; wishlistId: string; wishlistName: string } | null>(null);

  const [isWishlistDeleteModalOpen, setIsWishlistDeleteModalOpen] = useState(false);
  const [wishlistToDelete, setWishlistToDelete] = useState<{ id: string; name: string } | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (firebaseUser) fetchWishlists();
  }, [firebaseUser]);

  const fetchWishlists = async () => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const response = await apiFetch("/api/wishlists", {
      method: "GET",
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
    const response = await apiFetch("/api/wishlists", {
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

  const deleteWishlist = async () => {
    if (!firebaseUser || !wishlistToDelete) return; // ✅ Ensure we have the wishlist info
  
    const token = await firebaseUser.getIdToken();
    
    const response = await apiFetch(`/api/wishlists/${wishlistToDelete.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (response.ok) {
      setWishlists((prev) => prev.filter((wishlist) => wishlist.id !== wishlistToDelete.id));
      setWishlistItems((prev) => {
        const updatedItems = { ...prev };
        delete updatedItems[wishlistToDelete.id]; 
        return updatedItems;
      });
  
      setIsWishlistDeleteModalOpen(false); // ✅ Close modal after deletion
      setWishlistToDelete(null); // ✅ Reset selection
    } else {
      console.error("Error deleting wishlist:", await response.json());
    }
  };  

  const fetchWishlistItems = async (wishlistId: string) => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const response = await apiFetch(`/api/wishlist-items/${wishlistId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      setWishlistItems((prev) => ({ ...prev, [wishlistId]: data }));
    }
  };

  const addWishlistItem = async () => {
    if (!newItem.name.trim() || !newItem.link.trim()) {
      alert("Please enter both item name and link.");
      return;
    }

    if (!selectedWishlist) return;

    const token = await firebaseUser?.getIdToken();
    const response = await apiFetch("/api/wishlist-items", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newItem.name,
        link: newItem.link,
        wishlistId: selectedWishlist,
        reservedBy: null
      }),
    });

    if (response.ok) {
      const createdItem = await response.json();
      setWishlistItems((prev) => ({
        ...prev,
        [selectedWishlist]: [...(prev[selectedWishlist] || []), createdItem],
      }));
      setNewItem({ name: "", link: "" });
      setIsModalOpen(false); // ✅ Close modal after adding
    } else {
      console.error("Error adding item:", await response.json());
    }
  };

  const deleteWishlistItem = async () => {
    if (!firebaseUser || !itemToDelete) return;
    const { id, wishlistId } = itemToDelete;
    const token = await firebaseUser.getIdToken();

    const response = await apiFetch(`/api/wishlist-items/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });

    if (response.ok) {
      setWishlistItems((prev) => ({
        ...prev,
        [wishlistId]: prev[wishlistId].filter((item) => item.id !== id),
      }));
      setIsDeleteModalOpen(false); // ✅ Close modal after deleting
    }
  };

  const toggleReservation = async (wishlistId: string, itemId: string) => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const response = await apiFetch(`/api/wishlist-items/${itemId}/reserve`, {
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

  const generateShareLink = async (wishlistId: string) => {
    const token = await firebaseUser?.getIdToken();
    const response = await apiFetch(`/api/shared-links/${wishlistId}/generate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (response.ok) {
      const data = await response.json();
      const generatedUrl = `${window.location.origin}/shared/${data.shareCode}`;
  
      setShareUrl(generatedUrl); 
      setIsShareModalOpen(true); 
    } else {
      console.error("Error generating share link:", await response.json());
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-white">
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
              {/* Wishlist Title & Actions */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">{wishlist.name}</h3>
                <div className="flex space-x-2">
                  <button onClick={() => {
                            setWishlistToDelete({ id: wishlist.id, name: wishlist.name });
                            setIsWishlistDeleteModalOpen(true);
                          }}
                          className="text-red-500 hover:text-red-700 transition">
                    <FiTrash2 size={20} />
                  </button>
                  <button onClick={() => generateShareLink(wishlist.id)} className="text-blue-500 hover:text-blue-700 transition">
                    <FiLink size={20} />
                  </button>
                </div>
              </div>

              {/* Add Item Button (Opens Modal) */}
              <button
                onClick={() => {
                  setSelectedWishlist(wishlist.id);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 mt-4 bg-purple-500 rounded-lg transition hover:bg-purple-600 w-full flex items-center justify-center space-x-2"
              >
                <FiPlus />
                <span>Add Item</span>
              </button>

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
                    wishlistOwner={wishlist.userId}
                    currentUser={firebaseUser?.uid}
                    onDelete={() => {
                      setItemToDelete({
                        id: item.id,
                        name: item.name,
                        wishlistId: wishlist.id,
                        wishlistName: wishlist.name
                      });
                      setIsDeleteModalOpen(true);
                    }}
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

      {/* Modal for Adding Items */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Add Item</h2>
        <input type="text" placeholder="Item Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="w-full px-4 py-2 rounded bg-gray-700 text-white mb-2" />
        <input type="text" placeholder="Item Link" value={newItem.link} onChange={(e) => setNewItem({ ...newItem, link: e.target.value })} className="w-full px-4 py-2 rounded bg-gray-700 text-white mb-4" />
        <button onClick={addWishlistItem} className="px-4 py-2 bg-purple-500 rounded-lg w-full">Confirm</button>
      </Modal>

      {/* ✅ Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteWishlistItem}
        itemName={itemToDelete?.name || ""}
        wishlistName={itemToDelete?.wishlistName || ""}
      />

      {/* ✅ Delete Wishlist Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isWishlistDeleteModalOpen}
        onClose={() => setIsWishlistDeleteModalOpen(false)}
        onConfirm={deleteWishlist}
        itemName={wishlistToDelete?.name || ""}
      />

      <ShareLinkModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        shareUrl={shareUrl}
      />

    </div>
  );
};

export default Wishlist;
