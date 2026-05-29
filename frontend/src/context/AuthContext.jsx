import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';
import { detectLocaleFromPhone, DIAL_LOCALE_MAP } from './LocaleContext.jsx';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

/* ── Helper: save locale from phone to localStorage ── */
const saveLocaleFromPhone = (phone) => {
  if (!phone) return;
  const detected = detectLocaleFromPhone(phone);
  if (!detected) return;
  try {
    localStorage.setItem('dodos_locale', JSON.stringify({
      language: detected.language,
      currency: detected.currency,
    }));
  } catch { /* ignore */ }
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  // True only right after register() — cleared on login/reload so returning
  // unverified users are never blocked at the login screen.
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch public settings
        const settingsRes = await authAPI.getPublicSettings();
        setSettings(settingsRes.data);

        // Fetch user if token exists
        const token = localStorage.getItem('dodos_token');
        if (token) {
          const userRes = await authAPI.getMe();
          setUser(userRes.data);
          /* re-apply locale from stored phone on page reload */
          if (userRes.data?.phone) saveLocaleFromPhone(userRes.data.phone);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('dodos_token');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    localStorage.setItem('dodos_token', res.data.token);
    setJustRegistered(false); // logging in — never show verification guard
    setUser(res.data.user);
    if (res.data.user?.phone) saveLocaleFromPhone(res.data.user.phone);
    return res.data;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    localStorage.setItem('dodos_token', res.data.token);
    setJustRegistered(true); // fresh registration — show verification guard
    setUser(res.data.user);
    if (userData.phone) saveLocaleFromPhone(userData.phone);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('dodos_token');
    setJustRegistered(false);
    setUser(null);
  };

  const verifyEmail = async (code) => {
    const res = await authAPI.verifyEmail(code);
    setJustRegistered(false);
    setUser(prev => ({ ...prev, isVerified: true }));
    return res.data;
  };

  const resendVerification = async () => {
    const res = await authAPI.resendVerification();
    return res.data;
  };

  const loginWithGoogle = async (credential) => {
    const res = await authAPI.googleAuth(credential);
    localStorage.setItem('dodos_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const updateProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  const refreshSettings = async () => {
    try {
      const res = await authAPI.getPublicSettings();
      setSettings(res.data);
    } catch (error) {
      console.error('Error refreshing settings:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      loginWithGoogle, 
      logout, 
      updateProfile,
      settings,
      refreshSettings,
      loading, 
      isLoggedIn: !!user,
      justRegistered,
      verifyEmail,
      resendVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
};
