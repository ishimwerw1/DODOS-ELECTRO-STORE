import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaAndroid, FaApple, FaLaptop, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DownloadApp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('App installed successfully! 🎉');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async (platform) => {
    if (platform === 'ios') {
      toast.info('On iOS, tap the "Share" icon in Safari and select "Add to Home Screen" 📲');
      return;
    }

    if (!deferredPrompt) {
      if (isInstalled) {
        toast.success('Dodos App is already installed!');
      } else {
        toast.info('To install on this device, use your browser settings and look for "Install App" or "Add to Home Screen"');
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) return null;

  return (
    <div className="fixed bottom-[104px] right-6 z-[9999]">
      <div className="relative">
        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all ${
            isOpen ? 'bg-red-500 text-white' : 'bg-green-600 text-white'
          }`}
        >
          {isOpen ? <FaTimes size={20} /> : <FaDownload size={20} className="animate-bounce" />}
          
          {!isOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-white animate-pulse" />
          )}
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full right-0 mb-4 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              <div className="p-5">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter mb-1">Download App</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4 leading-relaxed">
                  Install Dodos Electro Store on your device for a better experience
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => handleInstall('android')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 text-gray-700 hover:text-green-600 transition-all border border-gray-50 hover:border-green-100 group"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                      <FaAndroid size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black">Android</p>
                      <p className="text-[9px] opacity-60 font-bold uppercase tracking-tight">Direct Install</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleInstall('ios')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all border border-gray-50 hover:border-blue-100 group"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <FaApple size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black">iOS (iPhone)</p>
                      <p className="text-[9px] opacity-60 font-bold uppercase tracking-tight">Safari Instruction</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleInstall('desktop')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-gray-700 hover:text-slate-900 transition-all border border-gray-50 hover:border-slate-200 group"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-all">
                      <FaLaptop size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black">Desktop</p>
                      <p className="text-[9px] opacity-60 font-bold uppercase tracking-tight">Windows / macOS</p>
                    </div>
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <FaExternalLinkAlt size={8} /> PWA Technology
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DownloadApp;
