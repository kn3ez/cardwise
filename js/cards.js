// CardWise — Credit Card Database
// Data format matches what app.js expects

const SPENDING_CATEGORIES = [
  { id: 'dining', name: 'Dining', icon: '🍽️', description: 'Restaurants, delivery, takeout' },
  { id: 'flights', name: 'Flights', icon: '✈️', description: 'Airline tickets & airfare' },
  { id: 'hotels', name: 'Hotels', icon: '🏨', description: 'Hotel & lodging bookings' },
  { id: 'groceries', name: 'Groceries', icon: '🛒', description: 'Supermarkets & grocery stores' },
  { id: 'gas', name: 'Gas', icon: '⛽', description: 'Gas stations & fuel' },
  { id: 'streaming', name: 'Streaming', icon: '📺', description: 'Netflix, Spotify, Disney+, etc.' },
  { id: 'online_shopping', name: 'Online Shopping', icon: '🛍️', description: 'Amazon, general online retail' },
  { id: 'transit', name: 'Transit', icon: '🚇', description: 'Subway, bus, rideshare, Uber/Lyft' },
  { id: 'drugstore', name: 'Drugstore', icon: '💊', description: 'Pharmacies & drugstores' },
  { id: 'general', name: 'Everything Else', icon: '💳', description: 'All other purchases' }
];

// Helper to build categoryMap and earningRates array from a simpler input format
function buildCard(config) {
  const categoryMap = {};
  const earningRatesArr = [];

  for (const [catId, info] of Object.entries(config.rates)) {
    const label = info.unit === 'percent' ? `${info.rate}%` :
                  info.unit === 'points' ? `${info.rate}x pts` :
                  info.unit === 'miles' ? `${info.rate}x mi` : `${info.rate}x`;
    // Normalize to comparable value (cents per dollar)
    const normalized = info.unit === 'percent' ? info.rate :
                       info.rate * 1.5; // approx cpp for transferable points/miles
    categoryMap[catId] = { rate: normalized, label, portal: info.portal || false, note: info.note || '' };

    const catInfo = SPENDING_CATEGORIES.find(c => c.id === catId);
    earningRatesArr.push({ rate: info.rate, unit: info.unit === 'percent' ? '%' : info.unit === 'points' ? 'x pts' : 'x mi', category: catInfo ? catInfo.name : catId });
  }

  // Sort earning rates by normalized rate descending, remove duplicates of "general"
  earningRatesArr.sort((a, b) => {
    const aVal = categoryMap[Object.keys(config.rates).find(k => {
      const catInfo = SPENDING_CATEGORIES.find(c => c.id === k);
      return catInfo && catInfo.name === a.category;
    })]?.rate || 0;
    const bVal = categoryMap[Object.keys(config.rates).find(k => {
      const catInfo = SPENDING_CATEGORIES.find(c => c.id === k);
      return catInfo && catInfo.name === b.category;
    })]?.rate || 0;
    return bVal - aVal;
  });

  return {
    ...config,
    categoryMap,
    earningRates: earningRatesArr,
    rates: undefined // clean up
  };
}

