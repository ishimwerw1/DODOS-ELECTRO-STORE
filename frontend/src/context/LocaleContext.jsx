import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────
   DIAL CODE → { language, currency, currencySymbol, locale }
   Used to auto-detect preferences from the phone number on register/login
───────────────────────────────────────────── */
export const DIAL_LOCALE_MAP = {
  '+250': { language: 'English',    currency: 'RWF',  symbol: 'RWF',  locale: 'en-RW' }, // Rwanda
  '+256': { language: 'English',    currency: 'UGX',  symbol: 'USh',  locale: 'en-UG' }, // Uganda
  '+254': { language: 'English',    currency: 'KES',  symbol: 'KSh',  locale: 'en-KE' }, // Kenya
  '+255': { language: 'English',    currency: 'TZS',  symbol: 'TSh',  locale: 'en-TZ' }, // Tanzania
  '+257': { language: 'French',     currency: 'BIF',  symbol: 'Fr',   locale: 'fr-BI' }, // Burundi
  '+243': { language: 'French',     currency: 'CDF',  symbol: 'FC',   locale: 'fr-CD' }, // DR Congo
  '+251': { language: 'English',    currency: 'ETB',  symbol: 'Br',   locale: 'en-ET' }, // Ethiopia
  '+234': { language: 'English',    currency: 'NGN',  symbol: '₦',    locale: 'en-NG' }, // Nigeria
  '+27':  { language: 'English',    currency: 'ZAR',  symbol: 'R',    locale: 'en-ZA' }, // South Africa
  '+233': { language: 'English',    currency: 'GHS',  symbol: '₵',    locale: 'en-GH' }, // Ghana
  '+20':  { language: 'Arabic',     currency: 'EGP',  symbol: 'E£',   locale: 'ar-EG' }, // Egypt
  '+212': { language: 'French',     currency: 'MAD',  symbol: 'MAD',  locale: 'fr-MA' }, // Morocco
  '+216': { language: 'French',     currency: 'TND',  symbol: 'DT',   locale: 'fr-TN' }, // Tunisia
  '+213': { language: 'French',     currency: 'DZD',  symbol: 'DA',   locale: 'fr-DZ' }, // Algeria
  '+221': { language: 'French',     currency: 'XOF',  symbol: 'CFA',  locale: 'fr-SN' }, // Senegal
  '+225': { language: 'French',     currency: 'XOF',  symbol: 'CFA',  locale: 'fr-CI' }, // Côte d'Ivoire
  '+237': { language: 'French',     currency: 'XAF',  symbol: 'FCFA', locale: 'fr-CM' }, // Cameroon
  '+260': { language: 'English',    currency: 'ZMW',  symbol: 'ZK',   locale: 'en-ZM' }, // Zambia
  '+263': { language: 'English',    currency: 'ZWL',  symbol: 'Z$',   locale: 'en-ZW' }, // Zimbabwe
  '+258': { language: 'Portuguese', currency: 'MZN',  symbol: 'MT',   locale: 'pt-MZ' }, // Mozambique
  '+244': { language: 'Portuguese', currency: 'AOA',  symbol: 'Kz',   locale: 'pt-AO' }, // Angola
  '+1':   { language: 'English',    currency: 'USD',  symbol: '$',    locale: 'en-US' }, // USA/Canada
  '+44':  { language: 'English',    currency: 'GBP',  symbol: '£',    locale: 'en-GB' }, // UK
  '+33':  { language: 'French',     currency: 'EUR',  symbol: '€',    locale: 'fr-FR' }, // France
  '+49':  { language: 'German',     currency: 'EUR',  symbol: '€',    locale: 'de-DE' }, // Germany
  '+39':  { language: 'Italian',    currency: 'EUR',  symbol: '€',    locale: 'it-IT' }, // Italy
  '+34':  { language: 'Spanish',    currency: 'EUR',  symbol: '€',    locale: 'es-ES' }, // Spain
  '+351': { language: 'Portuguese', currency: 'EUR',  symbol: '€',    locale: 'pt-PT' }, // Portugal
  '+31':  { language: 'Dutch',      currency: 'EUR',  symbol: '€',    locale: 'nl-NL' }, // Netherlands
  '+32':  { language: 'French',     currency: 'EUR',  symbol: '€',    locale: 'fr-BE' }, // Belgium
  '+41':  { language: 'German',     currency: 'CHF',  symbol: 'Fr',   locale: 'de-CH' }, // Switzerland
  '+46':  { language: 'Swedish',    currency: 'SEK',  symbol: 'kr',   locale: 'sv-SE' }, // Sweden
  '+47':  { language: 'Norwegian',  currency: 'NOK',  symbol: 'kr',   locale: 'nb-NO' }, // Norway
  '+45':  { language: 'Danish',     currency: 'DKK',  symbol: 'kr',   locale: 'da-DK' }, // Denmark
  '+7':   { language: 'Russian',    currency: 'RUB',  symbol: '₽',    locale: 'ru-RU' }, // Russia
  '+90':  { language: 'Turkish',    currency: 'TRY',  symbol: '₺',    locale: 'tr-TR' }, // Turkey
  '+966': { language: 'Arabic',     currency: 'SAR',  symbol: 'SR',   locale: 'ar-SA' }, // Saudi Arabia
  '+971': { language: 'Arabic',     currency: 'AED',  symbol: 'AED',  locale: 'ar-AE' }, // UAE
  '+91':  { language: 'English',    currency: 'INR',  symbol: '₹',    locale: 'en-IN' }, // India
  '+92':  { language: 'Urdu',       currency: 'PKR',  symbol: '₨',    locale: 'ur-PK' }, // Pakistan
  '+880': { language: 'Bengali',    currency: 'BDT',  symbol: '৳',    locale: 'bn-BD' }, // Bangladesh
  '+86':  { language: 'Chinese',    currency: 'CNY',  symbol: '¥',    locale: 'zh-CN' }, // China
  '+81':  { language: 'Japanese',   currency: 'JPY',  symbol: '¥',    locale: 'ja-JP' }, // Japan
  '+82':  { language: 'Korean',     currency: 'KRW',  symbol: '₩',    locale: 'ko-KR' }, // South Korea
  '+66':  { language: 'Thai',       currency: 'THB',  symbol: '฿',    locale: 'th-TH' }, // Thailand
  '+84':  { language: 'Vietnamese', currency: 'VND',  symbol: '₫',    locale: 'vi-VN' }, // Vietnam
  '+63':  { language: 'English',    currency: 'PHP',  symbol: '₱',    locale: 'en-PH' }, // Philippines
  '+62':  { language: 'Indonesian', currency: 'IDR',  symbol: 'Rp',   locale: 'id-ID' }, // Indonesia
  '+60':  { language: 'Malay',      currency: 'MYR',  symbol: 'RM',   locale: 'ms-MY' }, // Malaysia
  '+65':  { language: 'English',    currency: 'SGD',  symbol: 'S$',   locale: 'en-SG' }, // Singapore
  '+61':  { language: 'English',    currency: 'AUD',  symbol: 'A$',   locale: 'en-AU' }, // Australia
  '+64':  { language: 'English',    currency: 'NZD',  symbol: 'NZ$',  locale: 'en-NZ' }, // New Zealand
  '+55':  { language: 'Portuguese', currency: 'BRL',  symbol: 'R$',   locale: 'pt-BR' }, // Brazil
  '+54':  { language: 'Spanish',    currency: 'ARS',  symbol: '$',    locale: 'es-AR' }, // Argentina
  '+52':  { language: 'Spanish',    currency: 'MXN',  symbol: '$',    locale: 'es-MX' }, // Mexico
  '+57':  { language: 'Spanish',    currency: 'COP',  symbol: '$',    locale: 'es-CO' }, // Colombia
  '+56':  { language: 'Spanish',    currency: 'CLP',  symbol: '$',    locale: 'es-CL' }, // Chile
};

