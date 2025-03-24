import { FiEdit, FiTrash2 } from "react-icons/fi";

type WishlistItemProps = {
    id: string;
    name: string;
    link: string;
    isReserved: boolean;
    reservedBy?: string | null;
    wishlistOwner: string; // ✅ Owner of the wishlist
    currentUser?: string; // ✅ Currently logged-in user (empty if guest)
    onToggleReserve: () => void;
    onDelete?: () => void; // ✅ Optional delete function
    onEdit?: () => void;
  };
  
  const WishlistItem = ({
    name,
    link,
    isReserved,
    reservedBy,
    wishlistOwner,
    currentUser,
    onToggleReserve,
    onDelete,
    onEdit
  }: WishlistItemProps) => {
    const isGuest = !currentUser; // ✅ Guest users can't reserve/unreserve
    const isOwner = wishlistOwner === currentUser; // ✅ Is the logged-in user the owner?
    const isReserver = reservedBy === currentUser; // ✅ Did the current user reserve it?
  
    // ✅ Define user actions
    const canReserve = !isGuest && !isReserved && !isOwner; // ✅ Only non-owners can reserve
    const canUnreserve = !isGuest && isReserved && isReserver; // ✅ Only the reserver can unreserve
    const canDelete = isOwner && onDelete; // ✅ Only the wishlist owner can delete
  
    return (
      <div className="p-4 bg-white/10 rounded-lg shadow-lg backdrop-blur-md border border-white/20 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm">
              View Item
            </a>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* ✅ Hide Reserve/Unreserve button for owners */}
          {!isOwner && (
            <>
              {canReserve && (
                <button
                  className="px-4 py-2 bg-green-500 rounded-lg transition hover:bg-green-600"
                  onClick={onToggleReserve}
                >
                  Reserve
                </button>
              )}
              {canUnreserve && (
                <button
                  className="px-4 py-2 bg-red-500 rounded-lg transition hover:bg-red-600"
                  onClick={onToggleReserve}
                >
                  Unreserve
                </button>
              )}
            </>
          )}
  
          {/* ✅ Only show delete button for the wishlist owner */}
          {canDelete && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="text-blue-500 hover:text-blue-600 transition"
                title="Edit Item"
              >
                <FiEdit size={20} />
              </button>
              <button
                onClick={onDelete}
                className="text-red-500 hover:text-red-700 transition"
                title="Delete Item"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default WishlistItem;
  