import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api.js';
import LoginForm from './Login';
import RegisterForm from './Register';
import { FaUser, FaPhone, FaMapMarkerAlt, FaEnvelope, FaSignOutAlt, FaSave } from 'react-icons/fa';

const Profile = () => {
  const { user: authUser, logout, isLoggedIn, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [localUser, setLocalUser] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (authUser) {
      setLocalUser({
        fullName: authUser.fullName || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
        address: authUser.address || ''
      });
    }
  }, [authUser]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await authAPI.updateProfile({
        fullName: localUser.fullName,
        phone: localUser.phone,
        address: localUser.address
      });
      toast.success('✅ Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('👋 Logged out successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex bg-white rounded-2xl shadow-sm overflow-hidden mb-8 p-1">
            <button 
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-center font-bold rounded-xl transition-all ${activeTab === 'login' ? 'bg-primary text-black shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-4 text-center font-bold rounded-xl transition-all ${activeTab === 'register' ? 'bg-primary text-black shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Register
            </button>
          </div>
          
          <div className="transition-all duration-300">
            {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-dark">MY PROFILE</h2>
            <p className="text-gray-500">Manage your account information</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all border-2 border-red-100"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm p-8 text-center border border-gray-100">
              <div className="w-24 h-24 bg-primary/20 text-primary-dark rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                {localUser.fullName?.charAt(0) || 'U'}
              </div>
              <h3 className="text-xl font-bold truncate">{localUser.fullName}</h3>
              <p className="text-gray-400 text-sm mb-6 truncate">{localUser.email}</p>
              
              <div className="space-y-4 text-left pt-6 border-t border-gray-50">
                <div className="flex items-center gap-3 text-gray-600">
                  <FaPhone className="text-primary" />
                  <span className="text-sm">{localUser.phone || 'No phone set'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FaEnvelope className="text-primary" />
                  <span className="text-sm truncate">{localUser.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Update Form Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <h4 className="text-lg font-bold mb-8 flex items-center gap-2">
                <FaUser className="text-primary" /> Edit Personal Information
              </h4>
              
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={localUser.fullName}
                      onChange={(e) => setLocalUser({...localUser, fullName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={localUser.phone}
                      onChange={(e) => setLocalUser({...localUser, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email (Read Only)</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
                    value={localUser.email}
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400" />
                    <textarea 
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all min-h-[120px]"
                      placeholder="Enter your street, district, and house number..."
                      value={localUser.address}
                      onChange={(e) => setLocalUser({...localUser, address: e.target.value})}
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    disabled={updating}
                    className="flex items-center gap-2 bg-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : <><FaSave /> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