/* ── Supported UI languages ── */
export const LANGUAGES = [
  { code: 'English',    label: 'English',    flag: '🇬🇧' },
  { code: 'French',     label: 'Français',   flag: '🇫🇷' },
  { code: 'Spanish',    label: 'Español',    flag: '🇪🇸' },
  { code: 'Portuguese', label: 'Português',  flag: '🇵🇹' },
  { code: 'Arabic',     label: 'العربية',    flag: '🇸🇦' },
  { code: 'German',     label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'Chinese',    label: '中文',        flag: '🇨🇳' },
  { code: 'Japanese',   label: '日本語',      flag: '🇯🇵' },
  { code: 'Korean',     label: '한국어',      flag: '🇰🇷' },
  { code: 'Swahili',    label: 'Kiswahili',  flag: '🇰🇪' },
  { code: 'Kinyarwanda',label: 'Kinyarwanda',flag: '🇷🇼' },
];

/* ── Supported currencies ── */
export const CURRENCIES = [
  { code: 'RWF', symbol: 'RWF',  name: 'Rwandan Franc',    flag: '🇷🇼' },
  { code: 'USD', symbol: '$',    name: 'US Dollar',         flag: '🇺🇸' },
  { code: 'EUR', symbol: '€',    name: 'Euro',              flag: '🇪🇺' },
  { code: 'GBP', symbol: '£',    name: 'British Pound',     flag: '🇬🇧' },
  { code: 'KES', symbol: 'KSh',  name: 'Kenyan Shilling',   flag: '🇰🇪' },
  { code: 'UGX', symbol: 'USh',  name: 'Ugandan Shilling',  flag: '🇺🇬' },
  { code: 'TZS', symbol: 'TSh',  name: 'Tanzanian Shilling',flag: '🇹🇿' },
  { code: 'NGN', symbol: '₦',    name: 'Nigerian Naira',    flag: '🇳🇬' },
  { code: 'ZAR', symbol: 'R',    name: 'South African Rand',flag: '🇿🇦' },
  { code: 'GHS', symbol: '₵',    name: 'Ghanaian Cedi',     flag: '🇬🇭' },
  { code: 'INR', symbol: '₹',    name: 'Indian Rupee',      flag: '🇮🇳' },
  { code: 'CNY', symbol: '¥',    name: 'Chinese Yuan',      flag: '🇨🇳' },
  { code: 'JPY', symbol: '¥',    name: 'Japanese Yen',      flag: '🇯🇵' },
  { code: 'AED', symbol: 'AED',  name: 'UAE Dirham',        flag: '🇦🇪' },
  { code: 'SAR', symbol: 'SR',   name: 'Saudi Riyal',       flag: '🇸🇦' },
  { code: 'BRL', symbol: 'R$',   name: 'Brazilian Real',    flag: '🇧🇷' },
  { code: 'AUD', symbol: 'A$',   name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', symbol: 'CA$',  name: 'Canadian Dollar',   flag: '🇨🇦' },
];

/* ── Exchange rates relative to RWF (base) ── */
const RATES_FROM_RWF = {
  RWF: 1,
  USD: 0.00073,
  EUR: 0.00067,
  GBP: 0.00057,
  KES: 0.094,
  UGX: 2.72,
  TZS: 1.87,
  NGN: 1.12,
  ZAR: 0.013,
  GHS: 0.0088,
  INR: 0.061,
  CNY: 0.0053,
  JPY: 0.11,
  AED: 0.0027,
  SAR: 0.0027,
  BRL: 0.0037,
  AUD: 0.0011,
  CAD: 0.001,
};

/* ── Detect locale from phone number ── */
export const detectLocaleFromPhone = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/\s/g, '');
  // Try longest match first (e.g. +250 before +2)
  const sorted = Object.keys(DIAL_LOCALE_MAP).sort((a, b) => b.length - a.length);
  for (const dial of sorted) {
    if (cleaned.startsWith(dial)) return DIAL_LOCALE_MAP[dial];
  }
  return null;
};

