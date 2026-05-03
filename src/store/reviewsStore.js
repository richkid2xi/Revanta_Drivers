// Mock Auth Session
export const getCurrentCorporationId = () => {
  return localStorage.getItem('revanta_session_corporation_id') || 'H001';
};

export const getActiveDriverId = () => {
  return localStorage.getItem('revanta_active_driver') || 'DRV-0042';
};

export const RATING_LABELS = {
  5: 'Very Satisfied',
  4: 'Satisfied',
  3: 'Neutral',
  2: 'Dissatisfied',
  1: 'Very Dissatisfied'
};

export const generateMockReviews = () => {
  const reviews = [];
  const statuses = ['unread', 'read', 'reviewed'];
  const itComments = [
    "The driver was very professional and the ride was smooth.",
    "Excellent service, arrived exactly on time.",
    "Clean vehicle and very friendly driver.",
    "Safe driving, highly recommend this driver.",
    "The trip was efficient and the route was optimal.",
    "Very helpful driver with my luggage.",
    "Professional conduct and great communication.",
    "The vehicle was well-maintained and comfortable.",
    "Quick pickup and smooth transit to my destination.",
    "Great overall experience, will use this service again."
  ];

  const authors = [
    { name: "Kwame Asante", email: "kwame.a@example.com", phone: "+233 24 000 0000" },
    { name: "Abena Mensah", email: "abena.m@example.com", phone: "+233 20 111 1111" },
    { name: "Kofi Boateng", email: "kofi.b@example.com", phone: "+233 55 222 2222" },
    null
  ];

  const settings = getCorporationSettings();
  const drivers = settings.drivers || [];
  const baseDate = new Date();

  for (let i = 0; i < 60; i++) {
    const rawDate = new Date(baseDate.getTime() - i * 8 * 3600000); 
    const isAnon = i % 4 === 0;
    const rating = Math.floor(Math.random() * 3) + 3; 
    const driver = drivers[i % drivers.length];

    reviews.push({
      corporationId: 'H001',
      driverId: driver.id,
      id: `RDR-2026-${(60 - i).toString().padStart(3, '0')}`,
      rawDate: rawDate.getTime(),
      date: rawDate.toLocaleString(),
      shortDate: `${rawDate.getDate()} ${rawDate.toLocaleString('default', { month: 'short' })}`,
      rating: rating,
      status: statuses[i % 3],
      isAnonymous: isAnon,
      text: rating < 4 ? "A bit of a bumpy ride but okay." : itComments[i % itComments.length],
      author: isAnon ? null : authors[i % authors.length],
      questions: [
        { id: 'q1', text: 'Overall trip experience', value: rating },
        { id: 'q2', text: 'Felt safe during trip', value: rating },
        { id: 'q3', text: 'Obeyed road rules', value: rating >= 3 ? 'Yes' : 'No' },
        { id: 'q4', text: 'Vehicle overloaded', value: rating >= 4 ? 'No' : 'Yes' },
        { id: 'q5', text: 'Avoided phone calls', value: 'Yes' },
        { id: 'q6', text: 'Respectful and professional', value: rating },
        { id: 'q7', text: 'Clean and comfortable', value: rating },
        { id: 'q8', text: 'Mechanical condition', value: 'Yes' },
        { id: 'q9', text: 'Would recommend', value: rating >= 4 ? 'Yes' : 'Maybe' },
        { id: 'q10', text: 'Additional comments', value: '' }
      ],
      servicesSelected: ['Ride'],
      purpose: "Personal",
      notes: ""
    });
  }
  return reviews;
};

export const getAllReviewsRaw = () => {
  const stored = localStorage.getItem('revanta_reviews');
  if (stored) {
    const parsed = JSON.parse(stored);
    
    // Always regenerate if the format is old or missing driverId links
    if (parsed.length === 0 || !parsed[0].driverId || parsed[0].driverId.startsWith('b')) {
      const initial = generateMockReviews();
      localStorage.setItem('revanta_reviews', JSON.stringify(initial));
      return initial;
    }
    return parsed;
  }
  const initial = generateMockReviews();
  localStorage.setItem('revanta_reviews', JSON.stringify(initial));
  return initial;
};

export const getReviews = () => {
  const corporationId = getCurrentCorporationId();
  const all = getAllReviewsRaw();
  return all.filter(r => r.corporationId === corporationId);
};

export const updateReview = (id, updates) => {
  const all = getAllReviewsRaw();
  const corporationId = getCurrentCorporationId();
  const index = all.findIndex(r => r.id === id && r.corporationId === corporationId);
  if (index !== -1) {
    all[index] = { ...all[index], ...updates };
    localStorage.setItem('revanta_reviews', JSON.stringify(all));
  }
  return all.filter(r => r.corporationId === corporationId);
};

