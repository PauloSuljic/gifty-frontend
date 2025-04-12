import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiLock, FiUnlock, FiExternalLink } from "react-icons/fi";
import ConfirmReserveModal from "./ui/modals/ConfirmReserveModal";

type WishlistItemProps = {
  id: string;
  name: string;
  link: string;
  isReserved: boolean;
  reservedBy?: string | null;
  wishlistOwner: string;
  currentUser?: string;
  onToggleReserve: () => void;
  onDelete?: () => void;
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
  onEdit,
}: WishlistItemProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [modalAction, setModalAction] = useState<"reserve" | "unreserve" | null>(null);

  const isGuest = !currentUser;
  const isOwner = wishlistOwner === currentUser;
  const isReserver = reservedBy === currentUser;

  const canReserve = !isGuest && !isReserved && !isOwner;
  const canUnreserve = !isGuest && isReserved && isReserver;
  const canDelete = isOwner && onDelete;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleConfirmClick = (type: "reserve" | "unreserve") => {
    setModalAction(type);
  };

  return (
    <>
      <div className="p-4 bg-slate-800 text-white rounded-2xl shadow-md border border-slate-600 hover:border-purple-500 transition mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
          🎧 {name}
        </h3>

        <div className="flex flex-wrap gap-3 items-center">
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 text-sm bg-zinc-700 rounded-lg hover:bg-zinc-600 transition"
              title="View Item"
            >
              <FiExternalLink />
              View
            </a>
          )}

          {!isOwner && (
            <>
              {canReserve && (
                <button
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                  onClick={() => handleConfirmClick("reserve")}
                >
                  <FiUnlock /> Reserve
                </button>
              )}
              {canUnreserve && (
                <button
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition"
                  onClick={() => handleConfirmClick("unreserve")}
                >
                  <FiLock /> Unreserve
                </button>
              )}
              {isReserved && !isReserver && (
                <span className="flex items-center gap-1 text-sm text-zinc-400">
                  <FiLock /> Reserved
                </span>
              )}
            </>
          )}

          {canDelete && (
            <>
              <button
                onClick={onEdit}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                title="Edit Item"
              >
                <FiEdit /> Edit
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded-lg transition"
                title="Delete Item"
              >
                <FiTrash2 /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmReserveModal
        isOpen={modalAction !== null}
        onClose={() => setModalAction(null)}
        onConfirm={() => {
          setModalAction(null);
          onToggleReserve();
        }}
        itemName={name}
        actionType={modalAction || "reserve"}
      />
    </>
  );
};

export default WishlistItem;