/* ── UI translations (key phrases) ── */
export const TRANSLATIONS = {
  English: {
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    price: 'Price',
    total: 'Total',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    checkout: 'Proceed to Checkout',
    search: 'Search products...',
    searchPlaceholder: 'Search premium inventory...',
    categories: 'Categories',
    bestSellers: 'Best Sellers',
    newArrivals: 'New Arrivals',
    viewAll: 'View All',
    shopNow: 'Shop Now',
    welcome: 'Welcome back',
    welcomeUser: 'Welcome',
    signIn: 'Sign In',
    register: 'Create Account',
    myOrders: 'My Orders',
    wishlist: 'Wishlist',
    cart: 'Cart',
    home: 'Home',
    shop: 'Shop',
    contact: 'Contact',
    services: 'Services',
    deals: 'Deals',
    off: 'OFF',
    reviews: 'Reviews',
    writeReview: 'Write a Review',
    noProducts: 'No products found',
    loading: 'Loading...',
    delivery: 'Delivery',
    kigaliFree: 'Free in Kigali',
    outsideKigali: 'Outside Kigali',
    trackOrder: 'Track Order',
    helpCenter: 'Help Center',
    myAccount: 'My Account',
    authenticatedAs: 'Authenticated As',
    dashboard: 'Dashboard',
    accountSettings: 'Account Settings',
    signOut: 'Secure Sign Out',
    login: 'Login',
    toolsForTechnicians: 'Tools for Technicians',
    spareParts: 'Spare Parts',
    batteries: 'Batteries',
    screens: 'Screens',
    phonesTablets: 'Phones & Tablets',
    laptopsComputers: 'Laptops & Computers',
    tvEntertainment: 'TV & Entertainment',
    headphonesAudio: 'Headphones & Audio',
    wearables: 'Wearables',
    gaming: 'Gaming',
    accessories: 'Accessories',
    smartHome: 'Smart Home',
    smartGadgets: 'Smart Gadgets',
    dealsOffers: 'Deals & Offers',
    stayInLoop: 'Stay in the loop',
    newsletterDesc: 'Get exclusive deals and new arrivals straight to your inbox.',
    subscribe: 'Subscribe',
    quickLinks: 'Quick Links',
    shopAll: 'Shop All',
    contactUs: 'Contact Us',
    downloadApp: 'Download App',
    allRightsReserved: 'All Rights Reserved',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    trustedStore: "Rwanda's #1 trusted store for premium phone parts, accessories and repair tools.",
    phoneScreens: 'Phone Screens',
    backCovers: 'Back Covers',
    chargers: 'Chargers',
    repairTools: 'Repair Tools',
    phoneCases: 'Phone Cases',
    shopByCategory: 'Shop by Category',
    viewAllCategories: 'View All Categories',
    priceStartsAt: 'Price Starts At',
    bookRepair: 'Book Repair',
    noSlidesAvailable: 'No Slides Available',
    featuredProducts: 'Featured Products',
    freeShipping: 'Free Shipping',
    inKigali: 'In Kigali',
    securePayment: 'Secure Payment',
    securePaymentDesc: '100% secure payment',
    easyReturns: 'Easy Returns',
    returnPolicy: '30-day return policy',
    support247: '24/7 Support',
    dedicatedSupport: 'Dedicated support',
    phoneScreenGlasses: 'Phone Screen Glasses',
    backDoorsCovers: 'Back Doors / Covers',
    phoneBatteries: 'Phone Batteries',
    chargingAccessories: 'Charging Accessories',
    phoneBoardsICs: 'Phone Boards & ICs',
    camerasSensors: 'Cameras & Sensors',
    casesProtection: 'Cases & Protection',
    laptopAccessories: 'Laptop Accessories',
    premiumSelection: 'Premium Selection',
    featured: 'Featured',
    stock: 'Stock',
    viewAllInventory: 'View All Inventory',
    expertSolutions: 'Expert Solutions',
    professional: 'Professional',
    repairs: 'Repairs',
    repairServicesDesc: "We don't just sell parts; we provide expert repair services for all your digital devices.",
    screenReplacement: 'Screen Replacement',
    screenReplacementDesc: 'Original & premium quality screens for all major brands with 3 months warranty.',
    motherboardRepair: 'Motherboard Repair',
    motherboardRepairDesc: 'Advanced IC replacement and micro-soldering by certified technicians.',
    batteryServices: 'Battery Services',
    batteryServicesDesc: "High-capacity battery replacement to restore your device's peak performance.",
    learnMore: 'Learn More',
    poweringYour: 'Powering Your',
    digitalWorld: 'Digital World',
    enterEmail: 'Enter your email',
    joinNow: 'Join Now',
    allProducts: 'All Products',
    chargersCables: 'Chargers & Cables',
    phoneDoors: 'Phone Doors',
    saBoards: 'SA Boards',
    chargePorts: 'Charge Ports',
    newestFirst: 'Newest First',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    bestRated: 'Best Rated',
    shopAllProducts: 'Shop All Products',
    shopAllProductsDesc: 'Find all high quality phone accessories and repair tools',
    sortBy: 'Sort by',
    filterByPrice: 'Filter by Price',
    brands: 'Brands',
    viewMore: 'View More',
    showing: 'Showing',
    of: 'of',
    fastDelivery: 'Fast Delivery',
    acrossRwanda: 'Across Rwanda',
    originalProducts: '100% Original',
    genuineProducts: 'Genuine Products',
    secure: '100% Secure',
    weAreHere: 'We are here',
    daysReturn: '7 Days Return',
    loadingDetails: 'Loading Details...',
    productNotFound: 'Product not found',
    backToShop: 'Back to Shop',
    removedFromWishlist: 'Removed from wishlist',
    addedToWishlist: 'Added to wishlist',
    brand: 'Brand',
    compatibleWith: 'Compatible with',
    freeDeliveryInKigali: 'Free delivery within Kigali',
    description: 'Description',
    quantity: 'Quantity',
    availability: 'Availability',
    units: 'units',
    lowStockOrderSoon: 'Low Stock - Order Soon!',
    shopMore: 'Shop More',
    genuineProduct: 'Genuine Product',
    authenticAccessories: '100% authentic accessories',
    fastShippingDesc: 'Same day delivery in Kigali',
    easyReturnsDesc: '7-day replacement guarantee',
    freeShippingDesc: 'On orders over RWF 50,000',
    secureCheckout: '100% secure checkout',
    cartEmpty: 'Your Cart is Empty',
    cartEmptyDesc: "You haven't added anything yet. Start shopping!",
    startShopping: 'Start Shopping',
    items: 'items',
    item: 'item',
    deliveryLocation: 'Delivery location',
    kigali: 'Kigali',
    outsideKigaliFee: 'Outside Kigali — RWF 2,000',
    continueShopping: 'Continue Shopping',
    clearCart: 'Clear Cart',
    orderSummary: 'Order Summary',
    couponCode: 'Coupon Code',
    apply: 'Apply',
    invalidCoupon: 'Invalid coupon code',
    yourCart: 'Your Cart',
    momoInstructions: 'Follow these steps to pay:',
    dialCode: 'Dial *182*1*1# on your MTN line',
    merchantCode: 'Enter merchant code: DODOS-PAY',
    amountToPay: 'Amount to pay',
    yourMomoNumber: 'Your MoMo number',
    ivePaid: "I've Paid",
    deliveryInfo: 'Delivery Information',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    district: 'District',
    sector: 'Sector',
    streetAddress: 'Street Address / Building',
    paymentMethod: 'Payment Method',
    momoPay: 'MTN MoMo Pay',
    momoPayDesc: 'Pay securely with MTN Mobile Money',
    cashOnDelivery: 'Cash on Delivery',
    cashOnDeliveryDesc: 'Pay when you receive your order',
    bankTransfer: 'Bank Transfer',
    bankTransferDesc: 'Transfer to our bank account',
    orderTotal: 'Order Total',
    placingOrder: 'Placing Order...',
    placeOrder: 'Place Order',
    momoInstructionsLong: 'After completing the payment, click "I\'ve Paid" to confirm your order.',
    subscribedSuccess: 'Successfully subscribed to newsletter!',
    subscribedError: 'Failed to subscribe. Please try again.',
  },
  French: {
    addToCart: 'Ajouter au panier',
    buyNow: 'Acheter maintenant',
    outOfStock: 'Rupture de stock',
    inStock: 'En stock',
    price: 'Prix',
    total: 'Total',
    subtotal: 'Sous-total',
    shipping: 'Livraison',
    free: 'Gratuit',
    checkout: 'Passer à la caisse',
    search: 'Rechercher des produits...',
    searchPlaceholder: 'Rechercher dans l\'inventaire premium...',
    categories: 'Catégories',
    bestSellers: 'Meilleures ventes',
    newArrivals: 'Nouveautés',
    viewAll: 'Voir tout',
    shopNow: 'Acheter maintenant',
    welcome: 'Bon retour',
    welcomeUser: 'Bienvenue',
    signIn: 'Se connecter',
    register: 'Créer un compte',
    myOrders: 'Mes commandes',
    wishlist: 'Liste de souhaits',
    cart: 'Panier',
    home: 'Accueil',
    shop: 'Boutique',
    contact: 'Contact',
    services: 'Services',
    deals: 'Offres',
    off: 'DE RÉDUCTION',
    reviews: 'Avis',
    writeReview: 'Écrire un avis',
    noProducts: 'Aucun produit trouvé',
    loading: 'Chargement...',
    delivery: 'Livraison',
    kigaliFree: 'Gratuit à Kigali',
    outsideKigali: 'Hors de Kigali',
    trackOrder: 'Suivre la commande',
    helpCenter: 'Centre d\'aide',
    myAccount: 'Mon compte',
    authenticatedAs: 'Authentifié en tant que',
    dashboard: 'Tableau de bord',
    accountSettings: 'Paramètres du compte',
    signOut: 'Déconnexion sécurisée',
    login: 'Connexion',
    toolsForTechnicians: 'Outils pour techniciens',
    spareParts: 'Pièces de rechange',
    batteries: 'Batteries',
    screens: 'Écrans',
    phonesTablets: 'Téléphones & Tablettes',
    laptopsComputers: 'Ordinateurs & Portables',
    tvEntertainment: 'TV & Divertissement',
    headphonesAudio: 'Casques & Audio',
    wearables: 'Objets connectés',
    gaming: 'Jeux vidéo',
    accessories: 'Accessoires',
    smartHome: 'Maison intelligente',
    smartGadgets: 'Gadgets intelligents',
    dealsOffers: 'Offres & Promotions',
    stayInLoop: 'Restez informé',
    newsletterDesc: 'Recevez des offres exclusives et les nouveautés directement dans votre boîte mail.',
    subscribe: 'S\'abonner',
    quickLinks: 'Liens rapides',
    shopAll: 'Tout acheter',
    contactUs: 'Contactez-nous',
    downloadApp: 'Télécharger l\'application',
    allRightsReserved: 'Tous droits réservés',
    privacyPolicy: 'Politique de confidentialité',
    termsOfService: 'Conditions d\'utilisation',
    trustedStore: "Le magasin n°1 de confiance au Rwanda pour les pièces de téléphone premium, les accessoires et les outils de réparation.",
    phoneScreens: 'Écrans de téléphone',
    backCovers: 'Caches arrière',
    chargers: 'Chargeurs',
    repairTools: 'Outils de réparation',
    phoneCases: 'Coques de téléphone',
    shopByCategory: 'Acheter par catégorie',
    viewAllCategories: 'Voir toutes les catégories',
    priceStartsAt: 'À partir de',
    bookRepair: 'Réserver une réparation',
    noSlidesAvailable: 'Aucun slide disponible',
    featuredProducts: 'Produits vedettes',
    freeShipping: 'Livraison gratuite',
    inKigali: 'À Kigali',
    securePayment: 'Paiement sécurisé',
    securePaymentDesc: 'Paiement 100% sécurisé',
    easyReturns: 'Retours faciles',
    returnPolicy: 'Politique de retour de 30 jours',
    support247: 'Support 24/7',
    dedicatedSupport: 'Support dédié',
    phoneScreenGlasses: 'Verres d\'écran de téléphone',
    backDoorsCovers: 'Caches arrière / Portes',
    phoneBatteries: 'Batteries de téléphone',
    chargingAccessories: 'Accessoires de charge',
    phoneBoardsICs: 'Cartes de téléphone & IC',
    camerasSensors: 'Caméras & Capteurs',
    casesProtection: 'Coques & Protection',
    laptopAccessories: 'Accessoires d\'ordinateur portable',
    premiumSelection: 'Sélection Premium',
    featured: 'En vedette',
    stock: 'Stock',
    viewAllInventory: 'Voir tout l\'inventaire',
    expertSolutions: 'Solutions d\'experts',
    professional: 'Professionnel',
    repairs: 'Réparations',
    repairServicesDesc: "Nous ne vendons pas seulement des pièces ; nous fournissons des services de réparation experts pour tous vos appareils numériques.",
    screenReplacement: 'Remplacement d\'écran',
    screenReplacementDesc: 'Écrans originaux et de qualité premium pour toutes les grandes marques avec 3 mois de garantie.',
    motherboardRepair: 'Réparation de carte mère',
    motherboardRepairDesc: 'Remplacement avancé de CI et micro-soudure par des techniciens certifiés.',
    batteryServices: 'Services de batterie',
    batteryServicesDesc: "Remplacement de batterie haute capacité pour restaurer les performances de pointe de votre appareil.",
    learnMore: 'En savoir plus',
    poweringYour: 'Propulsez votre',
    digitalWorld: 'Monde numérique',
    enterEmail: 'Entrez votre email',
    joinNow: 'Inscrivez-vous',
    allProducts: 'Tous les produits',
    chargersCables: 'Chargeurs & Câbles',
    phoneDoors: 'Portes de téléphone',
    saBoards: 'Cartes SA',
    chargePorts: 'Ports de charge',
    newestFirst: 'Plus récents',
    priceLowHigh: 'Prix : Croissant',
    priceHighLow: 'Prix : Décroissant',
    bestRated: 'Mieux notés',
    shopAllProducts: 'Tous les produits',
    shopAllProductsDesc: 'Trouvez tous les accessoires de téléphone et outils de réparation de haute qualité',
    sortBy: 'Trier par',
    filterByPrice: 'Filtrer par prix',
    brands: 'Marques',
    viewMore: 'Voir plus',
    showing: 'Affichage de',
    of: 'sur',
    fastDelivery: 'Livraison rapide',
    acrossRwanda: 'Partout au Rwanda',
    originalProducts: '100% Original',
    genuineProducts: 'Produits authentiques',
    secure: '100% Sécurisé',
    weAreHere: 'Nous sommes là',
    daysReturn: '7 jours de retour',
    loadingDetails: 'Chargement des détails...',
    productNotFound: 'Produit non trouvé',
    backToShop: 'Retour à la boutique',
    removedFromWishlist: 'Retiré de la liste de souhaits',
    addedToWishlist: 'Ajouté à la liste de souhaits',
    brand: 'Marque',
    compatibleWith: 'Compatible avec',
    freeDeliveryInKigali: 'Livraison gratuite à Kigali',
    description: 'Description',
    quantity: 'Quantité',
    availability: 'Disponibilité',
    units: 'unités',
    lowStockOrderSoon: 'Stock faible - Commandez vite !',
    shopMore: 'Acheter plus',
    genuineProduct: 'Produit authentique',
    authenticAccessories: '100% accessoires authentiques',
    fastShippingDesc: 'Livraison le jour même à Kigali',
    easyReturnsDesc: 'Garantie de remplacement de 7 jours',
    freeShippingDesc: 'Sur les commandes de plus de 50 000 RWF',
    secureCheckout: 'Paiement 100% sécurisé',
    cartEmpty: 'Votre panier est vide',
    cartEmptyDesc: "Vous n'avez encore rien ajouté. Commencez vos achats !",
    startShopping: 'Commencer les achats',
    items: 'articles',
    item: 'article',
    deliveryLocation: 'Lieu de livraison',
    kigali: 'Kigali',
    outsideKigaliFee: 'Hors de Kigali — 2 000 RWF',
    continueShopping: 'Continuer les achats',
    clearCart: 'Vider le panier',
    orderSummary: 'Résumé de la commande',
    couponCode: 'Code promo',
    apply: 'Appliquer',
    invalidCoupon: 'Code promo invalide',
    yourCart: 'Votre panier',
    momoInstructions: 'Suivez ces étapes pour payer :',
    dialCode: 'Composez *182*1*1# sur votre ligne MTN',
    merchantCode: 'Entrez le code marchand : DODOS-PAY',
    amountToPay: 'Montant à payer',
    yourMomoNumber: 'Votre numéro MoMo',
    ivePaid: "J'ai payé",
    deliveryInfo: 'Informations de livraison',
    fullName: 'Nom complet',
    phoneNumber: 'Numéro de téléphone',
    district: 'District',
    sector: 'Secteur',
    streetAddress: 'Adresse / Bâtiment',
    paymentMethod: 'Mode de paiement',
    momoPay: 'Paiement MTN MoMo',
    momoPayDesc: 'Payez en toute sécurité avec MTN Mobile Money',
    cashOnDelivery: 'Paiement à la livraison',
    cashOnDeliveryDesc: 'Payez à la réception de votre commande',
    bankTransfer: 'Virement bancaire',
    bankTransferDesc: 'Virement sur notre compte bancaire',
    orderTotal: 'Total de la commande',
    placingOrder: 'Passage de la commande...',
    placeOrder: 'Passer la commande',
    momoInstructionsLong: 'Après avoir effectué le paiement, cliquez sur "J\'ai payé" pour confirmer votre commande.',
    subscribedSuccess: 'Inscription à la newsletter réussie !',
    subscribedError: "Échec de l'inscription. Veuillez réessayer.",
  },
  Spanish: {
    addToCart: 'Agregar al carrito',
    buyNow: 'Comprar ahora',
    outOfStock: 'Agotado',
    inStock: 'En stock',
    price: 'Precio',
    total: 'Total',
    subtotal: 'Subtotal',
    shipping: 'Envío',
    free: 'Gratis',
    checkout: 'Proceder al pago',
    search: 'Buscar productos...',
    categories: 'Categorías',
    bestSellers: 'Más vendidos',
    newArrivals: 'Novedades',
    viewAll: 'Ver todo',
    shopNow: 'Comprar ahora',
    welcome: 'Bienvenido de nuevo',
    signIn: 'Iniciar sesión',
    register: 'Crear cuenta',
    myOrders: 'Mis pedidos',
    wishlist: 'Lista de deseos',
    cart: 'Carrito',
    home: 'Inicio',
    shop: 'Tienda',
    contact: 'Contacto',
    services: 'Servicios',
    deals: 'Ofertas',
    off: 'DE DESCUENTO',
    reviews: 'Reseñas',
    writeReview: 'Escribir reseña',
    noProducts: 'No se encontraron productos',
    loading: 'Cargando...',
    delivery: 'Entrega',
    kigaliFree: 'Gratis en Kigali',
    outsideKigali: 'Fuera de Kigali',
  },
  Portuguese: {
    addToCart: 'Adicionar ao carrinho',
    buyNow: 'Comprar agora',
    outOfStock: 'Esgotado',
    inStock: 'Em estoque',
    price: 'Preço',
    total: 'Total',
    subtotal: 'Subtotal',
    shipping: 'Frete',
    free: 'Grátis',
    checkout: 'Finalizar compra',
    search: 'Pesquisar produtos...',
    categories: 'Categorias',
    bestSellers: 'Mais vendidos',
    newArrivals: 'Novidades',
    viewAll: 'Ver tudo',
    shopNow: 'Comprar agora',
    welcome: 'Bem-vindo de volta',
    signIn: 'Entrar',
    register: 'Criar conta',
    myOrders: 'Meus pedidos',
    wishlist: 'Lista de desejos',
    cart: 'Carrinho',
    home: 'Início',
    shop: 'Loja',
    contact: 'Contato',
    services: 'Serviços',
    deals: 'Ofertas',
    off: 'DE DESCONTO',
    reviews: 'Avaliações',
    writeReview: 'Escrever avaliação',
    noProducts: 'Nenhum produto encontrado',
    loading: 'Carregando...',
    delivery: 'Entrega',
    kigaliFree: 'Grátis em Kigali',
    outsideKigali: 'Fora de Kigali',
  },
  Kinyarwanda: {
    addToCart: 'Ongeraho mu gasanduku',
    buyNow: 'Gura ubu',
    outOfStock: 'Nta ruhare',
    inStock: 'Bihari',
    price: 'Igiciro',
    total: 'Igiteranyo',
    subtotal: 'Igice cy\'igiteranyo',
    shipping: 'Kohereza',
    free: 'Ubuntu',
    checkout: 'Soza kugura',
    search: 'Shakisha ibicuruzwa...',
    searchPlaceholder: 'Shakisha mu bikoresho byiza...',
    categories: 'Ibyiciro',
    bestSellers: 'Bikunzwe cyane',
    newArrivals: 'Bishya',
    viewAll: 'Reba byose',
    shopNow: 'Gura ubu',
    welcome: 'Murakaza neza',
    welcomeUser: 'Murakaza neza',
    signIn: 'Injira',
    register: 'Fungura konti',
    myOrders: 'Amaporosi yanjye',
    wishlist: 'Ibyo nshaka',
    cart: 'Gasanduku',
    home: 'Ahabanza',
    shop: 'Iduka',
    contact: 'Twandikire',
    services: 'Serivisi',
    deals: 'Amafaranga make',
    off: 'IGABANYIJWE',
    reviews: 'Ibitekerezo',
    writeReview: 'Andika igitekerezo',
    noProducts: 'Nta bicuruzwa bibonetse',
    loading: 'Gutegereza...',
    delivery: 'Kohereza',
    kigaliFree: 'Ubuntu i Kigali',
    outsideKigali: 'Hanze ya Kigali',
    trackOrder: 'Kurikirana iporosi',
    helpCenter: 'Ubufasha',
    myAccount: 'Konti yanjye',
    authenticatedAs: 'Winjiye nka',
    dashboard: 'Ahabanza',
    accountSettings: 'Igenamiterere',
    signOut: 'Sohoka',
    login: 'Injira',
    toolsForTechnicians: 'Ibikoresho by\'abatekinisiye',
    spareParts: 'Ibyuma bisimbura',
    batteries: 'Bateri',
    screens: 'Ekuranyi',
    phonesTablets: 'Terefone & Tablete',
    laptopsComputers: 'Mudasobwa',
    tvEntertainment: 'TV & Imyidagaduro',
    headphonesAudio: 'Ekuteri & Amajwi',
    wearables: 'Ibikoresho byambarwa',
    gaming: 'Imikino',
    accessories: 'Ibikoresho binyuranye',
    smartHome: 'Inzu yubatswe kijyambere',
    smartGadgets: 'Gadget zigezweho',
    dealsOffers: 'Gabanirwa',
  },
  Swahili: {
    addToCart: 'Ongeza kwenye kikapu',
    buyNow: 'Nunua sasa',
    outOfStock: 'Haipatikani',
    inStock: 'Inapatikana',
    price: 'Bei',
    total: 'Jumla',
    subtotal: 'Jumla ndogo',
    shipping: 'Usafirishaji',
    free: 'Bure',
    checkout: 'Endelea kulipa',
    search: 'Tafuta bidhaa...',
    searchPlaceholder: 'Tafuta bidhaa bora...',
    categories: 'Makundi',
    bestSellers: 'Zinauzwa zaidi',
    newArrivals: 'Mpya',
    viewAll: 'Ona zote',
    shopNow: 'Nunua sasa',
    welcome: 'Karibu tena',
    welcomeUser: 'Karibu',
    signIn: 'Ingia',
    register: 'Fungua akaunti',
    myOrders: 'Maagizo yangu',
    wishlist: 'Orodha ya matakwa',
    cart: 'Kikapu',
    home: 'Nyumbani',
    shop: 'Duka',
    contact: 'Wasiliana',
    services: 'Huduma',
    deals: 'Ofa',
    off: 'PUNGUZO',
    reviews: 'Maoni',
    writeReview: 'Andika maoni',
    noProducts: 'Hakuna bidhaa zilizopatikana',
    loading: 'Inapakia...',
    delivery: 'Uwasilishaji',
    kigaliFree: 'Bure Kigali',
    outsideKigali: 'Nje ya Kigali',
    trackOrder: 'Fuatilia agizo',
    helpCenter: 'Kituo cha usaidizi',
    myAccount: 'Akaunti yangu',
    authenticatedAs: 'Umeingia kama',
    dashboard: 'Dashibodi',
    accountSettings: 'Mipangilio ya akaunti',
    signOut: 'Ondoka salama',
    login: 'Ingia',
    toolsForTechnicians: 'Vifaa vya mafundi',
    spareParts: 'Vifaa vya ziada',
    batteries: 'Betri',
    screens: 'Skrini',
    phonesTablets: 'Simu & Kompyuta kibao',
    laptopsComputers: 'Kompyuta & Kompyuta mpakato',
    tvEntertainment: 'TV & Burudani',
    headphonesAudio: 'Vifaa vya masikioni',
    wearables: 'Vifaa vinavyovaliwa',
    gaming: 'Michezo',
    accessories: 'Vifaa',
    smartHome: 'Nyumba ya kisasa',
    smartGadgets: 'Vifaa vya kisasa',
    dealsOffers: 'Ofa & Mapunguzo',
  },
};

