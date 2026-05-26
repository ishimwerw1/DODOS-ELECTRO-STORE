import { useState, useEffect } from 'react';
import { 
  FaUser, FaCog, FaBell, FaPalette, FaShieldAlt, 
  FaGlobe, FaMoneyBillWave, FaSave, FaDatabase, 
  FaHistory, FaExclamationTriangle, FaTrash, FaLock,
  FaCamera, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEdit,
  FaWhatsapp, FaFacebook, FaInstagram, FaTwitter, FaYoutube,
  FaAndroid, FaApple, FaTags, FaPlus, FaCheck, FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { adminAPI, authAPI, productAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/dodos-logo.png';

const Settings = () => {
  const { user: authUser, updateProfile: updateAuthUser, refreshSettings } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    general: {
      storeName: 'DODOS ELECTRO STORE',
      storeDescription: 'Powering your Digital World',
      contactPhone: '+250 788 123 456',
      contactEmail: 'info@dodosphones.rw',
      location: 'Kigali, Rwanda',
      logoUrl: '',
      whatsappNumber: '+250788123456',
      socialLinks: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      },
      appLinks: {
        android: '',
        ios: ''
      }
    },
    currency: {
      defaultCurrency: 'RWF',
      symbol: 'RWF'
    },
    language: {
      defaultLanguage: 'English'
    },
    appearance: {
      themeMode: 'Light',
      primaryColor: '#FFD700',
      sidebarExpanded: true
    },
    notifications: {
      newOrders: true,
      lowStock: true,
      emailAlerts: false,
      smsAlerts: false
    },
    productStock: {
      lowStockThreshold: 5,
      defaultCategory: 'Other Accessories',
      autoUpdateStock: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginAlerts: true
    },
    preferences: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24-hour',
      defaultDashboard: 'Dashboard'
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileData, setProfileData] = useState({
    fullName: authUser?.fullName || '',
    email: authUser?.email || '',
    username: authUser?.username || '',
    phone: authUser?.phone || '',
    profilePicture: authUser?.profilePicture || ''
  });

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', image: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  // Sync profileData when authUser changes
  useEffect(() => {
    if (authUser) {
      setProfileData({
        fullName: authUser.fullName || '',
        email: authUser.email || '',
        username: authUser.username || '',
        phone: authUser.phone || '',
        profilePicture: authUser.profilePicture || ''
      });
    }
  }, [authUser]);

  useEffect(() => {
    fetchSettings();
    fetchCategories();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getSettings();
      if (res.data) setSettings(res.data);
    } catch (error) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await adminAPI.getAllCategories();
      setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return toast.error('Category name is required');
    if (!newCategory.image.trim()) return toast.error('Category image URL is required');
    
    try {
      // Generate slug from name
      const slug = newCategory.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      await adminAPI.createCategory({ ...newCategory, slug });
      toast.success('Category added successfully');
      setNewCategory({ name: '', image: '', description: '' });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminAPI.deleteCategory(id);
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleUpdateCategory = async (id, updatedData) => {
    try {
      await adminAPI.updateCategory(id, updatedData);
      toast.success('Category updated');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await adminAPI.updateSettings(settings);
      toast.success('✅ System settings saved successfully');
      refreshSettings(); // Sync global settings
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await authAPI.updateProfile(profileData);
      updateAuthUser(res.data.user);
      toast.success('✅ Admin profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      return toast.error('Please enter your current password');
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    try {
      setSaving(true);
      await authAPI.updateProfile({ 
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword 
      });
      toast.success('✅ Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (window.confirm('⚠️ Are you sure you want to reset all settings to default?')) {
      try {
        setLoading(true);
        await adminAPI.resetSettings();
        toast.success('Settings reset to default');
        fetchSettings();
      } catch (error) {
        toast.error('Reset failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: <FaCog /> },
    { id: 'categories', name: 'Categories', icon: <FaTags /> },
    { id: 'account', name: 'Account', icon: <FaUser /> },
    { id: 'notifications', name: 'Notifications', icon: <FaBell /> },
    { id: 'security', name: 'Security', icon: <FaShieldAlt /> },
    { id: 'data', name: 'Data & Backup', icon: <FaDatabase /> },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-3 block">Management Console</span>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              System <span className="text-gray-500">Settings</span>
            </h2>
          </div>
          
          <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-white text-black shadow-2xl' : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* General Store Settings */}
          {activeTab === 'general' && (
            <div className="space-y-8">
              <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <h4 className="text-xl font-black text-white mb-10 flex items-center gap-4 uppercase tracking-tighter">
                  <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                    <FaGlobe size={20} />
                  </div>
                  Identity & Contact
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">Store Logo</label>
                    <div className="flex items-center gap-8 p-6 bg-black rounded-3xl border border-white/10">
                      <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center p-3 shadow-2xl relative group overflow-hidden">
                        <img src={settings.general.logoUrl || logo} alt="Logo" className="max-h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <FaCamera className="text-white text-xl" />
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              if (file.size > 10 * 1024 * 1024) { // 10MB for logo is plenty
                                return toast.error('Logo should be less than 10MB for HD quality');
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSettings({...settings, general: {...settings.general, logoUrl: reader.result}});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="Or provide Logo Image URL"
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:border-white outline-none transition-all mb-3"
                          value={settings.general.logoUrl}
                          onChange={(e) => setSettings({...settings, general: {...settings.general, logoUrl: e.target.value}})}
                        />
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Click the box to upload or paste a high-quality transparent PNG URL</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">Store Display Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:border-white outline-none transition-all"
                      value={settings.general.storeName}
                      onChange={(e) => setSettings({...settings, general: {...settings.general, storeName: e.target.value}})}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">Store Tagline / Description</label>
                    <textarea 
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-white outline-none transition-all min-h-[120px] resize-none"
                      value={settings.general.storeDescription}
                      onChange={(e) => setSettings({...settings, general: {...settings.general, storeDescription: e.target.value}})}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">Official Phone</label>
                    <input 
                      type="tel" 
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:border-white outline-none transition-all"
                      value={settings.general.contactPhone}
                      onChange={(e) => setSettings({...settings, general: {...settings.general, contactPhone: e.target.value}})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">Official Email</label>
                    <input 
                      type="email" 
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:border-white outline-none transition-all"
                      value={settings.general.contactEmail}
                      onChange={(e) => setSettings({...settings, general: {...settings.general, contactEmail: e.target.value}})}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">HQ Physical Location</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:border-white outline-none transition-all"
                      value={settings.general.location}
                      onChange={(e) => setSettings({...settings, general: {...settings.general, location: e.target.value}})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">WhatsApp Concierge</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:border-white outline-none transition-all"
                      placeholder="250788..."
                      value={settings.general.whatsappNumber}
                      onChange={(e) => setSettings({...settings, general: {...settings.general, whatsappNumber: e.target.value}})}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <h4 className="text-xl font-black text-white mb-10 flex items-center gap-4 uppercase tracking-tighter">
                  <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                    <FaGlobe size={20} />
                  </div>
                  Social Presence
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {['facebook', 'instagram', 'twitter', 'youtube'].map(plat => (
                    <div key={plat}>
                      <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">{plat} Link</label>
                      <input 
                        type="url" 
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:border-white outline-none transition-all"
                        value={settings.general.socialLinks[plat]}
                        onChange={(e) => setSettings({...settings, general: {...settings.general, socialLinks: {...settings.general.socialLinks, [plat]: e.target.value}}})}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end sticky bottom-8 z-30">
                <button 
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-white text-black px-12 py-5 rounded-2xl font-black shadow-2xl hover:bg-gray-200 transition-all transform hover:-translate-y-1 flex items-center gap-4 uppercase tracking-widest text-sm"
                >
                  {saving ? 'Synchronizing...' : <><FaSave /> Save Configuration</>}
                </button>
              </div>
            </div>
          )}

          {/* Category Management */}
          {activeTab === 'categories' && (
            <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <h4 className="text-xl font-black text-white mb-10 flex items-center gap-4 uppercase tracking-tighter">
                <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                  <FaTags size={20} />
                </div>
                Inventory Categories
              </h4>

              <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 p-8 rounded-3xl border border-white/5">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Add New Category</label>
                  <input
                    type="text"
                    placeholder="Category Name (e.g. Phone Screens)"
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-white outline-none transition-all"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Image URL (Direct link to PNG/JPG)"
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-white outline-none transition-all"
                    value={newCategory.image}
                    onChange={(e) => setNewCategory({...newCategory, image: e.target.value})}
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Short Description</label>
                  <textarea
                    placeholder="What kind of products are in this category?"
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-white outline-none transition-all h-[104px] resize-none"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  />
                  <button
                    onClick={handleAddCategory}
                    className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-gray-200 transition-all shadow-xl"
                  >
                    <FaPlus /> Create Category
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <div key={cat._id} className="group bg-black border border-white/10 p-6 rounded-3xl flex flex-col gap-4 transition-all hover:border-white relative overflow-hidden">
                    {editingCategory === cat._id ? (
                      <div className="space-y-3">
                        <input
                          autoFocus
                          type="text"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white outline-none"
                          defaultValue={cat.name}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleUpdateCategory(cat._id, { name: e.target.value });
                          }}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setEditingCategory(null)} className="flex-1 py-2 text-[10px] font-black uppercase bg-white/5 text-gray-400 rounded-lg">Cancel</button>
                          <button className="flex-1 py-2 text-[10px] font-black uppercase bg-white text-black rounded-lg">Save</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="w-14 h-14 bg-white rounded-2xl p-2 shadow-2xl flex items-center justify-center overflow-hidden">
                            <img src={cat.image} alt={cat.name} className="max-h-full object-contain" />
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setEditingCategory(cat._id)}
                              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(cat._id)}
                              className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500 flex items-center justify-center text-red-500 hover:text-white transition-all"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <h5 className="text-white font-black uppercase tracking-tight text-base mb-1">{cat.name}</h5>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{cat.productCount || 0} Products</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="space-y-8">
              <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <h4 className="text-xl font-black text-white mb-10 flex items-center gap-4 uppercase tracking-tighter">
                  <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                    <FaUser size={20} />
                  </div>
                  Admin Identity
                </h4>
                
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="flex items-center gap-8 mb-8">
                    <div className="relative group">
                      <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center text-white/20 border-2 border-dashed border-white/20 group-hover:border-white transition-all overflow-hidden relative">
                        {profileData.profilePicture ? (
                          <img src={profileData.profilePicture} className="w-full h-full object-cover" alt="Profile" />
                        ) : (
                          <FaUser size={32} />
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProfileData({ ...profileData, profilePicture: reader.result });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-white text-black p-2 rounded-lg shadow-xl pointer-events-none">
                        <FaCamera size={12} />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-black text-white text-lg uppercase tracking-tight">{profileData.fullName || 'Admin User'}</h5>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">Super Admin Account</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">Full Legal Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:border-white outline-none transition-all"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">Administrative Email</label>
                      <input 
                        type="email" 
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:border-white outline-none transition-all"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">Username</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:border-white outline-none transition-all"
                        value={profileData.username}
                        onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">Phone Number</label>
                      <input 
                        type="tel" 
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:border-white outline-none transition-all"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={saving} className="bg-white text-black px-10 py-4 rounded-xl font-black hover:bg-gray-200 transition-all shadow-xl flex items-center gap-3 uppercase tracking-widest text-xs">
                      <FaSave /> Update Identity
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <h4 className="text-xl font-black text-white mb-10 flex items-center gap-4 uppercase tracking-tighter">
                  <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                    <FaLock size={20} />
                  </div>
                  Access Security
                </h4>
                <form onSubmit={handleUpdatePassword} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">Existing Password</label>
                      <input 
                        type="password" 
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:border-white outline-none transition-all"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">New Security Key</label>
                      <input 
                        type="password" 
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:border-white outline-none transition-all"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">Confirm New Key</label>
                      <input 
                        type="password" 
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 text-sm text-white focus:border-white outline-none transition-all"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={saving} className="bg-white text-black px-10 py-4 rounded-xl font-black hover:bg-gray-200 transition-all shadow-xl flex items-center gap-3 uppercase tracking-widest text-xs">
                      <FaLock /> Reset Security
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <h4 className="text-xl font-black text-white mb-10 flex items-center gap-4 uppercase tracking-tighter">
                <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                  <FaBell size={20} />
                </div>
                Alert Preferences
              </h4>
              <div className="space-y-6">
                {[
                  { id: 'newOrders', label: 'New Order Alerts', desc: 'Get notified instantly when a customer places an order' },
                  { id: 'lowStock', label: 'Low Stock Warnings', desc: 'Receive alerts when product inventory falls below threshold' },
                  { id: 'emailAlerts', label: 'Email Notifications', desc: 'Send daily summary reports to administrative email' },
                  { id: 'smsAlerts', label: 'SMS Notifications', desc: 'Receive critical system alerts via text message' }
                ].map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between p-6 bg-black rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight mb-1">{pref.label}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{pref.desc}</p>
                    </div>
                    <button
                      onClick={() => setSettings({...settings, notifications: {...settings.notifications, [pref.id]: !settings.notifications[pref.id]}})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${settings.notifications[pref.id] ? 'bg-white' : 'bg-white/10'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-300 ${settings.notifications[pref.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-10">
                <button onClick={handleSaveSettings} className="bg-white text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-gray-200 shadow-xl transition-all">
                  <FaSave /> Update Alerts
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <h4 className="text-xl font-black text-white mb-10 flex items-center gap-4 uppercase tracking-tighter">
                <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                  <FaShieldAlt size={20} />
                </div>
                System Security
              </h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-black rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight mb-1">Two-Factor Authentication</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Require a secondary code for administrative login</p>
                  </div>
                  <button
                    onClick={() => setSettings({...settings, security: {...settings.security, twoFactorAuth: !settings.security.twoFactorAuth}})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${settings.security.twoFactorAuth ? 'bg-white' : 'bg-white/10'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-300 ${settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="p-6 bg-black rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                  <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">Auto-Logout Session Timeout (Minutes)</label>
                  <div className="flex items-center gap-6">
                    <input 
                      type="range" 
                      min="5" 
                      max="120" 
                      step="5"
                      className="flex-1 accent-white"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({...settings, security: {...settings.security, sessionTimeout: parseInt(e.target.value)}})}
                    />
                    <span className="w-16 text-center font-black text-white text-lg">{settings.security.sessionTimeout}m</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-10">
                <button onClick={handleSaveSettings} className="bg-white text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-gray-200 shadow-xl transition-all">
                  <FaSave /> Apply Security Policy
                </button>
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <h4 className="text-xl font-black text-white mb-10 flex items-center gap-4 uppercase tracking-tighter">
                <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                  <FaDatabase size={20} />
                </div>
                Data Management
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-black rounded-[2rem] border border-white/5 space-y-6">
                  <div>
                    <h5 className="text-white font-black uppercase tracking-tight mb-2">Database Backup</h5>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Download a complete snapshot of your store's data including products, customers, and orders.</p>
                  </div>
                  <button className="w-full bg-white/5 hover:bg-white text-gray-400 hover:text-black py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3">
                    <FaHistory /> Export JSON Backup
                  </button>
                </div>

                <div className="p-8 bg-red-500/5 rounded-[2rem] border border-red-500/10 space-y-6">
                  <div>
                    <h5 className="text-red-500 font-black uppercase tracking-tight mb-2 italic">System Reset</h5>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">Wipe all administrative configurations and return the system to its original factory state.</p>
                  </div>
                  <button onClick={handleResetSettings} className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3">
                    <FaExclamationTriangle /> Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