export const addReview = (reviewData) => {
  const all = getAllReviewsRaw();
  const corporationId = reviewData.corporationId || getCurrentCorporationId();
  const driverId = reviewData.driverId || getActiveDriverId();
  const nextNum = all.length + 1;
  const review = {
    ...reviewData,
    corporationId,
    driverId,
    id: reviewData.id || `RDR-2026-${nextNum.toString().padStart(3, '0')}`,
  };
  all.unshift(review); 
  localStorage.setItem('revanta_reviews', JSON.stringify(all));
  window.dispatchEvent(new Event('revanta_reviews_updated'));
  return review;
};

export const getCorporationSettings = () => {
  const corporationId = getCurrentCorporationId();
  const defaultSettings = {
    corporationId,
    name: "Accra Executive Transport",
    logo: null,
    primaryLocation: "Accra, Ghana",
    services: {
      ride: true,
      delivery: true,
      luxury: true,
      express: true,
      intercity: true,
      other: true
    },
    drivers: [
      { id: 'DRV-0042', name: 'Kofi Mensah', phone: '0240000000', location: 'Accra, Ghana', token: 'RDR-KFM-42', pin: '1234', status: 'Active', vehicle: 'Taxi', needsPinReset: false },
      { id: 'DRV-1001', name: 'James Boateng', phone: '0201111111', location: 'Airport Residential, Accra', token: 'RDR-JMS-01', pin: '0000', status: 'Active', vehicle: 'Luxury', needsPinReset: false },
      { id: 'DRV-1002', name: 'Kwesi Appiah', phone: '0552222222', location: 'East Legon, Accra', token: 'RDR-KWS-02', pin: '0000', status: 'Active', vehicle: 'Taxi', needsPinReset: false },
      { id: 'DRV-1003', name: 'Ama Serwaa', phone: '0243333333', location: 'Kumasi, Ashanti', token: 'RDR-AMA-03', pin: '0000', status: 'Active', vehicle: 'Ride-hailing', needsPinReset: false }
    ],
    subscription: {
      plan: 'Basic Plan',
      price: '$19/mo',
      nextBilling: 'June 1, 2026',
      driverLimit: 10,
      activeDrivers: 4
    }
  };

  const storedKey = `revanta_corporation_settings_${corporationId}`;
  const stored = localStorage.getItem(storedKey);
  if (stored) {
    const settings = JSON.parse(stored);
    
    // Check if we still have old 'b1' style drivers and convert them
    if (settings.drivers?.some(d => d.id.startsWith('b'))) {
      settings.drivers = defaultSettings.drivers;
      localStorage.setItem(storedKey, JSON.stringify(settings));
    }
    
    // Safety check for demo driver
    if (!settings.drivers?.find(d => d.phone === '0240000000')) {
      settings.drivers = [...(settings.drivers || []), defaultSettings.drivers[0]];
      localStorage.setItem(storedKey, JSON.stringify(settings));
    }
    return settings;
  }
  
  localStorage.setItem(storedKey, JSON.stringify(defaultSettings));
  return defaultSettings;
};

export const updateCorporationSettings = (updates) => {
  const corporationId = getCurrentCorporationId();
  const current = getCorporationSettings();
  const updated = { ...current, ...updates };
  localStorage.setItem(`revanta_corporation_settings_${corporationId}`, JSON.stringify(updated));
  window.dispatchEvent(new Event('revanta_corporation_settings_updated'));
  return updated;
};

export const addDriver = (driverData) => {
  const settings = getCorporationSettings();
  const newDriver = {
    ...driverData,
    id: `DRV-${Math.floor(1000 + Math.random() * 9000).toString()}`,
    token: `RDR-${driverData.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 100)}`,
    status: 'Active',
    needsPinReset: true 
  };
  const updatedDrivers = [...(settings.drivers || []), newDriver];
  updateCorporationSettings({ drivers: updatedDrivers, subscription: { ...settings.subscription, activeDrivers: updatedDrivers.length } });
  return newDriver;
};

export const updateDriver = (driverId, updates) => {
  const settings = getCorporationSettings();
  const index = settings.drivers.findIndex(d => d.id === driverId);
  if (index !== -1) {
    settings.drivers[index] = { ...settings.drivers[index], ...updates };
    updateCorporationSettings({ drivers: settings.drivers });
  }
};