/* ── Fallback to English for any missing key ── */
const t = (lang, key) =>
  TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['English'][key] ?? key;

/* ─────────────────────────────────────────────
   CONTEXT
───────────────────────────────────────────── */
const LocaleContext = createContext();

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
};

const STORAGE_KEY = 'dodos_locale';

const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    
    // Auto-detect if no saved preference
    const browserLang = navigator.language || navigator.userLanguage;
    const detectedLang = LANGUAGES.find(l => 
      browserLang.toLowerCase().startsWith(l.code.toLowerCase()) ||
      (l.code === 'English' && browserLang.startsWith('en')) ||
      (l.code === 'French' && browserLang.startsWith('fr')) ||
      (l.code === 'Spanish' && browserLang.startsWith('es')) ||
      (l.code === 'Portuguese' && browserLang.startsWith('pt')) ||
      (l.code === 'Arabic' && browserLang.startsWith('ar')) ||
      (l.code === 'German' && browserLang.startsWith('de')) ||
      (l.code === 'Chinese' && browserLang.startsWith('zh')) ||
      (l.code === 'Japanese' && browserLang.startsWith('ja')) ||
      (l.code === 'Korean' && browserLang.startsWith('ko'))
    );

    // Try to guess currency from locale
    let detectedCurrency = 'RWF';
    if (browserLang.includes('US')) detectedCurrency = 'USD';
    else if (browserLang.includes('GB')) detectedCurrency = 'GBP';
    else if (browserLang.includes('KE')) detectedCurrency = 'KES';
    else if (browserLang.includes('UG')) detectedCurrency = 'UGX';
    else if (browserLang.includes('TZ')) detectedCurrency = 'TZS';
    else if (browserLang.includes('NG')) detectedCurrency = 'NGN';
    else if (browserLang.includes('ZA')) detectedCurrency = 'ZAR';
    else if (browserLang.includes('EU')) detectedCurrency = 'EUR';
    else if (['FR', 'DE', 'IT', 'ES', 'PT', 'NL', 'BE'].some(c => browserLang.includes(c))) detectedCurrency = 'EUR';

    return { 
      language: detectedLang?.code || 'English', 
      currency: detectedCurrency 
    };
  } catch { return null; }
};

