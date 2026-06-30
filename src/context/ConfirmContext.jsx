import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiAlertLine } from "react-icons/ri";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [resolver, setResolver] = useState(null);

  const confirm = useCallback((msg) => {
    setMessage(msg);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    if (resolver) resolver(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolver) resolver(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCancel}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm glass-card border border-gray-800 p-6 flex flex-col items-center text-center shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                <RiAlertLine className="text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Are you sure?</h3>
              <p className="text-sm text-gray-400 mb-6">{message}</p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary flex-1 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="btn py-2 text-sm flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used inside <ConfirmProvider>");
  }
  return context;
}

export default ConfirmContext;
