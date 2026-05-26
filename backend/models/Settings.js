import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  general: {
    storeName: { type: String, default: 'DODOS ELECTRO STORE' },
    storeDescription: { type: String, default: 'Powering your Digital World' },
    contactPhone: { type: String, default: '+250 788 123 456' },
    contactEmail: { type: String, default: 'info@dodosphones.rw' },
    location: { type: String, default: 'Kigali, Rwanda' },
    logoUrl: { type: String, default: '' },
    whatsappNumber: { type: String, default: '+250788123456' },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' }
    },
    appLinks: {
      android: { type: String, default: '' },
      ios: { type: String, default: '' }
    }
  },
  currency: {
    defaultCurrency: { type: String, default: 'RWF' },
    symbol: { type: String, default: 'RWF' }
  },
  language: {
    defaultLanguage: { type: String, default: 'English' }
  },
  appearance: {
    themeMode: { type: String, default: 'Light' },
    primaryColor: { type: String, default: '#FFD700' },
    sidebarExpanded: { type: Boolean, default: true }
  },
  notifications: {
    newOrders: { type: Boolean, default: true },
    lowStock: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: false },
    smsAlerts: { type: Boolean, default: false }
  },
  productStock: {
    lowStockThreshold: { type: Number, default: 5 },
    defaultCategory: { type: String, default: 'Other Accessories' },
    autoUpdateStock: { type: Boolean, default: true }
  },
  security: {
    twoFactorAuth: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 30 }, // in minutes
    loginAlerts: { type: Boolean, default: true }
  },
  preferences: {
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    timeFormat: { type: String, default: '24-hour' },
    defaultDashboard: { type: String, default: 'Dashboard' }
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
