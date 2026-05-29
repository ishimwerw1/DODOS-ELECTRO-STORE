import { Link } from 'react-router-dom';
import { FaArrowRight, FaTag } from 'react-icons/fa';
import { motion } from 'framer-motion';

/**
 * PromoBanner — large full-width promotional image banner.
 * Height: ~420px with ~3.5cm (56px) padding top and bottom.
 */
const PromoBanner = ({
  image,
  tag      = 'Special Offer',
  title    = 'Exclusive Deals',
  subtitle = "Limited time — don't miss out on the season's hottest deals!",
  cta      = 'Shop Now',
  ctaLink  = '/products',
  align    = 'left',
  overlay  = 0.52,
}) => {
  if (!image) return null;

  const isCenter = align === 'center';

  return (
    <Link
      to={ctaLink}
      className="block relative w-full rounded-[2rem] overflow-hidden shadow-2xl group"
      style={{ height: '450px' }}
    >
      {/* Full-bleed background image */}
      <div className="absolute inset-0 bg-slate-900">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-1000 ease-out opacity-80"
        />
      </div>

      {/* Modern Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: isCenter
            ? `radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)`
            : `linear-gradient(to right, 
                rgba(0,0,0,0.8) 0%, 
                rgba(0,0,0,0.4) 40%, 
                transparent 100%)`,
        }}
      />

      {/* Content Container */}
      <div
        className={`relative z-10 h-full flex flex-col justify-center px-10 md:px-20 ${
          isCenter ? 'items-center text-center' : 'items-start text-left'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl"
        >
          {/* Tag pill */}
          {tag && (
            <div className="inline-flex items-center gap-2 bg-green-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-full mb-6 shadow-xl shadow-green-500/30">
              <FaTag size={8} /> {tag}
            </div>
          )}

          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[0.95] tracking-tighter mb-6 drop-shadow-2xl">
            {title.split(' ').map((word, i) => (
              <span key={i} className={i % 2 === 1 ? 'text-green-400' : ''}>
                {word}{' '}
              </span>
            ))}
          </h2>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-base md:text-xl text-slate-200/90 mb-10 max-w-xl font-medium leading-relaxed drop-shadow-md">
              {subtitle}
            </p>
          )}

          {/* CTA button */}
          <div className="inline-flex items-center gap-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] px-10 py-5 rounded-2xl transition-all shadow-2xl hover:bg-green-500 hover:text-white group-hover:scale-105 active:scale-95">
            {cta}
            <FaArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-500/20 rounded-full blur-[100px] pointer-events-none" />
    </Link>
  );
};

export default PromoBanner;
