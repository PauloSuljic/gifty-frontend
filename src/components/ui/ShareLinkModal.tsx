import React, { useRef } from "react";
import { FiCopy } from "react-icons/fi";

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

const ShareLinkModal = ({ isOpen, onClose, shareUrl }: ShareLinkModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // ✅ Close modal when clicking outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // ✅ Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!"); // ✅ Optionally replace with a toast notification
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50" onClick={handleClickOutside}>
      <div ref={modalRef} className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xl relative">
        <h2 className="text-xl font-semibold text-white">Share Wishlist</h2>
        <p className="text-gray-300 mt-2">Share this link with others:</p>
        
        {/* ✅ Share Link Input */}
        <div className="flex items-center mt-3 bg-gray-700 p-2 rounded-lg">
          <input 
            type="text" 
            value={shareUrl} 
            readOnly 
            className="bg-transparent text-white w-full px-2 outline-none"
          />
          <button 
            onClick={copyToClipboard} 
            className="ml-2 px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition flex items-center space-x-2"
          >
            <FiCopy size={18} />
            <span>Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;
