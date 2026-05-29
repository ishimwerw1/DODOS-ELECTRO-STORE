import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaUser, FaLock, FaBell, FaGlobe, FaMoneyBillWave, FaPhone, FaEnvelope,
  FaMapMarkerAlt, FaHistory, FaHeart, FaShieldAlt, FaKey, FaLaptop,
  FaShoppingCart, FaTicketAlt, FaQuestionCircle, FaSignOutAlt, FaMoon,
  FaSun, FaUserShield, FaChevronRight, FaPlus, FaTrash, FaEdit, FaCheck,
  FaUndo, FaEye, FaEyeSlash, FaSave
} from 'react-icons/fa';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { useTheme } from '../../context/ThemeContext';

const MENU_GROUPS = [
  {
    label: 'Account',
    items: [
      { id: 'overview',        icon: FaUser,         label: 'Overview' },
      { id: 'edit-profile',    icon: FaEdit,         label: 'Edit Profile' },
      { id: 'change-password', icon: FaLock,         label: 'Change Password' },
      { id: 'email-address',   icon: FaEnvelope,     label: 'Email Address' },
      { id: 'phone-number',    icon: FaPhone,        label: 'Phone Number' },
    ],
  },
  {
    label: 'Addresses & Payments',
    items: [
      { id: 'shipping-address', icon: FaMapMarkerAlt,  label: 'Shipping Address' },
      { id: 'billing-address',  icon: FaMapMarkerAlt,  label: 'Billing Address' },
      { id: 'payment-methods',  icon: FaMoneyBillWave, label: 'Payment Methods' },
    ],
  },
  {
    label: 'Orders',
    items: [
      { id: 'order-history', icon: FaHistory,      label: 'Order History' },
      { id: 'wishlist',      icon: FaHeart,        label: 'Wishlist' },
      { id: 'returns',       icon: FaUndo,         label: 'Returns & Refunds' },
      { id: 'saved-carts',   icon: FaShoppingCart, label: 'Saved Carts' },
      { id: 'coupons',       icon: FaTicketAlt,    label: 'Coupons & Gifts' },
    ],
  },
  {
    label: 'Preferences',
    items: [
      { id: 'notifications',   icon: FaBell,       label: 'Notifications' },
      { id: 'account-privacy', icon: FaUserShield, label: 'Account Privacy' },
      { id: 'lang-curr',       icon: FaGlobe,      label: 'Language & Currency' },
      { id: 'dark-light',      icon: FaMoon,       label: 'Appearance' },
    ],
  },
  {
    label: 'Security',
    items: [
      { id: 'security-2fa', icon: FaShieldAlt, label: 'Security & 2FA' },
      { id: 'sessions',     icon: FaLaptop,    label: 'Active Sessions' },
    ],
  },
  {
    label: 'Support',
    items: [
      { id: 'support',  icon: FaQuestionCircle, label: 'Help & Support' },
      { id: 'sign-out', icon: FaSignOutAlt,     label: 'Sign Out' },
    ],
  },
];

/* ── Reusable toggle ── */
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-green-500' : 'bg-gray-200'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

/* ── Section card ── */
const Card = ({ title, subtitle, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.18 }}
    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
  >
    {(title || subtitle) && (
      <div className="mb-5 pb-4 border-b border-gray-100">
        {title && <h2 className="text-lg font-black text-gray-900">{title}</h2>}
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    )}
    {children}
  </motion.div>
);

