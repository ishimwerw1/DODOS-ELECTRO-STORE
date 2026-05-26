import { Link } from 'react-router-dom';
import { FaChevronDown, FaCheck, FaHeadset, FaBoxOpen, FaInfoCircle } from 'react-icons/fa';
import { useLocale } from '../context/LocaleContext';
import Dropdown from './Dropdown';

const TopHeader = () => {
  const { t, language, currency, setLanguage, setCurrency, LANGUAGES, CURRENCIES } = useLocale();

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  const currentCur = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  return (
    <div className="bg-bg-card py-2.5 border-b border-border-main w-full">
      <div 
        className="w-full flex justify-end items-center gap-8"
        style={{ paddingLeft: '0.3cm', paddingRight: '0.3cm' }}
      >
        <div className="flex items-center gap-8 text-[11px] font-bold text-text-secondary uppercase tracking-widest">
          <Link to="/orders" className="flex items-center gap-2 hover:text-text-main transition-colors">
            <FaBoxOpen size={12} className="text-blue-500" />
            {t('trackOrder')}
          </Link>
          <Link to="/contact" className="flex items-center gap-2 hover:text-text-main transition-colors">
            <FaHeadset size={12} className="text-blue-500" />
            {t('helpCenter')}
          </Link>
          <Link to="/wishlist" className="flex items-center gap-2 hover:text-text-main transition-colors">
            <FaBoxOpen size={12} className="text-blue-500" />
            {t('wishlist')}
          </Link>
        </div>
        
        <div className="flex items-center gap-6 border-l border-border-main pl-8">
           <Dropdown align="right" trigger={
              <span className="flex items-center gap-1.5 text-[11px] font-black text-text-secondary uppercase tracking-widest hover:text-text-main transition-colors">
                {currentCur.code} {currentCur.symbol}
                <FaChevronDown size={8} />
              </span>
            }>
              {(close) => (
                <div className="bg-bg-card border border-border-main rounded-xl overflow-hidden py-1 min-w-[100px] shadow-2xl">
                  {CURRENCIES.map(cur => (
                    <button 
                      key={cur.code}
                      onClick={() => { setCurrency(cur.code); close(); }}
                      className="w-full flex items-center justify-between px-4 py-2 hover:bg-bg-surface transition-colors text-text-secondary hover:text-text-main text-[11px] font-bold"
                    >
                      <span>{cur.code}</span>
                      <span className="opacity-40">{cur.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </Dropdown>

            <Dropdown align="right" trigger={
              <span className="flex items-center gap-1.5 text-[11px] font-black text-text-secondary uppercase tracking-widest hover:text-text-main transition-colors">
                {currentLang.code}
                <FaChevronDown size={8} />
              </span>
            }>
              {(close) => (
                <div className="bg-bg-card border border-border-main rounded-xl overflow-hidden py-1 min-w-[120px] shadow-2xl">
                  {LANGUAGES.map(lang => (
                    <button 
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); close(); }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-bg-surface transition-colors text-text-secondary hover:text-text-main text-[11px] font-bold"
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
