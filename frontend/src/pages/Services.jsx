import {
  FaTools, FaBatteryFull, FaMicrochip, FaChargingStation,
  FaTruck, FaCertificate, FaClock, FaCheckCircle,
  FaMobileAlt, FaUserCheck, FaChevronRight,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Services = () => {
  const phoneBrands = ['iPhone', 'Samsung', 'Pixel', 'Tecno', 'Infinix', 'Sony', 'Oppo', 'And more...'];

  const servicesList = [
    {
      title: 'Screen & Glass Replacement',
      description: 'High-quality glass for all major brands. Expert technicians available on-site for professional installation.',
      icon: FaMobileAlt,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      features: ['Precision Installation', 'Scratch Resistant', 'OLED/LCD Quality'],
    },
    {
      title: 'Phone Battery Services',
      description: 'Genuine phone batteries to restore your device\'s original power life. Fast replacement service.',
      icon: FaBatteryFull,
      color: 'text-green-500',
      bg: 'bg-green-50',
      features: ['Genuine Batteries', 'Quick Replacement', 'Longer Life'],
    },
    {
      title: 'Hardware & Motherboard Repairs',
      description: 'We sell and repair phone boards and complex internal components with precision.',
      icon: FaMicrochip,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      features: ['Motherboard Sales', 'IC Replacement', 'Circuit Repair'],
    },
    {
      title: 'Charging Port Solutions',
      description: 'Fix charging issues instantly. We sell charging ports and offer expert replacement for all models.',
      icon: FaChargingStation,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      features: ['Fast Charging Ports', 'Type-C & Lightning', 'On-site Fix'],
    },
    {
      title: 'Professional Technician Equipment',
      description: 'Leading supplier of professional tools for mobile technicians. High-quality equipment for precise repairs.',
      icon: FaTools,
      color: 'text-red-500',
      bg: 'bg-red-50',
      features: ['Repair Kits', 'Soldering Stations', 'Testing Tools'],
    },
    {
      title: 'Premium Chargers & Accessories',
      description: 'Original chargers and high-speed cables that are safe for your device. Never run out of power.',
      icon: FaCheckCircle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
      features: ['Original Brands', 'Fast Charging', 'Warranty Included'],
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-16">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <FaChevronRight size={8} />
          <span className="text-gray-700">Services</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="bg-gray-900 text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Professional <span className="text-green-400">Repair Services</span>
          </h1>
          <p className="text-gray-400 text-base max-w-2xl mx-auto mb-8">
            DODOS ELECTRO STORE LTD — your trusted partner for premium phone parts, professional repairs, and expert technician equipment.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: FaClock,       label: '4+ Years Experience' },
              { icon: FaCertificate, label: 'RDB Approved' },
              { icon: FaTruck,       label: 'Free Delivery' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold">
                <item.icon className="text-green-400" size={14} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brands strip ── */}
      <section className="bg-green-500 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 md:gap-12">
          {phoneBrands.map((brand, i) => (
            <span key={i} className="text-lg font-black text-white/70 hover:text-white transition-colors">{brand}</span>
          ))}
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-1 h-6 bg-green-500 rounded-full" />
            <h2 className="text-2xl font-black text-gray-900">Our Services</h2>
            <div className="w-1 h-6 bg-green-500 rounded-full" />
          </div>
          <p className="text-gray-500 text-sm">Comprehensive solutions for all your phone needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {servicesList.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-green-200 transition-all group"
            >
              <div className={`w-12 h-12 ${service.bg} rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform`}>
                <service.icon className={service.color} size={22} />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <FaCheckCircle className="text-green-500 flex-shrink-0" size={11} />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Why Trust DODOS ── */}
      <section className="max-w-7xl mx-auto px-4 pb-4">
        <div className="bg-gray-900 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-6 sm:p-10 lg:p-14">
              <h2 className="text-3xl font-black text-white mb-8">Why Trust <span className="text-green-400">DODOS?</span></h2>
              <div className="space-y-7">
                {[
                  { icon: FaUserCheck,   title: 'Expert Technicians',    desc: 'Over four years of specialized experience in high-precision phone repairs.' },
                  { icon: FaCertificate, title: 'RDB Approved Quality',  desc: 'Legally certified business ensuring all products meet national standards.' },
                  { icon: FaBatteryFull, title: 'Full Stock Guaranteed', desc: 'Full inventory of parts and tools — no waiting for the repairs you need.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center text-white">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-green-500/10 flex items-center justify-center p-10 lg:p-14 relative">
              <div className="text-center relative z-10">
                <div className="text-7xl font-black text-green-400 mb-2">FREE</div>
                <div className="text-2xl font-black text-white uppercase tracking-widest">Delivery</div>
                <p className="text-gray-400 mt-4 max-w-xs mx-auto text-sm">Free delivery for all repair parts and technician equipment across the region.</p>
                <Link to="/contact" className="inline-block mt-8 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-black text-sm transition-all">
                  Book a Service
                </Link>
              </div>
              <FaTruck className="absolute bottom-8 right-8 text-green-500/10 text-[160px] -rotate-12" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