export const LocaleProvider = ({ children }) => {
  const saved = loadSaved();

  const [language, setLanguageState] = useState(saved?.language || 'English');
  const [currency, setCurrencyState] = useState(saved?.currency || 'RWF');

  /* persist to localStorage whenever they change */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ language, currency }));
  }, [language, currency]);

  /* Apply RTL for Arabic */
  useEffect(() => {
    document.documentElement.dir = language === 'Arabic' ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'English' ? 'en'
      : language === 'French' ? 'fr'
      : language === 'Spanish' ? 'es'
      : language === 'Portuguese' ? 'pt'
      : language === 'Arabic' ? 'ar'
      : language === 'Kinyarwanda' ? 'rw'
      : language === 'Swahili' ? 'sw'
      : 'en';
  }, [language]);

  /* Auto-detect from phone number (called after register/login) */
  const applyLocaleFromPhone = useCallback((phone) => {
    const detected = detectLocaleFromPhone(phone);
    if (!detected) return;
    setLanguageState(detected.language);
    setCurrencyState(detected.currency);
  }, []);

  /* Manual overrides */
  const setLanguage = useCallback((lang) => setLanguageState(lang), []);
  const setCurrency = useCallback((cur)  => setCurrencyState(cur),  []);

  /* Convert a price from RWF to the active currency */
  const convertPrice = useCallback((rwfAmount) => {
    const rate = RATES_FROM_RWF[currency] ?? 1;
    return Math.round(rwfAmount * rate * 100) / 100;
  }, [currency]);

  /* Format a price with symbol */
  const formatPrice = useCallback((rwfAmount) => {
    const converted = convertPrice(rwfAmount);
    const cur = CURRENCIES.find(c => c.code === currency);
    const sym = cur?.symbol ?? currency;

    if (currency === 'RWF') return `RWF ${converted.toLocaleString()}`;
    if (['JPY', 'KRW', 'IDR', 'VND'].includes(currency)) {
      return `${sym}${Math.round(converted).toLocaleString()}`;
    }
    return `${sym}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [currency, convertPrice]);

  /* Translate a UI key */
  const translate = useCallback((key) => t(language, key), [language]);

  const value = {
    language,
    currency,
    setLanguage,
    setCurrency,
    applyLocaleFromPhone,
    convertPrice,
    formatPrice,
    translate,
    t: translate,
    LANGUAGES,
    CURRENCIES,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};
