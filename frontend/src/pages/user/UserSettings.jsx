import { useState, useEffect } from 'react';
import { 
  FaUser, FaLock, FaBell, FaPalette, FaMapMarkerAlt, 
  FaGlobe, FaMoneyBillWave, FaPhone, 
  FaEnvelope, FaCamera,
  FaPlus, FaChevronRight, FaHistory, FaHeart,
  FaShieldAlt, FaKey, FaLaptop, FaMobileAlt, FaUndo,
  FaShoppingCart, FaTicketAlt, FaQuestionCircle, FaSignOutAlt,
  FaMoon, FaSun, FaUserShield
} from 'react-icons/fa';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const UserSettings = () => {
  const { user, updateProfile: updateAuthUser, logout } = useAuth();
  const { formatPrice, t } = useLocale();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: '15 Jan 1995', 
    gender: 'Male',
    profilePicture: user?.profilePicture || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: user?.notifications?.orderUpdates ?? true,
    promotions: user?.notifications?.promotions ?? true,
    newArrivals: user?.notifications?.newArrivals ?? true,
    priceDrops: user?.notifications?.priceDrops ?? true,
    methods: user?.notifications?.methods ?? {
      sms: false,
      email: true,
      inApp: true
    }
  });

  const [privacy, setAccountPrivacy] = useState({
    profileVisibility: 'Public',
    showEmail: true,
    showPhone: false,
    showOrderHistory: true,
    showWishlist: true
  });

  const [prefData, setPrefData] = useState({
    language: 'English',
    currency: 'USD - US Dollar',
    theme: theme
  });

  const menuItems = [
    { id: 'overview', label: 'Account Overview', icon: FaUserShield },
    { id: 'edit-profile', label: 'Edit Profile', icon: FaUser },
    { id: 'change-password', label: 'Change Password', icon: FaLock },
    { id: 'email-address', label: 'Email Address', icon: FaEnvelope },
    { id: 'phone-number', label: 'Phone Number', icon: FaPhone },
    { id: 'shipping-address', label: 'Shipping Address', icon: FaMapMarkerAlt },
    { id: 'billing-address', label: 'Billing Address', icon: FaMoneyBillWave },
    { id: 'payment-methods', label: 'Saved Payment Methods', icon: FaLock },
    { id: 'order-history', label: 'Order History', icon: FaHistory },
    { id: 'wishlist', label: 'Wishlist', icon: FaHeart },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'account-privacy', label: 'Account Privacy', icon: FaShieldAlt },
    { id: 'lang-curr', label: 'Language & Currency', icon: FaGlobe },
    { id: 'dark-light', label: 'Dark/Light Mode', icon: theme === 'Dark' ? FaMoon : FaSun },
    { id: 'security-2fa', label: 'Security (2FA)', icon: FaShieldAlt },
    { id: 'sessions', label: 'Login Sessions / Devices', icon: FaLaptop },
    { id: 'returns', label: 'Return & Refund Requests', icon: FaUndo },
    { id: 'saved-carts', label: 'Saved Carts', icon: FaShoppingCart },
    { id: 'coupons', label: 'Coupons & Gift Cards', icon: FaTicketAlt },
    { id: 'support', label: 'Support / Help Center', icon: FaQuestionCircle },
  ];

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setPrefData(prev => ({ ...prev, theme: newTheme }));
    toast.success(`${newTheme} mode enabled!`);
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const res = await authAPI.updateProfile(profileData);
      updateAuthUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      const res = await authAPI.updateProfile({ notifications });
      updateAuthUser(res.data.user);
      toast.success('Notification settings updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update notifications');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      setLoading(true);
      await authAPI.updateProfile({ 
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword 
      });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper Components
  const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-black text-text-main tracking-tight">{title}</h2>
      {subtitle && <p className="text-text-secondary text-sm mt-1">{subtitle}</p>}
    </div>
  );

  const InputField = ({ label, type = 'text', value, onChange, placeholder, disabled = false, icon: Icon }) => (
    <div className="space-y-2">
      <label className="block text-[11px] font-black text-text-secondary uppercase tracking-widest">{label}</label>
      <div className="relative group">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-[#0d6efd] transition-colors" />}
        <input 
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-bg-main border border-border-main rounded-xl ${Icon ? 'pl-11' : 'px-5'} py-4 text-sm text-text-main focus:border-[#0d6efd]/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      </div>
    </div>
  );

  const Toggle = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4 border-b border-border-main last:border-0 group">
      <div>
        <p className="font-bold text-text-main group-hover:text-[#0d6efd] transition-colors">{label}</p>
        {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${
          enabled ? 'bg-[#0d6efd]' : 'bg-bg-surface'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const PrimaryButton = ({ label, onClick, icon: Icon, disabled, type = 'button', danger = false }) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#0d6efd] hover:bg-blue-600'} text-white py-4 rounded-xl font-black uppercase tracking-[0.15em] text-[11px] transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <SectionHeader title="Account Overview" subtitle="Manage your account settings and preferences" />
      <div className="bg-bg-card border border-border-main rounded-2xl p-8 flex items-center gap-6">
        <div className="w-20 h-20 bg-gradient-to-br from-[#0d6efd] to-purple-600 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl">
          {user?.fullName?.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-black text-text-main">{user?.fullName}</h3>
          <p className="text-text-secondary text-sm">{user?.email}</p>
          <p className="text-[10px] text-text-secondary/60 font-black uppercase tracking-widest mt-2">Member since Jan 2024</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {[
          { icon: FaUser, title: 'Profile Information', desc: 'Update your personal details', target: 'edit-profile' },
          { icon: FaShieldAlt, title: 'Security', desc: 'Manage password and security settings', target: 'change-password' },
          { icon: FaMapMarkerAlt, title: 'Addresses', desc: 'Manage your shipping and billing addresses', target: 'shipping-address' },
          { icon: FaMoneyBillWave, title: 'Payments', desc: 'Manage your saved payment methods', target: 'payment-methods' },
          { icon: FaHistory, title: 'Orders', desc: 'View your order history and details', target: 'order-history' },
          { icon: FaPalette, title: 'Preferences', desc: 'Manage your account preferences', target: 'dark-light' },
          { icon: FaQuestionCircle, title: 'Support', desc: 'Get help and contact support', target: 'support' },
        ].map((item, i) => (
          <button key={i} onClick={() => setActiveSection(item.target)} className="w-full bg-bg-card border border-border-main rounded-2xl p-6 flex items-center justify-between group hover:border-[#0d6efd]/30 transition-all text-left">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-bg-surface rounded-xl flex items-center justify-center text-text-secondary group-hover:bg-[#0d6efd] group-hover:text-white transition-all"><item.icon size={18} /></div>
              <div><p className="font-bold text-text-main group-hover:text-[#0d6efd] transition-colors">{item.title}</p><p className="text-xs text-text-secondary mt-0.5">{item.desc}</p></div>
            </div>
            <FaChevronRight className="text-text-secondary/30 group-hover:text-[#0d6efd] transition-all" size={12} />
          </button>
        ))}
      </div>
    </div>
  );

  const renderEditProfile = () => (
    <div className="space-y-8">
      <SectionHeader title="Edit Profile" subtitle="Update your personal information" />
      <div className="flex items-center gap-8 mb-10">
        <div className="w-24 h-24 bg-bg-main border border-border-main rounded-[2rem] flex items-center justify-center text-text-secondary overflow-hidden relative group">
          {profileData.profilePicture ? <img src={profileData.profilePicture} className="w-full h-full object-cover" alt="Profile" /> : <FaUser size={32} />}
        </div>
        <div className="space-y-3">
          <p className="text-[11px] font-black text-text-secondary uppercase tracking-widest">Profile Photo</p>
          <button className="bg-bg-surface hover:bg-bg-surface/80 text-text-main px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-border-main transition-all">Change Photo</button>
        </div>
      </div>
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <InputField label="Full Name" value={profileData.fullName} onChange={(e) => setProfileData({...profileData, fullName: e.target.value})} placeholder="Dodos Electro Store" />
        <InputField label="Username" value={profileData.username} onChange={(e) => setProfileData({...profileData, username: e.target.value})} placeholder="dodos_electro" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Date of Birth" type="date" value={profileData.dob} onChange={(e) => setProfileData({...profileData, dob: e.target.value})} />
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-text-secondary uppercase tracking-widest">Gender</label>
            <select value={profileData.gender} onChange={(e) => setProfileData({...profileData, gender: e.target.value})} className="w-full bg-bg-main border border-border-main rounded-xl px-5 py-4 text-sm text-text-main focus:border-[#0d6efd]/50 outline-none transition-all appearance-none">
              <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="pt-4"><PrimaryButton label="Save Changes" type="submit" disabled={loading} /></div>
      </form>
    </div>
  );

  const renderDarkLight = () => (
    <div className="space-y-8">
      <SectionHeader title="Dark/Light Mode" subtitle="Choose your preferred theme" />
      <div className="grid grid-cols-1 gap-4">
        {[
          { id: 'Light', label: 'Light Mode', desc: 'Use light theme', icon: FaSun },
          { id: 'Dark', label: 'Dark Mode', desc: 'Use dark theme', icon: FaMoon },
        ].map((t) => (
          <button key={t.id} onClick={() => handleThemeChange(t.id)} className={`w-full bg-bg-card border rounded-2xl p-6 flex items-center justify-between group transition-all ${theme === t.id ? 'border-[#0d6efd] shadow-[0_0_20px_rgba(13,110,253,0.1)]' : 'border-border-main hover:border-border-main/50'}`}>
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${theme === t.id ? 'bg-[#0d6efd] text-white' : 'bg-bg-surface text-text-secondary group-hover:text-text-main'}`}><t.icon size={18} /></div>
              <div className="text-left"><p className="font-bold text-text-main">{t.label}</p><p className="text-xs text-text-secondary mt-0.5">{t.desc}</p></div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${theme === t.id ? 'border-[#0d6efd]' : 'border-text-secondary/30'}`}>{theme === t.id && <div className="w-2.5 h-2.5 bg-[#0d6efd] rounded-full" />}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-8">
      <SectionHeader title="Notification Settings" subtitle="Control how and when you want to be notified" />
      
      <div className="bg-bg-card border border-border-main rounded-2xl p-8 space-y-6">
        <div>
          <h4 className="text-[11px] font-black text-text-secondary uppercase tracking-widest mb-4">Activity Notifications</h4>
          <div className="space-y-2">
            <Toggle 
              label="Order Updates" 
              description="Get notified about your order status changes" 
              enabled={notifications.orderUpdates} 
              onChange={(val) => setNotifications({...notifications, orderUpdates: val})} 
            />
            <Toggle 
              label="New Arrivals" 
              description="Be the first to know when we add new products" 
              enabled={notifications.newArrivals} 
              onChange={(val) => setNotifications({...notifications, newArrivals: val})} 
            />
            <Toggle 
              label="Price Drops" 
              description="Get alerts when products in your wishlist drop in price" 
              enabled={notifications.priceDrops} 
              onChange={(val) => setNotifications({...notifications, priceDrops: val})} 
            />
            <Toggle 
              label="Promotions" 
              description="Receive special offers and promotional deals" 
              enabled={notifications.promotions} 
              onChange={(val) => setNotifications({...notifications, promotions: val})} 
            />
          </div>
        </div>

        <div className="pt-6 border-t border-border-main">
          <h4 className="text-[11px] font-black text-text-secondary uppercase tracking-widest mb-4">Notification Methods</h4>
          <div className="space-y-2">
            <Toggle 
              label="In-App Notifications" 
              description="Show notifications in the app dashboard" 
              enabled={notifications.methods.inApp} 
              onChange={(val) => setNotifications({...notifications, methods: {...notifications.methods, inApp: val}})} 
            />
            <Toggle 
              label="Email Notifications" 
              description="Send notifications to your registered email" 
              enabled={notifications.methods.email} 
              onChange={(val) => setNotifications({...notifications, methods: {...notifications.methods, email: val}})} 
            />
            <Toggle 
              label="SMS Notifications" 
              description="Send alerts to your phone number" 
              enabled={notifications.methods.sms} 
              onChange={(val) => setNotifications({...notifications, methods: {...notifications.methods, sms: val}})} 
            />
          </div>
        </div>

        <div className="pt-6">
          <PrimaryButton 
            label="Save Notification Preferences" 
            onClick={handleSaveNotifications} 
            disabled={loading} 
            icon={FaBell} 
          />
        </div>
      </div>
    </div>
  );

  const handleGlobalSave = () => {
    switch (activeSection) {
      case 'edit-profile':
        handleUpdateProfile();
        break;
      case 'notifications':
        handleSaveNotifications();
        break;
      case 'change-password':
        // Password change is handled by its own form submit
        break;
      default:
        toast.info('No changes to save for this section');
    }
  };

  const SettingsHeader = ({ activeSectionLabel }) => (
    <div className="flex items-center justify-between mb-12 bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full group-hover:bg-blue-600/10 transition-all" />
      <div className="relative z-10 flex items-center gap-6">
        <div className="w-16 h-16 bg-gradient-to-br from-[#0d6efd] to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
          {menuItems.find(item => item.id === activeSection)?.icon({ size: 24 })}
        </div>
        <div>
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            <span>Settings</span>
            <FaChevronRight size={8} />
            <span className="text-blue-400">{activeSectionLabel}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">{activeSectionLabel}</h1>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-3">
        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-xl border border-white/5 transition-all">Discard</button>
        <button 
          onClick={handleGlobalSave}
          disabled={loading}
          className="px-6 py-3 bg-[#0d6efd] hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-blue-500/10 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    const section = menuItems.find(item => item.id === activeSection);
    
    return (
      <div className="space-y-8">
        <SettingsHeader activeSectionLabel={section?.label} />
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {(() => {
              switch (activeSection) {
                case 'overview': return renderOverview();
                case 'edit-profile': return renderEditProfile();
                case 'change-password': return renderChangePassword();
                case 'notifications': return renderNotifications();
                case 'dark-light': return renderDarkLight();
                case 'returns': return renderReturns();
                case 'saved-carts': return renderSavedCarts();
                case 'coupons': return renderCoupons();
                default: return (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-slate-500 mb-6">
                      {section?.icon({ size: 32 })}
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">{section?.label}</h3>
                    <p className="text-slate-500 text-sm max-w-xs">This section is currently under development. Please check back later.</p>
                  </div>
                );
              }
            })()}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  const renderChangePassword = () => (
    <div className="space-y-8">
      <SectionHeader title="Change Password" subtitle="Ensure your account is using a long, random password to stay secure." />
      <form onSubmit={handlePasswordChange} className="space-y-6">
        <InputField 
          label="Current Password" 
          type={showPassword ? 'text' : 'password'} 
          value={passwordData.currentPassword} 
          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} 
          placeholder="••••••••" 
          icon={FaLock}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            label="New Password" 
            type={showPassword ? 'text' : 'password'} 
            value={passwordData.newPassword} 
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
            placeholder="••••••••" 
            icon={FaKey}
          />
          <InputField 
            label="Confirm New Password" 
            type={showPassword ? 'text' : 'password'} 
            value={passwordData.confirmPassword} 
            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
            placeholder="••••••••" 
            icon={FaKey}
          />
        </div>
        <div className="flex items-center gap-2 px-1">
          <input 
            type="checkbox" 
            id="show-pass" 
            checked={showPassword} 
            onChange={() => setShowPassword(!showPassword)}
            className="w-4 h-4 rounded border-white/10 bg-[#05070a] text-[#0d6efd] focus:ring-[#0d6efd]/50 transition-all"
          />
          <label htmlFor="show-pass" className="text-xs text-slate-500 font-bold cursor-pointer">Show passwords</label>
        </div>
        <div className="pt-4">
          <PrimaryButton label="Update Password" type="submit" disabled={loading} icon={FaShieldAlt} />
        </div>
      </form>
    </div>
  );

  const renderReturns = () => (
    <div className="space-y-6">
      <SectionHeader title="Return & Refund Requests" subtitle="Track and manage your recent return requests" />
      <div className="bg-[#0a0d14] border border-white/5 rounded-3xl p-12 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-slate-500 mx-auto mb-6">
          <FaUndo size={32} />
        </div>
        <h3 className="text-xl font-black text-white mb-2">No Active Requests</h3>
        <p className="text-slate-500 text-sm mb-8">You haven't initiated any return or refund requests yet.</p>
        <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-xl border border-white/5 transition-all">
          Start a Return
        </button>
      </div>
    </div>
  );

  const renderSavedCarts = () => (
    <div className="space-y-6">
      <SectionHeader title="Saved Carts" subtitle="Review your previously saved shopping carts" />
      <div className="grid grid-cols-1 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#0a0d14] border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:border-[#0d6efd]/30 transition-all">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#0d6efd] group-hover:text-white transition-all">
                <FaShoppingCart size={20} />
              </div>
              <div>
                <p className="font-bold text-white group-hover:text-[#0d6efd] transition-colors">Saved Cart #{i}</p>
                <p className="text-xs text-slate-500 mt-0.5">3 items • Last updated 2 days ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Delete</button>
              <button className="px-4 py-2 bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all">Restore</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCoupons = () => (
    <div className="space-y-6">
      <SectionHeader title="Coupons & Gift Cards" subtitle="Manage your active discounts and gift card balance" />
      <div className="bg-gradient-to-br from-[#0d6efd] to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <FaTicketAlt size={20} />
            <span className="text-[11px] font-black uppercase tracking-widest opacity-70">Active Balance</span>
          </div>
          <h3 className="text-4xl font-black mb-1">$45.00</h3>
          <p className="text-white/60 text-xs font-medium">Expires in 30 days</p>
        </div>
      </div>
      <div className="bg-[#0a0d14] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
        <input 
          type="text" 
          placeholder="Enter coupon code..." 
          className="flex-1 bg-[#05070a] border border-white/5 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-[#0d6efd]/50 transition-all"
        />
        <button className="px-8 py-4 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">Apply</button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-bg-main">
      <aside className="w-[320px] border-r border-border-main bg-bg-main flex flex-col h-[calc(100vh-158px)] sticky top-[158px] z-20">
        <div className="p-8 border-b border-border-main flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0d6efd] rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-500/20">D</div>
            <h1 className="text-xl font-black tracking-tighter uppercase text-text-main">Settings</h1>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        </div>
        <nav className="flex-grow overflow-y-auto p-6 custom-scrollbar space-y-2">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mb-4 px-2">Account Control</p>
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveSection(item.id)} 
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group ${
                activeSection === item.id 
                  ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400' 
                  : 'text-text-secondary hover:bg-bg-surface hover:text-text-main border border-transparent'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={16} className={activeSection === item.id ? 'text-blue-400' : 'text-text-secondary group-hover:text-text-main transition-colors'} />
                <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              </div>
              {activeSection === item.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-border-main">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <FaSignOutAlt size={16} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="flex-grow p-12 overflow-y-auto bg-bg-main">
        <div className="max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default UserSettings;