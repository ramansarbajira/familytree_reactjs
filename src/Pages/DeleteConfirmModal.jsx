
import React from "react";

const DeleteConfirmModal = ({ open, onClose, onConfirm, message }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] px-4">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-xl">
        <p className="text-lg text-center mb-6">
          {message || "Are you sure you want to delete this?"}
        </p>

        <div className="flex gap-4">
          <button
            className="w-full py-2 rounded-lg border border-gray-400 bg-gray-100 
                       active:scale-[0.98] transition"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="w-full py-2 rounded-lg bg-red-600 text-white 
                       active:scale-[0.98] transition"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
