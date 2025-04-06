import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiLock, FiUnlock } from "react-icons/fi";
import ConfirmReserveModal from "./ui/ConfirmReserveModal"; // ✅ Update this path if needed

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

  // 🔍 Detect mobile screen
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
      <div className="p-4 bg-white/10 rounded-xl shadow-lg flex justify-between items-start flex-col sm:flex-row sm:items-center gap-3 border border-white/20">
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-1">{name}</h3>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 text-sm px-3 py-1 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
            >
              View Item
            </a>
          )}
        </div>

        <div className="flex items-center space-x-3 sm:space-x-2 sm:mt-0 mt-2">
          {!isOwner && (
            <>
              {/* 🔒 Mobile: icons only */}
              {isMobile ? (
                <>
                  {isReserved ? (
                    <FiLock className="text-gray-400" title="Reserved" />
                  ) : (
                    <button
                      onClick={() => handleConfirmClick("reserve")}
                      className="text-purple-400 hover:text-purple-500 transition"
                      title="Reserve Item"
                    >
                      <FiUnlock />
                    </button>
                  )}
                </>
              ) : (
                <>
                  {canReserve && (
                    <button
                      className="bg-purple-500 hover:bg-purple-600 px-3 py-1 text-sm rounded-lg transition"
                      onClick={() => handleConfirmClick("reserve")}
                    >
                      <FiUnlock className="inline mr-1" /> Reserve
                    </button>
                  )}
                  {canUnreserve && (
                    <button
                      className="bg-red-500 hover:bg-red-600 px-3 py-1 text-sm rounded-lg transition"
                      onClick={() => handleConfirmClick("unreserve")}
                    >
                      <FiLock className="inline mr-1" /> Unreserve
                    </button>
                  )}
                  {isReserved && !isReserver && (
                    <span className="flex items-center text-sm text-gray-400">
                      <FiLock className="mr-1" /> Reserved
                    </span>
                  )}
                </>
              )}
            </>
          )}

          {canDelete && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="text-blue-400 hover:text-blue-500"
                title="Edit Item"
              >
                <FiEdit size={18} />
              </button>
              <button
                onClick={onDelete}
                className="text-red-500 hover:text-red-700"
                title="Delete Item"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Custom Confirm Modal */}
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