export const deleteDriver = (driverId) => {
  const settings = getCorporationSettings();
  const updatedDrivers = settings.drivers.filter(d => d.id !== driverId);
  updateCorporationSettings({ drivers: updatedDrivers, subscription: { ...settings.subscription, activeDrivers: updatedDrivers.length } });
};

export const findDriverByToken = (token) => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('revanta_corporation_settings_')) {
      const settings = JSON.parse(localStorage.getItem(key));
      const driver = settings.drivers?.find(b => b.token === token);
      if (driver) {
        return { corporationId: settings.corporationId, driver, corporationName: settings.name };
      }
    }
  }
  const defaultSettings = getCorporationSettings();
  const driver = defaultSettings.drivers?.find(b => b.token === token);
  if (driver) {
    return { corporationId: defaultSettings.corporationId, driver, corporationName: defaultSettings.name };
  }
  return null;
};

// Authentication
export const adminLogin = (email, password) => {
  if (email === 'demo@revanta.app' || email === 'demo@riderate.app') {
    if (password === 'demo1234') {
      localStorage.setItem('revanta_session_corporation_id', 'H001');
      return { success: true };
    }
  }
  return { success: false, message: 'Invalid email or password.' };
};

export const driverLogin = (phone, pin) => {
  const settings = getCorporationSettings();
  const driver = settings.drivers?.find(d => d.phone === phone && d.pin === pin);

  if (driver) {
    if (driver.needsPinReset) {
      return { success: true, needsPinReset: true, driverId: driver.id };
    }
    const session = {
      type: 'driver',
      driverId: driver.id,
      name: driver.name,
      corporationId: settings.corporationId,
      corporationName: settings.name,
      vehicle: driver.vehicle,
      status: driver.status
    };
    localStorage.setItem('revanta_driver_session', JSON.stringify(session));
    return { success: true, needsPinReset: false, session };
  }
  return { success: false, message: 'Invalid phone number or PIN.' };
};

export const changeDriverPin = (driverId, newPin) => {
  updateDriver(driverId, { pin: newPin, needsPinReset: false });
};

export const getDriverSession = () => {
  const stored = localStorage.getItem('revanta_driver_session');
  return stored ? JSON.parse(stored) : null;
};

export const driverLogout = () => {
  localStorage.removeItem('revanta_driver_session');
};

export const getDriverReviews = (driverId) => {
  const all = getAllReviewsRaw();
  return all.filter(r => r.driverId === driverId);
};

export const getDetailedDriverStats = (driverId) => {
  const reviews = getDriverReviews(driverId);
  const total = reviews.length;
  if (total === 0) return { 
    avg: '0.0', 
    total: 0, 
    staff: '0.0', 
    reliability: '0.0', 
    respect: '0.0', 
    loyalty: '0%', 
    referral: '0%',
    breakdown: [0,0,0,0,0] 
  };

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = (sum / total).toFixed(1);

  const staffSum = reviews.reduce((acc, r) => {
    const q = r.questions.find(q => q.id === 'q6');
    return acc + (q && typeof q.value === 'number' ? q.value : 0);
  }, 0);
  const staff = (staffSum / total).toFixed(1);

  const relSum = reviews.reduce((acc, r) => {
    const q3 = r.questions.find(q => q.id === 'q3')?.value === 'Yes';
    const q8 = r.questions.find(q => q.id === 'q8')?.value === 'Yes';
    return acc + (q3 ? 2.5 : 0) + (q8 ? 2.5 : 0);
  }, 0);
  const reliability = (relSum / total).toFixed(1);

  const respect = staff;

  const loyaltyCount = reviews.filter(r => {
    const q = r.questions.find(q => q.id === 'q9');
    return q && q.value === 'Yes';
  }).length;
  const loyalty = Math.round((loyaltyCount / total) * 100) + '%';

  const referral = loyalty;

  const breakdown = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      breakdown[r.rating - 1]++;
    }
  });

  return { avg, total, staff, reliability, respect, loyalty, referral, breakdown };
};

export const getDriverStats = (driverId) => {
  const reviews = getDriverReviews(driverId);
  const total = reviews.length;
  if (total === 0) return { avg: 0, total: 0, thisMonth: 0, thisWeek: 0, breakdown: [0,0,0,0,0] };

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = (sum / total).toFixed(1);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();

  const thisMonth = reviews.filter(r => r.rawDate >= startOfMonth).length;
  const thisWeek = reviews.filter(r => r.rawDate >= startOfWeek).length;

  const breakdown = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      breakdown[r.rating - 1]++;
    }
  });

  return { avg, total, thisMonth, thisWeek, breakdown };
};
