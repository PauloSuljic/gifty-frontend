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
    "w-[70px] h-7 flex items-center justify-center gap-1 text-sm rounded-md transition";

  const purpleBtn =
    "border border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white";

  return (
    <>
      <div
        className="p-4 bg-slate-800 text-white rounded-2xl shadow-md border border-slate-600 hover:border-purple-500 transition mb-4"
        onClick={() => isMobile && setShowActions((prev) => !prev)}
      >
        <h3 className={`font-semibold flex items-center gap-2 mb-2 ${isMobile ? "text-base" : "text-lg"}`}>
          {name}
        </h3>

        <div
          className={`flex flex-wrap justify-center items-center gap-x-3 transition-all ${
            isMobile && !showActions ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto mt-2"
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
              {!isMobile && "View"}
            </a>
          )}

          {canReserve && (
            <button
              onClick={() => handleConfirmClick("reserve")}
              className={`${baseBtn} ${purpleBtn}`}
            >
              <FiUnlock />
              {!isMobile && "Reserve"}
            </button>
          )}

          {canUnreserve && (
            <button
              onClick={() => handleConfirmClick("unreserve")}
              className={`${baseBtn} ${purpleBtn}`}
            >
              <FiLock />
              {!isMobile && "Unreserve"}
            </button>
          )}

          {canDelete && (
            <>
              <button
                onClick={onEdit}
                className={`${baseBtn} ${purpleBtn}`}
                title="Edit Item"
              >
                <FiEdit />
                {!isMobile && "Edit"}
              </button>
              <button
                onClick={onDelete}
                className={`${baseBtn} bg-red-600 hover:bg-red-700 text-white`}
                title="Delete Item"
              >
                <FiTrash2 />
                {!isMobile && "Delete"}
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