const CARDS_DB = [
  buildCard({
    id: 'venture-x',
    name: 'Venture X',
    issuer: 'Capital One',
    network: 'Visa',
    annualFee: 395,
    renewalDate: '02-28',
    color: '#1a1a2e',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    accentColor: '#e94560',
    textColor: '#ffffff',
    defaultSelected: true,
    rates: {
      dining:           { rate: 2, unit: 'miles' },
      flights:          { rate: 5, unit: 'miles', portal: true, note: 'via Capital One Travel' },
      hotels:           { rate: 10, unit: 'miles', portal: true, note: 'via Capital One Travel' },
      groceries:        { rate: 2, unit: 'miles' },
      gas:              { rate: 2, unit: 'miles' },
      streaming:        { rate: 2, unit: 'miles' },
      online_shopping:  { rate: 2, unit: 'miles' },
      transit:          { rate: 2, unit: 'miles' },
      drugstore:        { rate: 2, unit: 'miles' },
      general:          { rate: 2, unit: 'miles' }
    },
    perks: [
      { id: 'vx-travel-credit', name: '$300 Annual Travel Credit', value: 300, frequency: 'annual', description: 'Capital One Travel portal bookings' },
      { id: 'vx-anniversary', name: '10,000 Anniversary Bonus Miles', value: 185, frequency: 'annual', description: '~$185 value via transfer partners' },
      { id: 'vx-lounge', name: 'Priority Pass + Capital One Lounges', value: 0, frequency: 'ongoing', description: 'Airport lounge access for you + 2 guests' },
      { id: 'vx-global-entry', name: 'Global Entry / TSA PreCheck Credit', value: 120, frequency: 'annual', description: 'Up to $120 every 4 years' },
      { id: 'vx-hertz', name: 'Hertz President\'s Circle Status', value: 0, frequency: 'ongoing', description: 'Top-tier rental car status' },
      { id: 'vx-premier', name: 'Premier Collection Hotel Benefits', value: 0, frequency: 'ongoing', description: 'Room upgrades, breakfast, credits at luxury hotels' },
      { id: 'vx-rental', name: 'Primary Car Rental Insurance', value: 0, frequency: 'ongoing', description: 'Covers damage and theft on rentals' },
      { id: 'vx-trip', name: 'Trip Cancellation Insurance', value: 0, frequency: 'ongoing', description: 'Up to $5,000 per trip' },
      { id: 'vx-ftf', name: 'No Foreign Transaction Fees', value: 0, frequency: 'ongoing', description: '0% foreign transaction fee' }
    ]
  }),

  buildCard({
    id: 'sapphire-preferred',
    name: 'Sapphire Preferred',
    issuer: 'Chase',
    network: 'Visa',
    annualFee: 95,
    renewalDate: '05-31',
    color: '#003087',
    gradient: 'linear-gradient(135deg, #003087 0%, #0052cc 50%, #1a6bff 100%)',
    accentColor: '#4da3ff',
    textColor: '#ffffff',
    defaultSelected: true,
    rates: {
      dining:           { rate: 3, unit: 'points' },
      flights:          { rate: 5, unit: 'points', portal: true, note: 'via Chase Travel' },
      hotels:           { rate: 5, unit: 'points', portal: true, note: 'via Chase Travel' },
      groceries:        { rate: 3, unit: 'points', note: 'Online grocery; excl. Target, Walmart' },
      gas:              { rate: 1, unit: 'points' },
      streaming:        { rate: 3, unit: 'points' },
      online_shopping:  { rate: 1, unit: 'points' },
      transit:          { rate: 2, unit: 'points', note: 'Other travel' },
      drugstore:        { rate: 1, unit: 'points' },
      general:          { rate: 1, unit: 'points' }
    },
    perks: [
      { id: 'csp-hotel', name: '$50 Annual Chase Travel Hotel Credit', value: 50, frequency: 'annual', description: 'Book hotels through Chase Travel portal' },
      { id: 'csp-25', name: '25% More Value via Chase Travel', value: 0, frequency: 'ongoing', description: 'Points worth 1.25¢ each when redeeming through portal' },
      { id: 'csp-transfer', name: 'Transfer Partners (1:1)', value: 0, frequency: 'ongoing', description: 'Transfer to airline & hotel partners at 1:1' },
      { id: 'csp-doordash', name: 'DoorDash DashPass', value: 0, frequency: 'ongoing', description: 'Complimentary DashPass subscription' },
      { id: 'csp-instacart', name: 'Instacart+ Membership', value: 0, frequency: 'annual', description: 'Free through 2027' },
      { id: 'csp-rental', name: 'Primary Car Rental Insurance', value: 0, frequency: 'ongoing', description: 'Covers damage and theft' },
      { id: 'csp-trip', name: 'Trip Cancellation Insurance', value: 0, frequency: 'ongoing', description: 'Up to $10,000 per trip' },
      { id: 'csp-purchase', name: 'Purchase Protection', value: 0, frequency: 'ongoing', description: 'Covers new purchases for 120 days' },
      { id: 'csp-warranty', name: 'Extended Warranty', value: 0, frequency: 'ongoing', description: 'Extends manufacturer warranty by 1 year' },
      { id: 'csp-ftf', name: 'No Foreign Transaction Fees', value: 0, frequency: 'ongoing', description: '0% foreign transaction fee' }
    ]
  }),

  buildCard({
    id: 'amex-platinum',
    name: 'Platinum Card',
    issuer: 'American Express',
    network: 'Amex',
    annualFee: 695,
    renewalDate: '03-31',
    color: '#8c8c8c',
    gradient: 'linear-gradient(135deg, #b0b0b0 0%, #8c8c8c 35%, #6b6b6b 65%, #505050 100%)',
    accentColor: '#c0c0c0',
    textColor: '#1a1a1a',
    defaultSelected: true,
    rates: {
      dining:           { rate: 1, unit: 'points' },
      flights:          { rate: 5, unit: 'points', note: 'Direct with airline or Amex Travel' },
      hotels:           { rate: 5, unit: 'points', portal: true, note: 'Prepaid via Amex Travel' },
      groceries:        { rate: 1, unit: 'points' },
      gas:              { rate: 1, unit: 'points' },
      streaming:        { rate: 1, unit: 'points' },
      online_shopping:  { rate: 1, unit: 'points' },
      transit:          { rate: 1, unit: 'points' },
      drugstore:        { rate: 1, unit: 'points' },
      general:          { rate: 1, unit: 'points' }
    },
    perks: [
      { id: 'ap-airline', name: '$200 Airline Fee Credit', value: 200, frequency: 'annual', description: 'Incidentals on one selected airline (calendar year)' },
      { id: 'ap-hotel', name: '$200 Hotel Credit (FHR/THC)', value: 200, frequency: 'annual', description: 'Fine Hotels + Resorts or The Hotel Collection bookings' },
      { id: 'ap-entertainment', name: '$240 Digital Entertainment Credit', value: 240, frequency: 'monthly', monthlyValue: 20, description: '$20/mo — Disney+, Hulu, ESPN+, Peacock, Audible, SiriusXM, NYT' },
      { id: 'ap-uber', name: '$200 Uber Credit', value: 200, frequency: 'monthly', monthlyValue: 15, description: '$15/mo + $20 December bonus for Uber & Uber Eats' },
      { id: 'ap-walmart', name: '$155 Walmart+ Credit', value: 155, frequency: 'annual', description: 'Covers Walmart+ membership' },
      { id: 'ap-equinox', name: '$300 Equinox Credit', value: 300, frequency: 'monthly', monthlyValue: 25, description: '$25/mo toward Equinox gym membership' },
      { id: 'ap-global-entry', name: 'Global Entry / TSA PreCheck Credit', value: 100, frequency: 'annual', description: 'Up to $100 every 4 years' },
      { id: 'ap-centurion', name: 'Centurion Lounge Access', value: 0, frequency: 'ongoing', description: 'Premium airport lounges' },
      { id: 'ap-priority', name: 'Priority Pass Select', value: 0, frequency: 'ongoing', description: '1,300+ airport lounges worldwide' },
      { id: 'ap-delta', name: 'Delta Sky Club (flying Delta)', value: 0, frequency: 'ongoing', description: 'Access when flying Delta' },
      { id: 'ap-fhr', name: 'Fine Hotels + Resorts Benefits', value: 0, frequency: 'ongoing', description: 'Room upgrade, breakfast, late checkout, experience credit' },
      { id: 'ap-hilton', name: 'Hilton Honors Gold Status', value: 0, frequency: 'ongoing', description: 'Gold elite status auto-enrolled' },
      { id: 'ap-marriott', name: 'Marriott Bonvoy Gold Elite', value: 0, frequency: 'ongoing', description: 'Gold elite status auto-enrolled' },
      { id: 'ap-cell', name: 'Cell Phone Protection', value: 0, frequency: 'ongoing', description: 'Up to $800 per claim, $50 deductible' },
      { id: 'ap-ftf', name: 'No Foreign Transaction Fees', value: 0, frequency: 'ongoing', description: '0% foreign transaction fee' }
    ]
  }),

  buildCard({
    id: 'freedom-unlimited',
    name: 'Freedom Unlimited',
    issuer: 'Chase',
    network: 'Visa',
    annualFee: 0,
    renewalDate: '09-01',
    color: '#003087',
    gradient: 'linear-gradient(135deg, #003087 0%, #004bb5 50%, #0066ff 100%)',
    accentColor: '#66a3ff',
    textColor: '#ffffff',
    defaultSelected: true,
    rates: {
      dining:           { rate: 3, unit: 'percent' },
      flights:          { rate: 5, unit: 'percent', portal: true, note: 'via Chase Travel' },
      hotels:           { rate: 5, unit: 'percent', portal: true, note: 'via Chase Travel' },
      groceries:        { rate: 1.5, unit: 'percent' },
      gas:              { rate: 1.5, unit: 'percent' },
      streaming:        { rate: 1.5, unit: 'percent' },
      online_shopping:  { rate: 1.5, unit: 'percent' },
      transit:          { rate: 1.5, unit: 'percent' },
      drugstore:        { rate: 3, unit: 'percent' },
      general:          { rate: 1.5, unit: 'percent' }
    },
    perks: [
      { id: 'cfu-trifecta', name: '25% Bonus with Sapphire Card', value: 0, frequency: 'ongoing', description: 'Points worth 1.25¢ via Chase trifecta transfer' },
      { id: 'cfu-doordash', name: 'DoorDash DashPass (1 year)', value: 0, frequency: 'annual', description: 'Activate by Dec 2027' },
      { id: 'cfu-purchase', name: 'Purchase Protection', value: 0, frequency: 'ongoing', description: 'Covers new purchases for 120 days' },
      { id: 'cfu-warranty', name: 'Extended Warranty', value: 0, frequency: 'ongoing', description: 'Extends manufacturer warranty by 1 year' }
    ]
  }),

  buildCard({
    id: 'freedom-flex',
    name: 'Freedom Flex',
    issuer: 'Chase',
    network: 'Mastercard',
    annualFee: 0,
    color: '#003087',
    gradient: 'linear-gradient(135deg, #002266 0%, #003087 50%, #0044aa 100%)',
    accentColor: '#5599ff',
    textColor: '#ffffff',
    defaultSelected: false,
    rates: {
      dining:           { rate: 3, unit: 'percent' },
      flights:          { rate: 5, unit: 'percent', portal: true, note: 'via Chase Travel' },
      hotels:           { rate: 5, unit: 'percent', portal: true, note: 'via Chase Travel' },
      groceries:        { rate: 1, unit: 'percent' },
      gas:              { rate: 1, unit: 'percent' },
      streaming:        { rate: 1, unit: 'percent' },
      online_shopping:  { rate: 1, unit: 'percent' },
      transit:          { rate: 1, unit: 'percent' },
      drugstore:        { rate: 3, unit: 'percent' },
      general:          { rate: 1, unit: 'percent' }
    },
    perks: [
      { id: 'cff-rotating', name: '5% Rotating Quarterly Categories', value: 0, frequency: 'quarterly', description: 'Activate each quarter for 5% back on rotating categories' },
      { id: 'cff-purchase', name: 'Purchase Protection', value: 0, frequency: 'ongoing', description: 'Covers new purchases for 120 days' }
    ]
  }),

  buildCard({
    id: 'amex-gold',
    name: 'Gold Card',
    issuer: 'American Express',
    network: 'Amex',
    annualFee: 250,
    color: '#b8860b',
    gradient: 'linear-gradient(135deg, #d4a017 0%, #b8860b 40%, #8b6914 100%)',
    accentColor: '#ffd700',
    textColor: '#1a1a1a',
    defaultSelected: false,
    rates: {
      dining:           { rate: 4, unit: 'points' },
      flights:          { rate: 3, unit: 'points', note: 'Booked directly with airline' },
      hotels:           { rate: 1, unit: 'points' },
      groceries:        { rate: 4, unit: 'points', note: 'US supermarkets, up to $25k/yr' },
      gas:              { rate: 1, unit: 'points' },
      streaming:        { rate: 1, unit: 'points' },
      online_shopping:  { rate: 1, unit: 'points' },
      transit:          { rate: 1, unit: 'points' },
      drugstore:        { rate: 1, unit: 'points' },
      general:          { rate: 1, unit: 'points' }
    },
    perks: [
      { id: 'ag-dining', name: '$120 Dining Credit', value: 120, frequency: 'monthly', monthlyValue: 10, description: '$10/mo at Grubhub, Cheesecake Factory, Goldbelly, etc.' },
      { id: 'ag-uber', name: '$120 Uber Cash', value: 120, frequency: 'monthly', monthlyValue: 10, description: '$10/month Uber Cash' },
      { id: 'ag-dunkin', name: '$84 Dunkin\' Credit', value: 84, frequency: 'monthly', monthlyValue: 7, description: '$7/month at Dunkin\' Donuts' }
    ]
  }),

  buildCard({
    id: 'citi-double-cash',
    name: 'Double Cash',
    issuer: 'Citi',
    network: 'Mastercard',
    annualFee: 0,
    color: '#003b70',
    gradient: 'linear-gradient(135deg, #003b70 0%, #005299 50%, #0070cc 100%)',
    accentColor: '#4da6ff',
    textColor: '#ffffff',
    defaultSelected: false,
    rates: {
      dining: { rate: 2, unit: 'percent' }, flights: { rate: 2, unit: 'percent' },
      hotels: { rate: 2, unit: 'percent' }, groceries: { rate: 2, unit: 'percent' },
      gas: { rate: 2, unit: 'percent' }, streaming: { rate: 2, unit: 'percent' },
      online_shopping: { rate: 2, unit: 'percent' }, transit: { rate: 2, unit: 'percent' },
      drugstore: { rate: 2, unit: 'percent' }, general: { rate: 2, unit: 'percent' }
    },
    perks: []
  }),

  buildCard({
    id: 'ink-business-preferred',
    name: 'Ink Business Preferred',
    issuer: 'Chase',
    network: 'Visa',
    annualFee: 95,
    color: '#1a1a1a',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%)',
    accentColor: '#003087',
    textColor: '#ffffff',
    defaultSelected: false,
    rates: {
      dining: { rate: 1, unit: 'points' }, flights: { rate: 3, unit: 'points' },
      hotels: { rate: 3, unit: 'points' }, groceries: { rate: 1, unit: 'points' },
      gas: { rate: 1, unit: 'points' }, streaming: { rate: 1, unit: 'points' },
      online_shopping: { rate: 3, unit: 'points', note: 'Internet, cable, phone, ads' },
      transit: { rate: 1, unit: 'points' }, drugstore: { rate: 1, unit: 'points' },
      general: { rate: 1, unit: 'points' }
    },
    perks: [
      { id: 'ibp-cell', name: 'Cell Phone Protection', value: 0, frequency: 'ongoing', description: 'Up to $1,000, $100 deductible' },
      { id: 'ibp-transfer', name: 'Transfer Partners (1:1)', value: 0, frequency: 'ongoing', description: 'Same pool as Sapphire/Freedom' }
    ]
  }),

  buildCard({
    id: 'blue-cash-preferred',
    name: 'Blue Cash Preferred',
    issuer: 'American Express',
    network: 'Amex',
    annualFee: 95,
    color: '#006fcf',
    gradient: 'linear-gradient(135deg, #004b8d 0%, #006fcf 50%, #0091ff 100%)',
    accentColor: '#66c2ff',
    textColor: '#ffffff',
    defaultSelected: false,
    rates: {
      dining: { rate: 1, unit: 'percent' }, flights: { rate: 1, unit: 'percent' },
      hotels: { rate: 1, unit: 'percent' },
      groceries: { rate: 6, unit: 'percent', note: 'US supermarkets, up to $6k/yr' },
      gas: { rate: 3, unit: 'percent', note: 'US gas stations' },
      streaming: { rate: 6, unit: 'percent', note: 'Select US streaming' },
      online_shopping: { rate: 1, unit: 'percent' },
      transit: { rate: 3, unit: 'percent' },
      drugstore: { rate: 1, unit: 'percent' }, general: { rate: 1, unit: 'percent' }
    },
    perks: []
  }),

  buildCard({
    id: 'savor-one',
    name: 'SavorOne',
    issuer: 'Capital One',
    network: 'Visa',
    annualFee: 0,
    color: '#1a1a2e',
    gradient: 'linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 50%, #0f0f1a 100%)',
    accentColor: '#e94560',
    textColor: '#ffffff',
    defaultSelected: false,
    rates: {
      dining: { rate: 3, unit: 'percent' }, flights: { rate: 1, unit: 'percent' },
      hotels: { rate: 5, unit: 'percent', portal: true, note: 'via Capital One Travel' },
      groceries: { rate: 3, unit: 'percent' }, gas: { rate: 1, unit: 'percent' },
      streaming: { rate: 3, unit: 'percent' }, online_shopping: { rate: 1, unit: 'percent' },
      transit: { rate: 1, unit: 'percent' }, drugstore: { rate: 1, unit: 'percent' },
      general: { rate: 1, unit: 'percent' }
    },
    perks: []
  }),

  buildCard({
    id: 'citi-strata-premier',
    name: 'Strata Premier',
    issuer: 'Citi',
    network: 'Mastercard',
    annualFee: 95,
    color: '#003b70',
    gradient: 'linear-gradient(135deg, #002244 0%, #003b70 50%, #004f99 100%)',
    accentColor: '#66b3ff',
    textColor: '#ffffff',
    defaultSelected: false,
    rates: {
      dining: { rate: 3, unit: 'points' }, flights: { rate: 3, unit: 'points' },
      hotels: { rate: 3, unit: 'points' }, groceries: { rate: 3, unit: 'points' },
      gas: { rate: 3, unit: 'points' }, streaming: { rate: 1, unit: 'points' },
      online_shopping: { rate: 1, unit: 'points' }, transit: { rate: 1, unit: 'points' },
      drugstore: { rate: 1, unit: 'points' }, general: { rate: 1, unit: 'points' }
    },
    perks: [
      { id: 'csp2-hotel', name: '$100 Annual Hotel Credit', value: 100, frequency: 'annual', description: 'Book via thankyou.com' }
    ]
  }),

  buildCard({
    id: 'altitude-reserve',
    name: 'Altitude Reserve',
    issuer: 'U.S. Bank',
    network: 'Visa',
    annualFee: 400,
    color: '#7b2d8e',
    gradient: 'linear-gradient(135deg, #5c1a6e 0%, #7b2d8e 50%, #9b45b0 100%)',
    accentColor: '#c77ddb',
    textColor: '#ffffff',
    defaultSelected: false,
    rates: {
      dining: { rate: 3, unit: 'points', note: 'Mobile wallet only' },
      flights: { rate: 3, unit: 'points' }, hotels: { rate: 3, unit: 'points' },
      groceries: { rate: 3, unit: 'points', note: 'Mobile wallet only' },
      gas: { rate: 3, unit: 'points', note: 'Mobile wallet only' },
      streaming: { rate: 3, unit: 'points', note: 'Mobile wallet only' },
      online_shopping: { rate: 1, unit: 'points' }, transit: { rate: 3, unit: 'points' },
      drugstore: { rate: 3, unit: 'points', note: 'Mobile wallet only' },
      general: { rate: 1, unit: 'points' }
    },
    perks: [
      { id: 'ar-travel', name: '$325 Annual Travel Credit', value: 325, frequency: 'annual', description: 'Automatic statement credit for travel purchases' },
      { id: 'ar-lounge', name: 'Priority Pass Lounge Access', value: 0, frequency: 'ongoing', description: '1,300+ airport lounges' },
      { id: 'ar-ge', name: 'Global Entry / TSA PreCheck Credit', value: 100, frequency: 'annual', description: 'Up to $100 every 4 years' }
    ]
  }),

  buildCard({
    id: 'active-cash',
    name: 'Active Cash',
    issuer: 'Wells Fargo',
    network: 'Visa',
    annualFee: 0,
    color: '#cd1409',
    gradient: 'linear-gradient(135deg, #8b0000 0%, #cd1409 50%, #e63e36 100%)',
    accentColor: '#ff6b63',
    textColor: '#ffffff',
    defaultSelected: false,
    rates: {
      dining: { rate: 2, unit: 'percent' }, flights: { rate: 2, unit: 'percent' },
      hotels: { rate: 2, unit: 'percent' }, groceries: { rate: 2, unit: 'percent' },
      gas: { rate: 2, unit: 'percent' }, streaming: { rate: 2, unit: 'percent' },
      online_shopping: { rate: 2, unit: 'percent' }, transit: { rate: 2, unit: 'percent' },
      drugstore: { rate: 2, unit: 'percent' }, general: { rate: 2, unit: 'percent' }
    },
    perks: [
      { id: 'wac-cell', name: 'Cell Phone Protection', value: 0, frequency: 'ongoing', description: 'Up to $600, $25 deductible' }
    ]
  }),

  buildCard({
    id: 'discover-it',
    name: 'it Cash Back',
    issuer: 'Discover',
    network: 'Discover',
    annualFee: 0,
    color: '#ff6000',
    gradient: 'linear-gradient(135deg, #cc4d00 0%, #ff6000 50%, #ff8533 100%)',
    accentColor: '#ffb380',
    textColor: '#ffffff',
    defaultSelected: false,
    rates: {
      dining: { rate: 1, unit: 'percent' }, flights: { rate: 1, unit: 'percent' },
      hotels: { rate: 1, unit: 'percent' }, groceries: { rate: 1, unit: 'percent' },
      gas: { rate: 1, unit: 'percent' }, streaming: { rate: 1, unit: 'percent' },
      online_shopping: { rate: 1, unit: 'percent' }, transit: { rate: 1, unit: 'percent' },
      drugstore: { rate: 1, unit: 'percent' }, general: { rate: 1, unit: 'percent' }
    },
    perks: [
      { id: 'di-match', name: 'First-Year Cash Back Match', value: 0, frequency: 'one-time', description: 'Discover matches all cash back earned in year one' },
      { id: 'di-rotating', name: '5% Rotating Quarterly Categories', value: 0, frequency: 'quarterly', description: 'Activate each quarter for 5% on rotating categories' }
    ]
  })
];

const DEFAULT_WALLET = CARDS_DB.filter(c => c.defaultSelected).map(c => c.id);
