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
  const [showActions, setShowActions] = useState(false);

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

  const baseBtn =
  "h-7 w-[90px] sm:w-[120px] flex items-center justify-center gap-1 text-xs sm:text-sm rounded-md transition";

  const purpleBtn =
    "border border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white";

  return (
    <>
      <div
        className="relative p-4 bg-slate-800 text-white rounded-2xl shadow-md border border-slate-600 hover:border-purple-500 transition mb-4"
        onClick={() => setShowActions((prev) => !prev)}
      >
        {isReserved && (
          <div className="absolute top-3 right-3 text-purple-400 text-lg">
            <FiLock />
          </div>
        )}

        {canDelete && (
          <button
            onClick={onDelete}
            className="absolute top-3 right-3 text-red-500 hover:text-red-700"
            title="Delete Item"
          >
            <FiTrash2 size={18} />
          </button>
        )}

        <h3 className={`font-semibold flex items-center gap-2 mb-2 ${isMobile ? "text-base" : "text-lg"}`}>
          {name}
        </h3>

        <div
          className={`flex flex-wrap justify-center items-center gap-3 transition-all ${
            !showActions ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto mt-2"
          }`}
        >
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={`${baseBtn} ${purpleBtn}`}
              title="View Item"
            >
              <FiExternalLink />
              View
            </a>
          )}

          {canReserve && (
            <button onClick={() => handleConfirmClick("reserve")} className={`${baseBtn} ${purpleBtn}`}>
              <FiUnlock />
              Reserve
            </button>
          )}

          {canUnreserve && (
            <button onClick={() => handleConfirmClick("unreserve")} className={`${baseBtn} ${purpleBtn}`}>
              <FiLock />
              Unreserve
            </button>
          )}

          {canDelete && (
            <>
              <button onClick={onEdit} className={`${baseBtn} ${purpleBtn}`} title="Edit Item">
                <FiEdit />
                Edit
              </button>
            </>
          )}
        </div>
      </div>

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
