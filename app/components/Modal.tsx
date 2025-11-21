import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  hideCloseButton?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-3xl",
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  hideCloseButton = false,
}) => {
  const handleOverlayClick = () => {
    onClose();
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            onClick={stopPropagation}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full ${sizeClasses[size]} max-h-[90vh] rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl`}
          >
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 cursor-pointer hover:text-gray-900 dark:hover:text-white"
              >
                <IoClose size={22} />
              </button>
            )}

            {title && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {title}
              </h2>
            )}

            {/* Scrollable content area */}
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
