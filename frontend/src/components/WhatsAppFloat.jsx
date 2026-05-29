import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppFloat = () => {
  const phoneNumber = '250783211453'; // Updated WhatsApp number
  const message = 'Hello DODOS Electro Store, I have a question about...';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-44 right-6 z-[9999] w-14 h-14 bg-[#25D366] text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all group"
      title="Chat with us on WhatsApp"
    >
      <div className="absolute inset-0 bg-[#25D366] rounded-2xl animate-ping opacity-20 group-hover:opacity-40" />
      <FaWhatsapp size={28} className="relative z-10" />
      
      {/* Tooltip */}
      <div className="absolute right-full mr-4 bg-white text-gray-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-gray-100">
        Chat with Support
      </div>
    </motion.a>
  );
};

export default WhatsAppFloat;
