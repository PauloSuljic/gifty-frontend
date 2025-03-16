type WishlistItemProps = {
    id: string;
    name: string;
    link: string;
    isReserved: boolean;
    reservedBy: string | null;
    wishlistOwner: string; // ✅ Pass the wishlist owner's ID
    currentUser?: string; // ✅ Pass the current logged-in user ID
    onToggleReserve: () => void;
    onDelete: () => void;
  };
  
  const WishlistItem = ({
    name,
    link,
    isReserved,
    reservedBy,
    wishlistOwner,
    currentUser,
    onToggleReserve,
    onDelete
  }: WishlistItemProps) => {
    const canReserve = !isReserved && wishlistOwner !== currentUser; // ✅ Only non-owners can reserve
    const canUnreserve = isReserved && reservedBy === currentUser; // ✅ Only the reserver can unreserve
  
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
          <button className="px-4 py-2 bg-purple-500 rounded-lg transition hover:bg-purple-600" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    );
  };
  
  export default WishlistItem;
  