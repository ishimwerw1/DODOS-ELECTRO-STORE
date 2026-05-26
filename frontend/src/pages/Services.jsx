import React from 'react';
import { 
  FaTools, FaBatteryFull, FaMicrochip, FaChargingStation, 
  FaTruck, FaCertificate, FaClock, FaCheckCircle, 
  FaMobileAlt, FaUserCheck 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Services = () => {
  const phoneBrands = [
    'iPhone', 'Samsung', 'Pixel', 'Techno', 
    'Z1 Redmi', 'Sony', 'Oppo', 'And many more...'
  ];

  const servicesList = [
    {
      title: 'Premium Screen & Glass Replacement',
      description: 'We sell high-quality glass for all major brands. Our expert technicians are available on-site to provide professional installation for a perfect fit.',
      icon: <FaMobileAlt className="text-primary" />,
      features: ['Precision Installation', 'Scratch Resistant', 'OLED/LCD Quality']
    },
    {
      title: 'Phone Battery Services',
      description: 'Is your battery draining fast? We sell and install genuine phone batteries to restore your device\'s original power life.',
      icon: <FaBatteryFull className="text-green-500" />,
      features: ['Genuine Batteries', 'Quick Replacement', 'Longer Life']
    },
    {
      title: 'Hardware & Motherboard Repairs',
      description: 'We sell and repair phone boards and complex internal components. Our team handles delicate repairs with precision.',
      icon: <FaMicrochip className="text-blue-500" />,
      features: ['Motherboard Sales', 'IC Replacement', 'Circuit Repair']
    },
    {
      title: 'Charging Port Solutions',
      description: 'Fix your charging issues instantly. We sell charging ports and offer expert replacement services for all models.',
      icon: <FaChargingStation className="text-orange-500" />,
      features: ['Fast Charging Ports', 'Type-C & Lightning', 'On-site Fix']
    },
    {
      title: 'Professional Technician Equipment',
      description: 'We are the leading supplier of professional tools for mobile technicians. High-quality equipment for precise repairs.',
      icon: <FaTools className="text-purple-500" />,
      features: ['Repair Kits', 'Soldering Stations', 'Testing Tools']
    },
    {
      title: 'Premium Chargers & Accessories',
      description: 'Never run out of power. We sell original chargers and high-speed cables that are safe for your device.',
      icon: <FaCheckCircle className="text-yellow-500" />,
      features: ['Original Brands', 'Fast Charging', 'Warranty Included']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="bg-dark text-white py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter uppercase">
            Professional <span className="text-primary">Repair Services</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            DODOS ELECTRO STORE LTD is your trusted partner for premium phone parts, professional repairs, and expert technician equipment.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-2xl border border-white/10">
              <FaClock className="text-primary" />
              <span className="font-bold text-sm">4+ Years Experience</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-2xl border border-white/10">
              <FaCertificate className="text-primary" />
              <span className="font-bold text-sm">RDB Approved</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-2xl border border-white/10">
              <FaTruck className="text-primary" />
              <span className="font-bold text-sm">Free Delivery</span>
            </div>
          </div>
        </div>
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </section>

      {/* Brands Section */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4">
          <p className="text-center font-black text-black uppercase tracking-widest mb-8">We specialize in all major brands</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {phoneBrands.map((brand, index) => (
              <span key={index} className="text-2xl font-black text-black/40 hover:text-black transition-colors cursor-default">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((service, index) => (
            <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-primary transition-all">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">{service.title}</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">{service.description}</p>
              <ul className="space-y-3">
                {service.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2 text-sm font-bold text-dark">
                    <FaCheckCircle className="text-primary text-xs" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-dark rounded-[40px] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 lg:p-20">
              <h2 className="text-4xl font-black text-white mb-8 uppercase">Why Trust <span className="text-primary">DODOS?</span></h2>              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-xl text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                    <FaUserCheck />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Expert Technicians</h4>
                    <p className="text-gray-400">Our team has over four years of specialized experience in high-precision phone repairs and part replacements.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-xl text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                    <FaCertificate />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">RDB Approved Quality</h4>
                    <p className="text-gray-400">We are a legally certified business with an RDB certificate, ensuring all our products and services meet national standards.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-xl text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                    <FaBatteryFull />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Full Stock Guaranteed</h4>
                    <p className="text-gray-400">We maintain a full inventory of parts and tools, so you never have to wait for the repairs you need.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 flex items-center justify-center p-12 lg:p-20 relative">
              <div className="text-center relative z-10">
                <div className="text-8xl font-black text-primary mb-4">FREE</div>
                <div className="text-3xl font-black text-white uppercase tracking-widest">Delivery</div>
                <p className="text-gray-400 mt-6 max-w-xs mx-auto">We provide free delivery services for all our repair parts and technician equipment across the region.</p>
                <Link to="/contact" className="inline-block mt-10 bg-primary text-black px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-primary-dark transition-all transform hover:-translate-y-1">
                  BOOK A SERVICE
                </Link>
              </div>
              <FaTruck className="absolute bottom-10 right-10 text-primary/10 text-[200px] -rotate-12" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;