/* ── Input field ── */
const Field = ({ label, type = 'text', value, onChange, placeholder, readOnly, hint, rightEl }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 transition-all outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
          readOnly ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-200 hover:border-gray-300'
        } ${rightEl ? 'pr-12' : ''}`}
      />
      {rightEl && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>}
    </div>
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

/* ── Save button ── */
const SaveBtn = ({ loading, onClick, label = 'Save Changes' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
  >
    {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaSave size={13} />}
    {loading ? 'Saving...' : label}
  </button>
);

/* ══ SECTION: Overview ══ */
const OverviewSection = ({ user, setActive }) => {
  const links = [
    { id: 'edit-profile',     icon: FaEdit,         label: 'Edit Profile',    color: 'bg-blue-50 text-blue-600' },
    { id: 'order-history',    icon: FaHistory,      label: 'Order History',   color: 'bg-purple-50 text-purple-600' },
    { id: 'notifications',    icon: FaBell,         label: 'Notifications',   color: 'bg-yellow-50 text-yellow-600' },
    { id: 'shipping-address', icon: FaMapMarkerAlt, label: 'Addresses',       color: 'bg-green-50 text-green-600' },
    { id: 'payment-methods',  icon: FaMoneyBillWave,label: 'Payments',        color: 'bg-pink-50 text-pink-600' },
    { id: 'security-2fa',     icon: FaShieldAlt,    label: 'Security',        color: 'bg-red-50 text-red-600' },
  ];
  return (
    <Card title="Account Overview" subtitle="Quick access to your account settings.">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-5">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border-2 border-green-200 flex-shrink-0">
          {user?.profilePicture
            ? <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
            : <FaUser size={22} className="text-green-500" />}
        </div>
        <div>
          <h3 className="font-black text-gray-900">{user?.fullName || 'User'}</h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${user?.isVerified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
            {user?.isVerified ? 'Verified' : 'Unverified'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {links.map(({ id, icon: Icon, label, color }) => (
          <button key={id} onClick={() => setActive(id)}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all text-left group">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}><Icon size={13} /></div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors truncate">{label}</span>
            <FaChevronRight size={9} className="ml-auto text-gray-300 group-hover:text-green-400 flex-shrink-0" />
          </button>
        ))}
      </div>
    </Card>
  );
};

/* ══ SECTION: Edit Profile ══ */
const EditProfileSection = ({ user, updateProfile }) => {
  const [form, setForm] = useState({ fullName: user?.fullName || '', username: user?.username || '', phone: user?.phone || '', profilePicture: user?.profilePicture || '' });
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const fileInputRef = useRef(null);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  // Handle file upload — convert to base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
    setImgLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(p => ({ ...p, profilePicture: reader.result }));
      setImgLoading(false);
    };
    reader.onerror = () => { toast.error('Failed to read image'); setImgLoading(false); };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) return toast.error('Full name is required');
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateProfile(res.data.user || res.data);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err?.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <Card title="Edit Profile" subtitle="Update your personal information and profile photo.">
      <div className="space-y-5">

        {/* ── Profile picture upload ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Photo</label>
          <div className="flex items-center gap-5">
            {/* Avatar preview */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-green-200 overflow-hidden flex items-center justify-center">
                {imgLoading ? (
                  <span className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                ) : form.profilePicture ? (
                  <img src={form.profilePicture} alt="Profile" className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <FaUser size={28} className="text-green-400" />
                )}
              </div>
              {/* Camera overlay button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-md transition-all"
                title="Change photo"
              >
                <FaEdit size={11} />
              </button>
            </div>

            {/* Upload options */}
            <div className="flex-1 space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-bold rounded-xl text-sm transition-all w-full justify-center"
              >
                <FaEdit size={12} /> Upload from Device
              </button>
              <p className="text-xs text-gray-400 text-center">JPG, PNG, GIF — max 5MB</p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Or paste URL */}
          <div className="mt-3">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Or paste image URL</label>
            <input
              type="url"
              value={form.profilePicture?.startsWith('data:') ? '' : form.profilePicture}
              onChange={e => setForm(p => ({ ...p, profilePicture: e.target.value }))}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-300 transition-all"
            />
          </div>

          {/* Remove photo */}
          {form.profilePicture && (
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, profilePicture: '' }))}
              className="mt-2 text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <FaTrash size={10} /> Remove photo
            </button>
          )}
        </div>

        <div className="border-t border-gray-100" />

        <Field label="Full Name" value={form.fullName} onChange={set('fullName')} placeholder="Your full name" />
        <Field label="Username" value={form.username} onChange={set('username')} placeholder="@username" />
        <Field label="Phone Number" value={form.phone} onChange={set('phone')} placeholder="+250 7XX XXX XXX" />

        <div className="pt-2"><SaveBtn loading={loading} onClick={handleSave} /></div>
      </div>
    </Card>
  );
};

/* ══ SECTION: Change Password ══ */
const ChangePasswordSection = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const toggleShow = (k) => setShow(p => ({ ...p, [k]: !p[k] }));
  const EyeBtn = ({ field }) => (
    <button type="button" onClick={() => toggleShow(field)} className="text-gray-400 hover:text-gray-600 transition-colors">
      {show[field] ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
    </button>
  );
  const handleSave = async () => {
    if (!form.currentPassword) return toast.error('Current password required');
    if (form.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authAPI.updateProfile({ currentPassword: form.currentPassword, password: form.newPassword });
      toast.success('Password changed!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };
  return (
    <Card title="Change Password" subtitle="Keep your account secure with a strong password.">
      <div className="space-y-4">
        <Field label="Current Password" type={show.current ? 'text' : 'password'} value={form.currentPassword} onChange={set('currentPassword')} placeholder="Current password" rightEl={<EyeBtn field="current" />} />
        <Field label="New Password" type={show.new ? 'text' : 'password'} value={form.newPassword} onChange={set('newPassword')} placeholder="At least 6 characters" rightEl={<EyeBtn field="new" />} />
        <Field label="Confirm New Password" type={show.confirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat new password" rightEl={<EyeBtn field="confirm" />} />
        {form.newPassword && form.confirmPassword && (
          <p className={`text-xs font-semibold flex items-center gap-1 ${form.newPassword === form.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
            {form.newPassword === form.confirmPassword ? <><FaCheck size={10} /> Passwords match</> : 'Passwords do not match'}
          </p>
        )}
        <div className="pt-2"><SaveBtn loading={loading} onClick={handleSave} label="Update Password" /></div>
      </div>
    </Card>
  );
};

