import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import Card from "./ui/Card";
import WishlistItem from "./WishlistItem";
import Modal from "./ui/Modal";
import { FiTrash2, FiLink, FiPlus, FiEdit } from "react-icons/fi";
import ConfirmDeleteModal from "./ui/modals/ConfirmDeleteModal";
import ShareLinkModal from "./ui/modals/ShareLinkModal";
import { apiFetch } from "../api";
import toast from "react-hot-toast";

import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import {SortableItem} from './ui/SortableItem';

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

  const [wishlistOrder, setWishlistOrder] = useState<string[]>([]);

  // 🔽 New state for edit functionality
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<{ id: string; name: string; link: string; wishlistId: string }>({
    id: "",
    name: "",
    link: "",
    wishlistId: ""
  });

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [wishlistToRename, setWishlistToRename] = useState<{ id: string; name: string } | null>(null);
  const [newWishlistName, setNewWishlistName] = useState("");

  const [expandedWishlistIds, setExpandedWishlistIds] = useState<string[]>([]);

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
      setWishlistOrder(data.map((w: WishlistType) => w.id)); 
      data.forEach((wishlist: WishlistType) => fetchWishlistItems(wishlist.id));

      // Expand first item in wishlist
      // if (data.length > 0) {
      //   setExpandedWishlistIds([data[0].id]);
      // }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event;
    if (!over || active.id === over.id) return;
  
    const oldIndex = wishlistOrder.indexOf(active.id as string);
    const newIndex = wishlistOrder.indexOf(over.id as string);
  
    const newOrder = arrayMove(wishlistOrder, oldIndex, newIndex);
    setWishlistOrder(newOrder);
  
    // Update order in backend
    const reordered = newOrder.map((id, index) => ({
      id,
      order: index,
    }));
  
    const token = await firebaseUser?.getIdToken();
    await apiFetch("/api/wishlists/reorder", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reordered),
    });
  };
  
  const createWishlist = async () => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
  
    const response = await apiFetch("/api/wishlists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: firebaseUser.uid,
        name: newWishlist,
        isPublic: false
      }),
    });
  
    if (response.ok) {
      toast.success("Wishlist created! 🎉", {
        duration: 3000,
        position: "bottom-center",
      });
      fetchWishlists();
      setNewWishlist("");
    } else {
      toast.error("Failed to create wishlist 😞");
    }
  };  

  const deleteWishlist = async () => {
    if (!firebaseUser || !wishlistToDelete) return;
    const token = await firebaseUser.getIdToken();
  
    const response = await apiFetch(`/api/wishlists/${wishlistToDelete.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (response.ok) {
      setWishlists((prev) => prev.filter((w) => w.id !== wishlistToDelete.id));
      setWishlistItems((prev) => {
        const updated = { ...prev };
        delete updated[wishlistToDelete.id];
        return updated;
      });
  
      setIsWishlistDeleteModalOpen(false);
      setWishlistToDelete(null);
      toast.success(`Wishlist "${wishlistToDelete.name}" deleted 🗑️`, {
        duration: 3000,
        position: "bottom-center",
      });
    } else {
      toast.error("Failed to delete wishlist.");
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
      toast.error("Please enter both item name and link.", {
        duration: 3000,
        position: "bottom-center"
      });
      return;
    }
  
    if (!selectedWishlist) return;
  
    const token = await firebaseUser?.getIdToken();
    const response = await apiFetch("/api/wishlist-items", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
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
      setIsModalOpen(false);
  
      toast.success("Item added to wishlist! 🎁", {
        duration: 3000,
        position: "bottom-center"
      });
    } else {
      console.error("Error adding item:", await response.json());
      toast.error("Failed to add item. 😞", {
        duration: 3000,
        position: "bottom-center"
      });
    }
  };  

  const deleteWishlistItem = async () => {
    if (!firebaseUser || !itemToDelete) return;
    const { id, wishlistId, name } = itemToDelete;
    const token = await firebaseUser.getIdToken();
  
    const response = await apiFetch(`/api/wishlist-items/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
  
    if (response.ok) {
      setWishlistItems((prev) => ({
        ...prev,
        [wishlistId]: prev[wishlistId].filter((item) => item.id !== id),
      }));
      setIsDeleteModalOpen(false);
      toast.success(`Deleted "${name}" from wishlist 🗑️`, {
        duration: 3000,
        position: "bottom-center",
      });
    } else {
      toast.error("Failed to delete item.");
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

  // 🔽 Function to open edit modal
  const openEditModal = (item: WishlistItemType, wishlistId: string) => {
    setItemToEdit({ id: item.id, name: item.name, link: item.link, wishlistId });
    setIsEditModalOpen(true);
  };

  // 🔽 Function to update wishlist item
  const updateWishlistItem = async () => {
    const token = await firebaseUser?.getIdToken();
    if (!token) return;

    const response = await apiFetch(`/api/wishlist-items/${itemToEdit.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: itemToEdit.name,
        link: itemToEdit.link
      })
    });

    if (response.ok) {
      const updated = await response.json();
      setWishlistItems((prev) => ({
        ...prev,
        [itemToEdit.wishlistId]: prev[itemToEdit.wishlistId].map((item) =>
          item.id === updated.id ? updated : item
        )
      }));
      setIsEditModalOpen(false);
      toast.success("Item updated!", {
        position: "bottom-center",
        duration: 3000,
        icon: "✅",
      });
    } else {
      console.error("Failed to update item:", await response.json());
      toast.error("Something went wrong!", {
        position: "bottom-center",
        duration: 3000,
        icon: "❌",
      });
    }
  };

  const renameWishlist = async () => {
    if (!firebaseUser || !wishlistToRename || !newWishlistName.trim()) return;
  
    const token = await firebaseUser.getIdToken();
  
    const response = await apiFetch(`/api/wishlists/${wishlistToRename.id}`, {
      method: "PATCH",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newWishlistName)
    });
  
    if (response.ok) {
      toast.success("Wishlist renamed!");
      fetchWishlists(); // refresh
      setIsRenameModalOpen(false);
      setWishlistToRename(null);
      setNewWishlistName("");
    } else {
      toast.error("Failed to rename wishlist.");
    }
  };

  const toggleWishlistDropdown = (wishlistId: string) => {
    setExpandedWishlistIds((prev) =>
      prev.includes(wishlistId)
        ? prev.filter((id) => id !== wishlistId)
        : [...prev, wishlistId]
    );
  };
  
  
  return (
    <div className="max-w-4xl mx-auto text-white px-4"> {/* 👈 Add padding for mobile edge spacing */}
      {/* Create New Wishlist */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={newWishlist}
          onChange={(e) => setNewWishlist(e.target.value)}
          placeholder="New Wishlist Name"
          className="flex-grow min-w-[200px] px-4 py-2 rounded-lg bg-white/20 backdrop-blur-md text-white placeholder-gray-300 outline-none"
        />
        <button
          onClick={createWishlist}
          className="px-6 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 transition shadow-lg"
          disabled={!newWishlist.trim()}
        >
          Create
        </button>
      </div>
  
      {wishlists.length > 0 ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={wishlistOrder} strategy={verticalListSortingStrategy}>
            <div className="columns-1 md:columns-2 gap-6 space-y-6 sm:px-4">
              {wishlistOrder.map((id) => {
                const wishlist = wishlists.find((w) => w.id === id);
                if (!wishlist) return null;

                return (
                  <SortableItem key={wishlist.id} id={wishlist.id}>
                    <Card className="break-inside-avoid mb-6">
                      {/* Wishlist Title & Actions */}
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <button
                          onClick={() => toggleWishlistDropdown(wishlist.id)}
                          className="flex-1 text-left text-xl font-semibold text-white"
                        >
                          {wishlist.name}
                          <span className="ml-2 text-sm text-gray-400">
                            {expandedWishlistIds.includes(wishlist.id) ? "▲" : "▼"}
                          </span>
                        </button>

                        {/* 🔧 Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => generateShareLink(wishlist.id)}
                            className="text-blue-500 hover:text-blue-700 transition"
                          >
                            <FiLink size={20} />
                          </button>
                          <button
                            onClick={() => {
                              setWishlistToRename({ id: wishlist.id, name: wishlist.name });
                              setNewWishlistName(wishlist.name);
                              setIsRenameModalOpen(true);
                            }}
                            className="text-blue-500 hover:text-blue-600 transition"
                            title="Rename Wishlist"
                          >
                            <FiEdit size={20} />
                          </button>
                          <button
                            onClick={() => {
                              setWishlistToDelete({ id: wishlist.id, name: wishlist.name });
                              setIsWishlistDeleteModalOpen(true);
                            }}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Add Item Button */}
                      <button
                        onClick={() => {
                          setSelectedWishlist(wishlist.id);
                          setExpandedWishlistIds((prev) =>
                            prev.includes(wishlist.id) ? prev : [...prev, wishlist.id]
                          );
                          setIsModalOpen(true);
                        }}
                        className="px-4 py-2 mt-4 bg-purple-500 rounded-lg transition hover:bg-purple-600 w-full flex items-center justify-center space-x-2"
                      >
                        <FiPlus />
                        <span>Add Item</span>
                      </button>

                      {/* Display Wishlist Items */}
                      <div
                        className={`
                          transition-all duration-500 ease-in-out overflow-hidden
                          ${expandedWishlistIds.includes(wishlist.id)
                            ? "max-h-[1000px] opacity-100 mt-4"
                            : "max-h-0 opacity-0 mt-0"}
                        `}
                      >
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
                                  wishlistName: wishlist.name,
                                });
                                setIsDeleteModalOpen(true);
                              }}
                              onToggleReserve={() => toggleReservation(wishlist.id, item.id)}
                              onEdit={() => openEditModal(item, wishlist.id)}
                            />
                          ))}
                        </div>
                      </div>
                    </Card>
                  </SortableItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
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

      {/* ✅ Modal for Editing Items */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Edit Item</h2>
        <input
          type="text"
          placeholder="Item Name"
          value={itemToEdit.name}
          onChange={(e) => setItemToEdit({ ...itemToEdit, name: e.target.value })}
          className="w-full px-4 py-2 rounded bg-gray-700 text-white mb-2"
        />
        <input
          type="text"
          placeholder="Item Link"
          value={itemToEdit.link}
          onChange={(e) => setItemToEdit({ ...itemToEdit, link: e.target.value })}
          className="w-full px-4 py-2 rounded bg-gray-700 text-white mb-4"
        />
        <button onClick={updateWishlistItem} className="px-4 py-2 bg-purple-500 rounded-lg w-full">
          Save Changes
        </button>
      </Modal>

      <Modal isOpen={isRenameModalOpen} onClose={() => setIsRenameModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Rename Wishlist</h2>
        <input
          type="text"
          placeholder="New wishlist name"
          value={newWishlistName}
          onChange={(e) => setNewWishlistName(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-700 text-white mb-4"
        />
        <button onClick={renameWishlist} className="px-4 py-2 bg-purple-500 rounded-lg w-full">
          Save Changes
        </button>
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
