import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope,
  FaArrowRight, FaFacebook, FaShieldAlt, FaShippingFast, FaLock, FaHeadset, FaBolt,
} from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { subscriberAPI, categoryAPI } from '../services/api';

const Footer = () => {
  const { settings } = useAuth();
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [isSubscribing, setIsSubscribing]   = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    try {
      setIsSubscribing(true);
      const res = await subscriberAPI.subscribe(subscribeEmail);
      if (res.data.success) { toast.success('Successfully subscribed! 🚀'); setSubscribeEmail(''); }
    } catch { toast.error('Failed to subscribe'); }
    finally { setIsSubscribing(false); }
  };

  const storeName = settings?.general?.storeName || 'DODOS ELECTRO STORE';
  const logoUrl   = settings?.general?.logoUrl;

  return (
    <footer className="bg-gray-900 text-white pt-10 sm:pt-14 pb-8 mt-auto overflow-hidden">

      {/* ── Trust badges ── */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 xl:px-8 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8 sm:mb-12">
        {[
          { icon: FaShippingFast, title: 'Express Delivery',  desc: 'Across Rwanda' },
          { icon: FaShieldAlt,    title: 'Local Warranty',    desc: '1 Year official support' },
          { icon: FaLock,         title: 'Secure Payment',    desc: '100% Encrypted checkout' },
          { icon: FaHeadset,      title: 'Expert Support',    desc: 'Technical assistance 24/7' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl group hover:bg-white/10 transition-all">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all flex-shrink-0">
              <item.icon size={15} />
            </div>
            <div className="min-w-0">
              <h4 className="text-white font-bold text-[10px] sm:text-xs uppercase tracking-tight truncate">{item.title}</h4>
              <p className="text-gray-500 text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest mt-0.5 hidden sm:block">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main columns ── */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 xl:px-8 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-10 mb-10 sm:mb-12 border-t border-white/10 pt-8 sm:pt-12">

        {/* Brand */}
        <div className="col-span-2 lg:col-span-4 space-y-4 sm:space-y-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all overflow-hidden flex-shrink-0">
              <img src={logoUrl || '/dodos-logo.png'} alt={storeName} className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <p className="font-black text-base sm:text-lg text-white tracking-tight uppercase">{storeName}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-green-400 tracking-[0.3em] uppercase">Premium Accessories</p>
            </div>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            The largest collection of original smartphone spare parts and professional repair tools in Rwanda.
          </p>
          <div className="flex gap-2 sm:gap-3">
            {[FaInstagram, FaFacebook, FaTiktok, FaWhatsapp].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <h4 className="text-white font-black uppercase text-xs tracking-[0.2em]">Quick Links</h4>
          <ul className="space-y-2 sm:space-y-3">
            {[['Home', '/'], ['Shop All', '/products'], ['Categories', '/categories'], ['Services', '/services'], ['Contact', '/contact']].map(([l, p]) => (
              <li key={l}>
                <Link to={p} className="text-gray-400 hover:text-green-400 text-sm font-semibold transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-green-500 transition-all flex-shrink-0" />
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <h4 className="text-white font-black uppercase text-xs tracking-[0.2em]">Categories</h4>
          <ul className="space-y-2 sm:space-y-3">
            {categories.slice(0, 5).map(category => (
              <li key={category._id}>
                <Link to={`/products?category=${category._id}`} className="text-gray-400 hover:text-green-400 text-sm font-semibold transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-green-500 transition-all flex-shrink-0" />
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="col-span-2 lg:col-span-4 space-y-4 sm:space-y-5">
          <h4 className="text-white font-black uppercase text-xs tracking-[0.2em]">Newsletter</h4>
          <p className="text-gray-400 text-sm">Get exclusive early access to deals and repair guides.</p>
          <form onSubmit={handleSubscribe} className="relative">
            <input
              type="email"
              value={subscribeEmail}
              onChange={e => setSubscribeEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-5 pr-14 text-white text-sm outline-none focus:border-green-500/50 transition-all placeholder:text-gray-600"
            />
            <button type="submit" className="absolute right-2 top-2 bottom-2 w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center text-white hover:bg-green-600 transition-all">
              <FaArrowRight size={13} />
            </button>
          </form>
          <div className="flex items-center gap-5 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-green-400 flex-shrink-0" size={12} />
              <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest">
                Center Town · TCB Building · Floor 1 · Door 013C
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaPhoneAlt className="text-green-400" size={12} />
            <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest">0788 206 064</span>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 xl:px-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-600 text-[10px] font-semibold uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
          <Link to="/" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          <Link to="/" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Status: Online</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