/* ══ SECTION: Email ══ */
const EmailSection = ({ user }) => (
  <Card title="Email Address" subtitle="Your login email address.">
    <div className="space-y-4">
      <Field label="Email Address" type="email" value={user?.email || ''} readOnly hint="To change your email, contact our support team." />
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <FaEnvelope className="text-blue-500 mt-0.5 flex-shrink-0" size={14} />
        <p className="text-xs text-blue-600">Email is tied to your account identity. Contact <a href="mailto:dodoselectrostore@gmail.com" className="underline font-bold">dodoselectrostore@gmail.com</a> to update it.</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className={`w-2 h-2 rounded-full ${user?.isVerified ? 'bg-green-500' : 'bg-yellow-400'}`} />
        {user?.isVerified ? 'Email verified' : 'Email not verified'}
      </div>
    </div>
  </Card>
);

/* ══ SECTION: Phone ══ */
const PhoneSection = ({ user, updateProfile }) => {
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const handleSave = async () => {
    if (!phone.trim()) return toast.error('Phone number required');
    setLoading(true);
    try {
      const res = await authAPI.updateProfile({ phone });
      updateProfile(res.data.user || res.data);
      toast.success('Phone number updated!');
    } catch (err) { toast.error(err?.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };
  return (
    <Card title="Phone Number" subtitle="Used for order updates and account recovery.">
      <div className="space-y-4">
        <Field label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+250 7XX XXX XXX" hint="Include country code (e.g. +250 for Rwanda)" />
        <div className="pt-2"><SaveBtn loading={loading} onClick={handleSave} /></div>
      </div>
    </Card>
  );
};

/* ══ SECTION: Address (shared for shipping + billing) ══ */
const AddressSection = ({ user, updateProfile, type }) => {
  const isShipping = type === 'shipping';
  const title = isShipping ? 'Shipping Addresses' : 'Billing Addresses';
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [editing, setEditing] = useState(null);
  const empty = { label: '', fullName: '', phone: '', street: '', city: '', district: '', country: 'Rwanda' };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.street.trim() || !form.city.trim()) return toast.error('Full name, street and city are required');
    setLoading(true);
    try {
      let updated;
      if (editing === 'new') updated = [...addresses, { ...form }];
      else updated = addresses.map((a, i) => i === editing ? { ...form } : a);
      const res = await authAPI.updateProfile({ addresses: updated });
      const saved = res.data.user || res.data;
      updateProfile(saved);
      setAddresses(saved?.addresses || updated);
      toast.success('Address saved!');
      setEditing(null); setForm(empty);
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (i) => {
    const updated = addresses.filter((_, idx) => idx !== i);
    setLoading(true);
    try {
      const res = await authAPI.updateProfile({ addresses: updated });
      const saved = res.data.user || res.data;
      updateProfile(saved);
      setAddresses(saved?.addresses || updated);
      toast.success('Address removed');
    } catch { toast.error('Failed to remove'); }
    finally { setLoading(false); }
  };

  return (
    <Card title={title} subtitle={`Manage your saved ${isShipping ? 'shipping' : 'billing'} addresses.`}>
      {addresses.length === 0 && editing === null && (
        <div className="text-center py-8">
          <FaMapMarkerAlt className="text-gray-200 text-4xl mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No addresses saved yet</p>
        </div>
      )}
      <div className="space-y-3 mb-4">
        {addresses.map((addr, i) => (
          <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-200 transition-all">
            <FaMapMarkerAlt className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
            <div className="flex-1 min-w-0">
              {addr.label && <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-0.5">{addr.label}</p>}
              <p className="text-sm font-semibold text-gray-800">{addr.fullName}</p>
              <p className="text-xs text-gray-500">{addr.street}, {addr.city}{addr.district ? `, ${addr.district}` : ''}, {addr.country}</p>
              {addr.phone && <p className="text-xs text-gray-400 mt-0.5">{addr.phone}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => { setForm({ ...addr }); setEditing(i); }} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><FaEdit size={12} /></button>
              <button onClick={() => handleDelete(i)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><FaTrash size={12} /></button>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {editing !== null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="p-4 bg-green-50 rounded-xl border border-green-100 space-y-3 mb-4">
              <h4 className="text-sm font-black text-green-700">{editing === 'new' ? 'Add New Address' : 'Edit Address'}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Label (e.g. Home)" value={form.label} onChange={setF('label')} placeholder="Home" />
                <Field label="Full Name" value={form.fullName} onChange={setF('fullName')} placeholder="Recipient name" />
                <Field label="Phone" value={form.phone} onChange={setF('phone')} placeholder="+250 7XX XXX XXX" />
                <Field label="Country" value={form.country} onChange={setF('country')} placeholder="Rwanda" />
                <Field label="District" value={form.district} onChange={setF('district')} placeholder="Kigali" />
                <Field label="City / Sector" value={form.city} onChange={setF('city')} placeholder="Nyarugenge" />
              </div>
              <Field label="Street Address" value={form.street} onChange={setF('street')} placeholder="KG 123 St, Building name" />
              <div className="flex gap-3 pt-1">
                <SaveBtn loading={loading} onClick={handleSave} label={editing === 'new' ? 'Add Address' : 'Update Address'} />
                <button type="button" onClick={() => { setEditing(null); setForm(empty); }} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {editing === null && (
        <button onClick={() => { setForm(empty); setEditing('new'); }} className="flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 transition-colors">
          <FaPlus size={11} /> Add New Address
        </button>
      )}
    </Card>
  );
};

/* ══ SECTION: Payment Methods ══ */
const PaymentMethodsSection = () => (
  <Card title="Payment Methods" subtitle="Accepted payment options.">
    <div className="space-y-4">
      <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0"><FaMoneyBillWave className="text-white" size={16} /></div>
        <div>
          <h4 className="font-black text-gray-900 text-sm">MTN MoMo Pay</h4>
          <p className="text-xs text-gray-500 mt-1">Pay securely using MTN Mobile Money. Dial <strong>*182*8*1*241480#</strong> and confirm payment.</p>
        </div>
      </div>
      <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0"><FaShoppingCart className="text-white" size={16} /></div>
        <div>
          <h4 className="font-black text-gray-900 text-sm">Cash on Delivery</h4>
          <p className="text-xs text-gray-500 mt-1">Pay in cash when your order arrives. Available in Kigali and select areas. No extra fees.</p>
        </div>
      </div>
    </div>
  </Card>
);

/* ══ SECTION: Order History ══ */
const OrderHistorySection = () => (
  <Card title="Order History" subtitle="View and track all your past orders.">
    <div className="text-center py-6">
      <FaHistory className="text-gray-200 text-4xl mx-auto mb-4" />
      <p className="text-gray-500 text-sm mb-4">Your complete order history is on the Orders page.</p>
      <Link to="/dashboard/orders" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all">
        View All Orders <FaChevronRight size={10} />
      </Link>
    </div>
  </Card>
);

/* ══ SECTION: Wishlist ══ */
const WishlistSection = () => (
  <Card title="Wishlist" subtitle="Products you've saved for later.">
    <div className="text-center py-6">
      <FaHeart className="text-gray-200 text-4xl mx-auto mb-4" />
      <p className="text-gray-500 text-sm mb-4">Browse and manage your saved products.</p>
      <Link to="/dashboard/wishlist" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all">
        View Wishlist <FaChevronRight size={10} />
      </Link>
    </div>
  </Card>
);

/* ══ SECTION: Notifications ══ */
const NotificationsSection = ({ user, updateProfile }) => {
  const [prefs, setPrefs] = useState({
    orderUpdates: user?.notifications?.orderUpdates ?? true,
    promotions:   user?.notifications?.promotions   ?? true,
    newArrivals:  user?.notifications?.newArrivals  ?? false,
    priceDrops:   user?.notifications?.priceDrops   ?? false,
    methods: {
      sms:   user?.notifications?.methods?.sms   ?? false,
      email: user?.notifications?.methods?.email ?? true,
      inApp: user?.notifications?.methods?.inApp ?? true,
    },
  });
  const [loading, setLoading] = useState(false);
  const setTop = (k) => (v) => setPrefs(p => ({ ...p, [k]: v }));
  const setMethod = (k) => (v) => setPrefs(p => ({ ...p, methods: { ...p.methods, [k]: v } }));
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await authAPI.updateProfile({ notifications: prefs });
      updateProfile(res.data.user || res.data);
      toast.success('Notification preferences saved!');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };
  const types = [
    { key: 'orderUpdates', label: 'Order Updates',  desc: 'Shipping, delivery and status changes' },
    { key: 'promotions',   label: 'Promotions',     desc: 'Exclusive deals and discount codes' },
    { key: 'newArrivals',  label: 'New Arrivals',   desc: 'Be first to know about new products' },
    { key: 'priceDrops',   label: 'Price Drops',    desc: 'Alerts when wishlist items go on sale' },
  ];
  const methods = [
    { key: 'email', label: 'Email',   icon: FaEnvelope },
    { key: 'sms',   label: 'SMS',     icon: FaPhone },
    { key: 'inApp', label: 'In-App',  icon: FaBell },
  ];
  return (
    <Card title="Notifications" subtitle="Choose what you want to be notified about.">
      <div className="space-y-5">
        <div>
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Notification Types</h4>
          <div className="space-y-2">
            {types.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div><p className="text-sm font-semibold text-gray-800">{label}</p><p className="text-xs text-gray-400">{desc}</p></div>
                <Toggle checked={prefs[key]} onChange={setTop(key)} />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-100" />
        <div>
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Delivery Methods</h4>
          <div className="space-y-2">
            {methods.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3"><Icon size={14} className="text-gray-400" /><p className="text-sm font-semibold text-gray-800">{label}</p></div>
                <Toggle checked={prefs.methods[key]} onChange={setMethod(key)} />
              </div>
            ))}
          </div>
        </div>
        <div className="pt-2"><SaveBtn loading={loading} onClick={handleSave} /></div>
      </div>
    </Card>
  );
};

/* ══ SECTION: Account Privacy ══ */
const AccountPrivacySection = () => {
  const [s, setS] = useState({ publicProfile: false, showOrderHistory: false, showWishlist: false, allowAnalytics: true, personalizedAds: false });
  const rows = [
    { key: 'publicProfile',    label: 'Public Profile',    desc: 'Allow others to view your profile' },
    { key: 'showOrderHistory', label: 'Show Order History',desc: 'Display purchase history on profile' },
    { key: 'showWishlist',     label: 'Show Wishlist',     desc: 'Let others see your saved products' },
    { key: 'allowAnalytics',   label: 'Usage Analytics',   desc: 'Help us improve with anonymous data' },
    { key: 'personalizedAds',  label: 'Personalized Ads',  desc: 'See ads tailored to your interests' },
  ];
  return (
    <Card title="Account Privacy" subtitle="Control your privacy and data sharing preferences.">
      <div className="space-y-2">
        {rows.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div><p className="text-sm font-semibold text-gray-800">{label}</p><p className="text-xs text-gray-400">{desc}</p></div>
            <Toggle checked={s[key]} onChange={(v) => setS(p => ({ ...p, [key]: v }))} />
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-600"><strong>Note:</strong> Full privacy controls will be available in a future update.</p>
      </div>
    </Card>
  );
};

/* ══ SECTION: Language & Currency ══ */
const LangCurrSection = () => {
  const { language, currency, setLanguage, setCurrency, LANGUAGES, CURRENCIES } = useLocale();
  return (
    <Card title="Language & Currency" subtitle="Set your preferred language and currency.">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => (
              <button key={lang.code} onClick={() => setLanguage(lang.code)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${language === lang.code ? 'bg-green-500 border-green-500 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:border-green-300'}`}>
                <span className="text-base">{lang.flag}</span>
                <span className="truncate">{lang.label}</span>
                {language === lang.code && <FaCheck size={10} className="ml-auto flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-100" />
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CURRENCIES.map((cur) => (
              <button key={cur.code} onClick={() => setCurrency(cur.code)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${currency === cur.code ? 'bg-green-500 border-green-500 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:border-green-300'}`}>
                <span className="text-base">{cur.flag}</span>
                <span className="font-black">{cur.code}</span>
                <span className="text-xs opacity-70 hidden sm:block">{cur.symbol}</span>
                {currency === cur.code && <FaCheck size={10} className="ml-auto flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
        <div className="p-3 bg-green-50 rounded-xl border border-green-100">
          <p className="text-xs text-green-700"><strong>Active:</strong> {language} · {currency} — Changes apply immediately.</p>
        </div>
      </div>
    </Card>
  );
};

/* ══ SECTION: Appearance ══ */
const AppearanceSection = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Card title="Appearance" subtitle="Choose between light and dark mode.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { id: 'Light', icon: FaSun,  iconColor: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Light Mode', desc: 'Clean white interface' },
          { id: 'Dark',  icon: FaMoon, iconColor: 'text-blue-300',   bg: 'bg-gray-800',   label: 'Dark Mode',  desc: 'Easy on the eyes at night' },
        ].map(({ id, icon: Icon, iconColor, bg, label, desc }) => (
          <button key={id} onClick={() => setTheme(id)}
            className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${theme === id ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            {theme === id && <span className="absolute top-3 right-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><FaCheck size={9} className="text-white" /></span>}
            <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center`}><Icon size={20} className={iconColor} /></div>
            <div className="text-center">
              <p className="font-black text-gray-900 text-sm">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};

/* ══ SECTION: Security ══ */
const SecuritySection = () => (
  <Card title="Security & 2FA" subtitle="Protect your account with extra security.">
    <div className="space-y-4">
      {[
        { icon: FaKey,      bg: 'bg-orange-400', title: 'Two-Factor Authentication', desc: 'Require a verification code in addition to your password when signing in.' },
        { icon: FaShieldAlt,bg: 'bg-blue-500',   title: 'Login Alerts',              desc: 'Get notified by email whenever a new device logs into your account.' },
      ].map(({ icon: Icon, bg, title, desc }) => (
        <div key={title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}><Icon className="text-white" size={16} /></div>
          <div>
            <h4 className="font-black text-gray-900 text-sm">{title}</h4>
            <p className="text-xs text-gray-500 mt-1">{desc}</p>
            <span className="inline-block mt-2 text-xs font-bold px-2.5 py-1 bg-orange-100 text-orange-600 rounded-full">Coming Soon</span>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

/* ══ SECTION: Sessions ══ */
const SessionsSection = () => (
  <Card title="Active Sessions" subtitle="Devices currently logged into your account.">
    <div className="space-y-4">
      <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0"><FaLaptop className="text-white" size={16} /></div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-black text-gray-900 text-sm">Current Device</h4>
            <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-600 rounded-full">Active Now</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser'} · {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
        <p className="text-xs text-gray-400">Full session management (view all devices, remote sign-out) is coming soon.</p>
      </div>
    </div>
  </Card>
);

/* ══ SECTION: Returns ══ */
const ReturnsSection = () => (
  <Card title="Returns & Refunds" subtitle="Our return policy and how to initiate a return.">
    <div className="space-y-4">
      <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0"><FaUndo className="text-white" size={16} /></div>
        <div><h4 className="font-black text-gray-900 text-sm">7-Day Return Policy</h4><p className="text-xs text-gray-500 mt-1">We accept returns within 7 days of delivery for items in original, unused condition.</p></div>
      </div>
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
        <h4 className="text-sm font-black text-gray-800">How to Return</h4>
        {['Contact support within 7 days of receiving your order', 'Provide your order number and reason for return', 'Our team will arrange pickup or drop-off', 'Refund processed within 3–5 business days after inspection'].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{i + 1}</span>
            <p className="text-xs text-gray-600">{step}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <a href="mailto:dodoselectrostore@gmail.com" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"><FaEnvelope size={12} /> Email Support</a>
        <Link to="/contact" className="flex items-center justify-center gap-2 border border-gray-200 hover:border-green-300 text-gray-700 hover:text-green-600 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"><FaQuestionCircle size={12} /> Contact Page</Link>
      </div>
    </div>
  </Card>
);

/* ══ SECTION: Saved Carts ══ */
const SavedCartsSection = () => (
  <Card title="Saved Carts" subtitle="Your saved shopping sessions.">
    <div className="text-center py-8">
      <FaShoppingCart className="text-gray-200 text-4xl mx-auto mb-3" />
      <p className="text-gray-400 text-sm mb-2">No saved carts yet</p>
      <p className="text-xs text-gray-300 mb-4">Cart saving across devices is coming soon.</p>
      <Link to="/products" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all">Start Shopping <FaChevronRight size={10} /></Link>
    </div>
  </Card>
);

/* ══ SECTION: Coupons ══ */
const CouponsSection = () => {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null);
  const handleApply = () => {
    if (!code.trim()) return toast.error('Please enter a coupon code');
    setApplied(code.trim().toUpperCase());
    toast.success(`Coupon "${code.trim().toUpperCase()}" applied! Discount will show at checkout.`);
    setCode('');
  };
  return (
    <Card title="Coupons & Promo Codes" subtitle="Enter a coupon code to save on your next order.">
      <div className="space-y-4">
        <div className="flex gap-3">
          <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleApply()} placeholder="Enter coupon code (e.g. DODOS10)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          <button onClick={handleApply} className="bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2"><FaTicketAlt size={12} /> Apply</button>
        </div>
        {applied && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
            <FaCheck className="text-green-500 flex-shrink-0" size={14} />
            <div><p className="text-sm font-bold text-green-700">Coupon <span className="font-black">{applied}</span> applied</p><p className="text-xs text-green-600">Discount will be applied at checkout</p></div>
            <button onClick={() => setApplied(null)} className="ml-auto text-gray-400 hover:text-red-500 transition-colors"><FaTrash size={11} /></button>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

/* ══ SECTION: Support ══ */
const SupportSection = () => (
  <Card title="Help & Support" subtitle="We're here to help you with any questions.">
    <div className="space-y-4">
      {[
        { icon: FaEnvelope, label: 'Email Us',  value: 'dodoselectrostore@gmail.com', href: 'mailto:dodoselectrostore@gmail.com', color: 'bg-blue-50 text-blue-600' },
        { icon: FaPhone,    label: 'Call Us',   value: '+250 783 211 453',             href: 'tel:+250783211453',                  color: 'bg-green-50 text-green-600' },
      ].map(({ icon: Icon, label, value, href, color }) => (
        <a key={label} href={href} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all group">
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}><Icon size={14} /></div>
          <div><p className="text-xs text-gray-400 font-semibold">{label}</p><p className="text-sm font-black text-gray-800 group-hover:text-green-600 transition-colors">{value}</p></div>
          <FaChevronRight size={12} className="ml-auto text-gray-300 group-hover:text-green-400 transition-colors" />
        </a>
      ))}
      <Link to="/contact" className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all"><FaQuestionCircle size={13} /> Visit Help Center</Link>
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
        <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Business Hours</h4>
        {[{ day: 'Monday – Saturday', hours: '8:00 AM – 7:00 PM' }, { day: 'Sunday', hours: '9:00 AM – 5:00 PM' }].map(({ day, hours }) => (
          <div key={day} className="flex justify-between text-xs text-gray-500 mb-1"><span>{day}</span><span className="font-semibold text-gray-700">{hours}</span></div>
        ))}
      </div>
    </div>
  </Card>
);

/* ══ SECTION: Sign Out ══ */
const SignOutSection = ({ logout }) => {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const handleSignOut = () => { logout(); toast.success('Signed out. See you soon!'); navigate('/'); };
  return (
    <Card title="Sign Out" subtitle="End your current session securely.">
      <div className="space-y-4">
        <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0"><FaSignOutAlt className="text-white" size={16} /></div>
          <div><h4 className="font-black text-gray-900 text-sm">Sign Out of Your Account</h4><p className="text-xs text-gray-500 mt-1">Your cart and wishlist will be saved for when you return.</p></div>
        </div>
        {!confirming ? (
          <button onClick={() => setConfirming(true)} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"><FaSignOutAlt size={13} /> Sign Out</button>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-3">
            <p className="text-sm font-bold text-red-700">Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <button onClick={handleSignOut} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2 rounded-xl text-sm transition-all"><FaCheck size={11} /> Yes, Sign Out</button>
              <button onClick={() => setConfirming(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

/* ══ MAIN COMPONENT ══ */
const UserSettings = () => {
  const { user, updateProfile, logout } = useAuth();
  const [active, setActive] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [active]);

  const handleSetActive = (id) => { setActive(id); setMobileOpen(false); };
  const activeLabel = MENU_GROUPS.flatMap(g => g.items).find(i => i.id === active)?.label || 'Settings';

  const renderSection = () => {
    switch (active) {
      case 'overview':         return <OverviewSection user={user} setActive={handleSetActive} />;
      case 'edit-profile':     return <EditProfileSection user={user} updateProfile={updateProfile} />;
      case 'change-password':  return <ChangePasswordSection />;
      case 'email-address':    return <EmailSection user={user} />;
      case 'phone-number':     return <PhoneSection user={user} updateProfile={updateProfile} />;
      case 'shipping-address': return <AddressSection user={user} updateProfile={updateProfile} type="shipping" />;
      case 'billing-address':  return <AddressSection user={user} updateProfile={updateProfile} type="billing" />;
      case 'payment-methods':  return <PaymentMethodsSection />;
      case 'order-history':    return <OrderHistorySection />;
      case 'wishlist':         return <WishlistSection />;
      case 'notifications':    return <NotificationsSection user={user} updateProfile={updateProfile} />;
      case 'account-privacy':  return <AccountPrivacySection />;
      case 'lang-curr':        return <LangCurrSection />;
      case 'dark-light':       return <AppearanceSection />;
      case 'security-2fa':     return <SecuritySection />;
      case 'sessions':         return <SessionsSection />;
      case 'returns':          return <ReturnsSection />;
      case 'saved-carts':      return <SavedCartsSection />;
      case 'coupons':          return <CouponsSection />;
      case 'support':          return <SupportSection />;
      case 'sign-out':         return <SignOutSection logout={logout} />;
      default:                 return <OverviewSection user={user} setActive={handleSetActive} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 bg-white border-r border-gray-200 overflow-y-auto w-[240px]
        transition-transform duration-300 ease-in-out
        lg:sticky lg:top-0 lg:translate-x-0 lg:h-screen lg:flex-shrink-0
        ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar user header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border-2 border-green-200 flex-shrink-0">
              {user?.profilePicture
                ? <img src={user.profilePicture} alt={user?.fullName} className="w-full h-full object-cover" />
                : <FaUser size={16} className="text-green-500" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-gray-900 truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="p-3 space-y-0.5">
          {MENU_GROUPS.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-1.5">{group.label}</p>
              {group.items.map(({ id, icon: Icon, label }) => {
                const isActive = active === id;
                const isSignOut = id === 'sign-out';
                return (
                  <button key={id} onClick={() => handleSetActive(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                      isActive ? 'bg-green-500 text-white shadow-sm' : isSignOut ? 'text-red-500 hover:bg-red-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}>
                    <Icon size={13} className={isActive ? 'text-white' : isSignOut ? 'text-red-400' : 'text-gray-400'} />
                    <span className="flex-1 truncate">{label}</span>
                    {isActive && <FaChevronRight size={9} className="text-white/70 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/40 z-30 lg:hidden" />
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <main ref={contentRef} className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <button onClick={() => setMobileOpen(p => !p)} className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center"><FaUser size={11} className="text-white" /></div>
            <span>{activeLabel}</span>
          </button>
          <span className="text-xs text-gray-400 font-semibold">Settings</span>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
            <span className="font-semibold text-gray-500">Settings</span>
            <FaChevronRight size={8} />
            <span className="font-bold text-gray-700">{activeLabel}</span>
          </div>

          <AnimatePresence mode="wait">
            <div key={active}>{renderSection()}</div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default UserSettings;
