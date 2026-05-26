// pages/About.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaCheckCircle,
  FaShieldAlt,
  FaTruck,
  FaHeadset,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaStore,
  FaMicrochip,
  FaToolbox,
  FaShoppingBag,
  FaGem,
  FaRegHeart,
  FaTag,
} from 'react-icons/fa';

const About = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const offerings = [
    { icon: <FaGem />, title: 'Premium Accessories', desc: 'Stylish and durable accessories to protect your device with elegance.' },
    { icon: <FaMicrochip />, title: 'High-Quality Parts', desc: 'Genuine and reliable replacement parts for your phone.' },
    { icon: <FaToolbox />, title: 'Repair Tools', desc: 'Professional tools for technicians and phone repair enthusiasts.' },
    { icon: <FaShoppingBag />, title: 'Easy Shopping', desc: 'Simple, secure and convenient online shopping experience.' },
    { icon: <FaTruck />, title: 'Fast & Secure Delivery', desc: 'We ensure your orders are delivered safely and on time.' },
    { icon: <FaHeadset />, title: 'Customer Support', desc: 'Our team is always ready to help you with any questions.' },
  ];

  const benefits = [
    { icon: <FaShieldAlt />, title: 'Reliable & Durable Products', desc: 'We sell only quality products you can trust.' },
    { icon: <FaTag />, title: 'Affordable Pricing', desc: 'Best quality at prices that fit your budget.' },
    { icon: <FaRegHeart />, title: 'Trusted by Customers', desc: 'Hundreds of happy customers across Rwanda.' },
    { icon: <FaHeadset />, title: 'Fast Customer Assistance', desc: 'Quick responses and support when you need it.' },
    { icon: <FaStore />, title: 'Wide Range of Products', desc: 'Everything you need for your phone in one place.' },
    { icon: <FaCheckCircle />, title: '100% Satisfaction', desc: 'Your satisfaction is our top priority.' },
  ];

  const stats = [
    { value: '500+', label: 'Happy Customers' },
    { value: '1000+', label: 'Products Sold' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Support Available' },
    { value: 'Same Day', label: 'Delivery in Kigali' },
  ];

  return (
    <div className="bg-black text-gray-200 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#050a15] to-[#0a0f1c] z-0" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full blur-[120px] opacity-20 z-0" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full blur-[120px] opacity-10 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6"
          >
            <FaStore className="text-blue-400 text-sm" />
            <span className="text-xs font-semibold tracking-wide text-blue-300">About DODOS Electro Store</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent"
          >
            Rwanda's #1 Trusted Store
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            Premium phone accessories, replacement parts and repair tools.
            <br className="hidden md:block" />
            High-quality, durable and affordable products for your phone.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center mt-10"
          >
            <Link
              to="/products"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/30 flex items-center gap-2"
            >
              <FaShoppingBag /> Shop Now
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
            >
              <FaHeadset /> Contact Support
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 md:py-20 border-y border-white/5 bg-[#05080f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Empowering Your Phone Experience</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              At DODOS Electro Store, we believe everyone deserves access to high-quality phone accessories and repair solutions.
              That's why we're committed to offering products that help you protect, repair and upgrade your phone with confidence.
              From durable cases to professional-grade tools, every item in our store is carefully selected to meet your needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-blue-400 text-sm font-bold uppercase tracking-wider bg-blue-400/10 border border-blue-400/20 rounded-full px-4 py-1.5 inline-block mb-4">
              What We Offer
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Everything You Need Under One Roof</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mt-4">Comprehensive solutions for all your phone needs</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {offerings.map((item, idx) => (
              <div
                key={idx}
                className="group relative bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-5 text-blue-400 text-xl group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-[#05080f] to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-blue-400 text-sm font-bold uppercase tracking-wider bg-blue-400/10 border border-blue-400/20 rounded-full px-4 py-1.5 inline-block mb-4">
              Why Customers Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Trusted by Hundreds Across Rwanda</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mt-4">Quality, affordability, and service you can count on</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-16">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div className="text-2xl md:text-3xl font-black text-blue-400">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="text-blue-400 mt-1 text-lg">{benefit.icon}</div>
                <div>
                  <h4 className="font-bold text-white mb-1">{benefit.title}</h4>
                  <p className="text-sm text-gray-500">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Location */}
            <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                  <FaMapMarkerAlt size={18} />
                </div>
                <h3 className="text-2xl font-bold text-white">Our Location</h3>
              </div>
              <div className="space-y-4 text-gray-300">
                <p className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1"><FaMapMarkerAlt size={14} /></span>
                  <span>Rwanda – Kigali City<br />TCB Building, Floor 01, Door 013</span>
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                  <FaHeadset size={18} />
                </div>
                <h3 className="text-2xl font-bold text-white">Contact Information</h3>
              </div>
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <FaPhoneAlt className="text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                    <a href="tel:+250783211453" className="text-white font-medium hover:text-blue-400 transition">0783 211 453</a>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <FaEnvelope className="text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                    <a href="mailto:dodoselectrostore@gmail.com" className="text-white font-medium hover:text-blue-400 transition break-all">dodoselectrostore@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <FaClock className="text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Working Hours</p>
                    <p className="text-white">Mon – Sat: 8:00 AM – 7:00 PM</p>
                    <p className="text-gray-400 text-sm">Sunday: 9:00 AM – 5:00 PM</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex gap-3">
                <Link to="/contact" className="flex-1 text-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition">
                  Send Message
                </Link>
                <a href="tel:+250783211453" className="flex-1 text-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition">
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 border-t border-white/5 bg-gradient-to-t from-blue-900/5 to-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to upgrade your phone experience?</h3>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            Visit our store in Kigali or shop online for fast delivery across Rwanda.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/products"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/30"
            >
              Browse Products
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all duration-300"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;