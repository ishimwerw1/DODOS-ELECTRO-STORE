import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaCheckCircle, FaShieldAlt, FaTruck, FaHeadset,
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock,
  FaStore, FaMicrochip, FaToolbox, FaShoppingBag,
  FaGem, FaRegHeart, FaTag, FaChevronRight,
} from 'react-icons/fa';

const About = () => {
  const offerings = [
    { icon: FaGem,      title: 'Premium Accessories',    desc: 'Stylish and durable accessories to protect your device with elegance.' },
    { icon: FaMicrochip,title: 'High-Quality Parts',     desc: 'Genuine and reliable replacement parts for your phone.' },
    { icon: FaToolbox,  title: 'Repair Tools',           desc: 'Professional tools for technicians and phone repair enthusiasts.' },
    { icon: FaShoppingBag, title: 'Easy Shopping',       desc: 'Simple, secure and convenient online shopping experience.' },
    { icon: FaTruck,    title: 'Fast & Secure Delivery', desc: 'We ensure your orders are delivered safely and on time.' },
    { icon: FaHeadset,  title: 'Customer Support',       desc: 'Our team is always ready to help you with any questions.' },
  ];

  const benefits = [
    { icon: FaShieldAlt,    title: 'Reliable & Durable Products', desc: 'We sell only quality products you can trust.' },
    { icon: FaTag,          title: 'Affordable Pricing',          desc: 'Best quality at prices that fit your budget.' },
    { icon: FaRegHeart,     title: 'Trusted by Customers',        desc: 'Hundreds of happy customers across Rwanda.' },
    { icon: FaHeadset,      title: 'Fast Customer Assistance',    desc: 'Quick responses and support when you need it.' },
    { icon: FaStore,        title: 'Wide Range of Products',      desc: 'Everything you need for your phone in one place.' },
    { icon: FaCheckCircle,  title: '100% Satisfaction',           desc: 'Your satisfaction is our top priority.' },
  ];

  const stats = [
    { value: '500+',     label: 'Happy Customers' },
    { value: '1000+',    label: 'Products Sold' },
    { value: '98%',      label: 'Satisfaction Rate' },
    { value: '24/7',     label: 'Support Available' },
    { value: 'Same Day', label: 'Delivery in Kigali' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <FaChevronRight size={8} />
          <span className="text-gray-700">About Us</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="bg-gray-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-5"
          >
            <FaStore className="text-green-400 text-sm" />
            <span className="text-xs font-semibold tracking-wide text-green-300">About DODOS Electro Store</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-6xl font-black mb-5 text-white"
          >
            Rwanda's #1 Trusted Store
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto mb-8"
          >
            Premium phone accessories, replacement parts and repair tools — high-quality, durable and affordable.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <Link to="/products" className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm">
              <FaShoppingBag size={14} /> Shop Now
            </Link>
            <Link to="/contact" className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-sm">
              <FaHeadset size={14} /> Contact Support
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-2xl font-black text-green-600">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-14 px-4 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-1 h-6 bg-green-500 rounded-full" />
            <h2 className="text-2xl font-black text-gray-900">Empowering Your Phone Experience</h2>
            <div className="w-1 h-6 bg-green-500 rounded-full" />
          </div>
          <p className="text-gray-500 text-base leading-relaxed">
            At DODOS Electro Store, we believe everyone deserves access to high-quality phone accessories and repair solutions.
            From durable cases to professional-grade tools, every item in our store is carefully selected to meet your needs.
          </p>
        </div>
      </section>

      {/* ── What We Offer ── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-green-600 text-xs font-bold uppercase tracking-wider bg-green-50 border border-green-100 rounded-full px-4 py-1.5 inline-block mb-3">What We Offer</span>
            <h2 className="text-2xl font-black text-gray-900">Everything You Need Under One Roof</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offerings.map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-green-200 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center mb-4 text-green-500 text-lg group-hover:bg-green-500 group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-green-600 text-xs font-bold uppercase tracking-wider bg-green-50 border border-green-100 rounded-full px-4 py-1.5 inline-block mb-3">Why Customers Choose Us</span>
            <h2 className="text-2xl font-black text-gray-900">Trusted by Hundreds Across Rwanda</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all">
                <div className="text-green-500 mt-0.5 text-lg flex-shrink-0">{benefit.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm">{benefit.title}</h4>
                  <p className="text-xs text-gray-500">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Location & Contact ── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500"><FaMapMarkerAlt size={16} /></div>
              <h3 className="text-lg font-black text-gray-900">Our Location</h3>
            </div>
            <p className="flex items-start gap-3 text-gray-600 text-sm">
              <FaMapMarkerAlt className="text-green-500 mt-0.5 flex-shrink-0" size={13} />
              Rwanda – Kigali City · TCB Building, Floor 01, Door 013
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500"><FaHeadset size={16} /></div>
              <h3 className="text-lg font-black text-gray-900">Contact Information</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: FaPhoneAlt, label: 'Phone', value: '0783 211 453', href: 'tel:+250783211453' },
                { icon: FaEnvelope, label: 'Email', value: 'dodoselectrostore@gmail.com', href: 'mailto:dodoselectrostore@gmail.com' },
                { icon: FaClock,    label: 'Hours', value: 'Mon–Sat: 8AM–7PM · Sun: 9AM–5PM', href: null },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <item.icon className="text-green-500 flex-shrink-0" size={13} />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-semibold text-gray-800 hover:text-green-600 transition-colors">{item.value}</a>
                    ) : (
                      <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <Link to="/contact" className="flex-1 text-center px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-all">Send Message</Link>
              <a href="tel:+250783211453" className="flex-1 text-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all">Call Now</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 px-4 bg-green-600">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-black text-white mb-3">Ready to upgrade your phone experience?</h3>
          <p className="text-green-100 mb-7 text-sm">Visit our store in Kigali or shop online for fast delivery across Rwanda.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/products" className="px-7 py-3 bg-white text-green-600 font-black rounded-xl hover:bg-green-50 transition-all text-sm">Browse Products</Link>
            <Link to="/contact" className="px-7 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl transition-all text-sm">Get in Touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
