import { Link } from 'react-router-dom';
import { FaChevronDown, FaBoxOpen, FaHeadset, FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import { useLocale } from '../context/LocaleContext';
import Dropdown from './Dropdown';

const SOCIAL_LINKS = [
  { icon: FaInstagram, href: 'https://instagram.com/dodoselectrostore', label: 'Instagram', bg: 'bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]' },
  { icon: FaFacebook,  href: 'https://facebook.com/dodoselectrostore',  label: 'Facebook',  bg: 'bg-[#1877F2]' },
  { icon: FaTiktok,    href: 'https://tiktok.com/@dodoselectrostore',   label: 'TikTok',    bg: 'bg-[#010101]' },
  { icon: FaWhatsapp,  href: 'https://wa.me/250783211453',              label: 'WhatsApp',  bg: 'bg-[#25D366]' },
];

const TopHeader = () => {
  const { t, language, currency, setLanguage, setCurrency, LANGUAGES, CURRENCIES } = useLocale();

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  const currentCur  = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  return (
    <div className="bg-gray-900 py-2 border-b border-gray-800 w-full">
      <div
        className="w-full flex items-center justify-between"
        style={{ paddingLeft: '0.5cm', paddingRight: '0.5cm' }}
      >
        {/* ── LEFT: Social icons + follow text ── */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest hidden sm:block">
            Follow us:
          </span>
          <div className="flex items-center gap-1.5">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label, bg }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                className={`w-6 h-6 rounded-md ${bg} flex items-center justify-center shadow-sm opacity-90 hover:opacity-100 transition-opacity`}
              >
                <Icon size={11} className="text-white" />
              </a>
            ))}
          </div>
        </div>

        {/* ── CENTER: Promo text ── */}
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest hidden md:block">
          🎉 Get up to 30% off new season styles — limited time only
        </p>

        {/* ── RIGHT: Links + Currency + Language ── */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
            <Link to="/orders" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <FaBoxOpen size={11} className="text-green-400" />
              <span className="hidden sm:inline">{t('trackOrder')}</span>
            </Link>
            <Link to="/contact" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <FaHeadset size={11} className="text-green-400" />
              <span className="hidden sm:inline">{t('helpCenter')}</span>
            </Link>
          </div>

          <div className="h-4 w-px bg-gray-700" />

          {/* Currency */}
          <Dropdown align="right" trigger={
            <span className="flex items-center gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-white transition-colors">
              {currentCur.code} {currentCur.symbol}
              <FaChevronDown size={8} />
            </span>
          }>
            {(close) => (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden py-1 min-w-[100px] shadow-xl">
                {CURRENCIES.map(cur => (
                  <button
                    key={cur.code}
                    onClick={() => { setCurrency(cur.code); close(); }}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-900 text-[11px] font-semibold"
                  >
                    <span>{cur.code}</span>
                    <span className="text-gray-400">{cur.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </Dropdown>

          {/* Language */}
          <Dropdown align="right" trigger={
            <span className="flex items-center gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-white transition-colors">
              {currentLang.flag} {currentLang.code}
              <FaChevronDown size={8} />
            </span>
          }>
            {(close) => (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden py-1 min-w-[120px] shadow-xl">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); close(); }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-900 text-[11px] font-semibold"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
