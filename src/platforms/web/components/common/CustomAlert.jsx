import { AnimatePresence, motion } from "framer-motion"

const CustomAlert = ({ message, onClose }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
        >
          <div className="bg-white rounded-xl shadow-xl px-6 py-5 w-[90%] max-w-sm text-center">
            <p className="text-gray-800 text-base font-medium mb-4">{message}</p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
            >
              OK
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CustomAlert
