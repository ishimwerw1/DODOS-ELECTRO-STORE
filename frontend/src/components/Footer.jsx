import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, 
  FaAndroid, FaApple, FaArrowRight, FaFacebook, FaTwitter, FaYoutube, 
  FaCheck, FaLock, FaHeadset, FaInfoCircle, FaBolt, FaShieldAlt, FaShippingFast
} from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { subscriberAPI } from '../services/api';

const Footer = () => {
  const { settings } = useAuth();
  const { t, formatPrice } = useLocale();
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    try {
      setIsSubscribing(true);
      const res = await subscriberAPI.subscribe(subscribeEmail);
      if (res.data.success) {
        toast.success('Successfully subscribed! 🚀');
        setSubscribeEmail('');
      }
    } catch (error) {
      toast.error('Failed to subscribe');
    } finally {
      setIsSubscribing(false);
    }
  };

  const storeName = settings?.general?.storeName || 'DODOS ELECTRO STORE';
  const logoUrl = settings?.general?.logoUrl;
  const location = settings?.general?.location || 'Kigali Town Center, TCB Building Floor 1B Door 013C';
  const email = settings?.general?.contactEmail || 'dodoselectostore@gmail.com';

  return (
    <footer className="bg-bg-main border-t border-border-main pt-20 pb-10 mt-auto overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400 opacity-20" />
      
      {/* ── TRUST BADGES ── */}
      <div className="max-w-[1600px] mx-auto px-4 xl:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {[
          { icon: FaShippingFast, title: 'Express Delivery', desc: 'Across Rwanda' },
          { icon: FaShieldAlt,    title: 'Local Warranty', desc: '1 Year official support' },
          { icon: FaLock,         title: 'Secure Payment', desc: '100% Encrypted checkout' },
          { icon: FaHeadset,      title: 'Expert Support', desc: 'Technical assistance 24/7' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center text-center p-8 bg-bg-card border border-border-main rounded-[2.5rem] group hover:bg-bg-surface transition-all">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 mb-6">
              <item.icon size={24} />
            </div>
            <h4 className="text-text-main font-black uppercase text-sm tracking-tight mb-2">{item.title}</h4>
            <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="max-w-[1600px] mx-auto px-4 xl:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
        {/* BRAND COLUMN */}
        <div className="lg:col-span-4 space-y-10">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-all overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="w-full h-full object-contain p-1" />
              ) : (
                <FaBolt className="text-white text-3xl animate-pulse" />
              )}
            </div>
            <div>
              <p className="font-black text-2xl text-text-main tracking-tighter uppercase">{storeName}</p>
              <p className="text-[10px] font-black text-blue-400 tracking-[0.3em] uppercase">Premium Accessories</p>
            </div>
          </Link>
          <p className="text-text-secondary text-sm leading-relaxed max-w-sm font-medium">
            The largest collection of original smartphone spare parts and professional repair tools in Rwanda. Quality you can trust, precision you can feel.
          </p>
          <div className="flex gap-4">
            {[FaInstagram, FaFacebook, FaTiktok, FaWhatsapp].map((Icon, i) => (
              <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-bg-card border border-border-main flex items-center justify-center text-text-secondary hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-xl">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* LINKS COLUMNS */}
        <div className="lg:col-span-2 space-y-8">
          <h4 className="text-text-main font-black uppercase text-xs tracking-[0.2em]">Quick Links</h4>
          <ul className="space-y-4">
            {['Home', 'Shop All', 'Categories', 'Services', 'Track Order', 'Contact'].map((l) => (
              <li key={l}>
                <Link to="/" className="text-text-secondary hover:text-blue-400 text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600/20 group-hover:bg-blue-500 transition-all" />
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <h4 className="text-text-main font-black uppercase text-xs tracking-[0.2em]">Categories</h4>
          <ul className="space-y-4">
            {['Screens', 'Batteries', 'Back Covers', 'Tools', 'Chargers', 'Cases'].map((l) => (
              <li key={l}>
                <Link to="/" className="text-text-secondary hover:text-blue-400 text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600/20 group-hover:bg-blue-500 transition-all" />
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* NEWSLETTER COLUMN */}
        <div className="lg:col-span-4 space-y-8">
          <h4 className="text-text-main font-black uppercase text-xs tracking-[0.2em]">Join the Newsletter</h4>
          <p className="text-text-secondary text-sm font-medium">Get exclusive early access to deals and professional repair guides.</p>
          <form onSubmit={handleSubscribe} className="relative group">
            <input 
              type="email" 
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-bg-card border border-border-main rounded-2xl py-4 pl-6 pr-14 text-text-main text-sm font-medium outline-none focus:border-blue-500/50 transition-all"
            />
            <button type="submit" className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
              <FaArrowRight size={14} />
            </button>
          </form>
          <div className="flex items-center gap-6 pt-4 border-t border-border-main">
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-blue-400" size={14} />
              <span className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Kigali, Rwanda</span>
            </div>
            <div className="flex items-center gap-3">
              <FaPhoneAlt className="text-blue-400" size={14} />
              <span className="text-text-secondary text-[10px] font-black uppercase tracking-widest">0788 206 064</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="max-w-[1600px] mx-auto px-4 xl:px-8 pt-10 border-t border-border-main flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-text-secondary/50 text-[10px] font-black uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>
        <div className="flex items-center gap-8 text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">
          <Link to="/" className="hover:text-text-secondary transition-colors">Privacy Policy</Link>
          <Link to="/" className="hover:text-text-secondary transition-colors">Terms of Service</Link>
          <Link to="/" className="hover:text-text-secondary transition-colors">Cookies</Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-card rounded-lg border border-border-main">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black text-text-secondary/50 uppercase tracking-widest">Status: Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
