// CardWise — Credit Card Database
// All earning rates normalized to a comparable "cents per dollar" value

const CATEGORIES = {
  dining: { name: 'Dining', icon: '🍽️', description: 'Restaurants, delivery, takeout' },
  travel_flights: { name: 'Flights', icon: '✈️', description: 'Airline tickets' },
  travel_hotels: { name: 'Hotels', icon: '🏨', description: 'Hotel bookings' },
  groceries: { name: 'Groceries', icon: '🛒', description: 'Supermarkets & grocery stores' },
  gas: { name: 'Gas', icon: '⛽', description: 'Gas stations' },
  streaming: { name: 'Streaming', icon: '📺', description: 'Netflix, Spotify, etc.' },
  online_shopping: { name: 'Online Shopping', icon: '🛍️', description: 'Amazon, general online' },
  transit: { name: 'Transit', icon: '🚇', description: 'Subway, bus, rideshare' },
  drugstore: { name: 'Drugstore', icon: '💊', description: 'Pharmacies & drugstores' },
  general: { name: 'Everything Else', icon: '💳', description: 'All other purchases' }
};

const CARDS = [
  {
    id: 'venture-x',
    name: 'Venture X',
    issuer: 'Capital One',
    network: 'Visa',
    annualFee: 395,
    color: '#1a1a2e',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    accentColor: '#e94560',
    defaultSelected: true,
    earningRates: {
      dining: { rate: 2, unit: 'miles', portal: false },
      travel_flights: { rate: 5, unit: 'miles', portal: true, portalNote: 'via Capital One Travel' },
      travel_hotels: { rate: 10, unit: 'miles', portal: true, portalNote: 'via Capital One Travel' },
      groceries: { rate: 2, unit: 'miles', portal: false },
      gas: { rate: 2, unit: 'miles', portal: false },
      streaming: { rate: 2, unit: 'miles', portal: false },
      online_shopping: { rate: 2, unit: 'miles', portal: false },
      transit: { rate: 2, unit: 'miles', portal: false },
      drugstore: { rate: 2, unit: 'miles', portal: false },
      general: { rate: 2, unit: 'miles', portal: false }
    },
    perks: [
      { id: 'vx-travel-credit', name: '$300 Annual Travel Credit', value: 300, frequency: 'annual', trackable: true, description: 'Capital One Travel bookings' },
      { id: 'vx-anniversary', name: '10,000 Anniversary Miles', value: 185, frequency: 'annual', trackable: true, description: '~$185 value via transfer partners' },
      { id: 'vx-lounge', name: 'Priority Pass + Capital One Lounges', value: 0, frequency: 'ongoing', trackable: false, description: 'Airport lounge access' },
      { id: 'vx-global-entry', name: 'Global Entry / TSA PreCheck Credit', value: 120, frequency: 'quadrennial', trackable: true, description: 'Up to $120 every 4 years' },
      { id: 'vx-hertz', name: 'Hertz Rental Car Status', value: 0, frequency: 'ongoing', trackable: false, description: 'President\'s Circle status' },
      { id: 'vx-premier-collection', name: 'Premier Collection Hotels', value: 0, frequency: 'ongoing', trackable: false, description: 'Room upgrades, breakfast, credits' },
      { id: 'vx-rental-insurance', name: 'Primary Car Rental Insurance', value: 0, frequency: 'ongoing', trackable: false, description: 'Covers damage/theft' },
      { id: 'vx-trip-insurance', name: 'Trip Cancellation Insurance', value: 0, frequency: 'ongoing', trackable: false, description: 'Up to $5,000 per trip' },
      { id: 'vx-no-ftf', name: 'No Foreign Transaction Fees', value: 0, frequency: 'ongoing', trackable: false }
    ]
  },
  {
    id: 'sapphire-preferred',
    name: 'Sapphire Preferred',
    issuer: 'Chase',
    network: 'Visa',
    annualFee: 95,
    color: '#003087',
    gradient: 'linear-gradient(135deg, #003087 0%, #0052cc 50%, #1a6bff 100%)',
    accentColor: '#4da3ff',
    defaultSelected: true,
    earningRates: {
      dining: { rate: 3, unit: 'points', portal: false },
      travel_flights: { rate: 5, unit: 'points', portal: true, portalNote: 'via Chase Travel' },
      travel_hotels: { rate: 5, unit: 'points', portal: true, portalNote: 'via Chase Travel' },
      groceries: { rate: 3, unit: 'points', portal: false, note: 'Online grocery; excl. Target, Walmart' },
      gas: { rate: 1, unit: 'points', portal: false },
      streaming: { rate: 3, unit: 'points', portal: false },
      online_shopping: { rate: 1, unit: 'points', portal: false },
      transit: { rate: 2, unit: 'points', portal: false, note: 'Other travel' },
      drugstore: { rate: 1, unit: 'points', portal: false },
      general: { rate: 1, unit: 'points', portal: false }
    },
    perks: [
      { id: 'csp-hotel-credit', name: '$50 Annual Chase Travel Hotel Credit', value: 50, frequency: 'annual', trackable: true },
      { id: 'csp-25-bonus', name: '25% More Value via Chase Travel', value: 0, frequency: 'ongoing', trackable: false, description: 'Points worth 1.25¢ each' },
      { id: 'csp-transfer', name: 'Transfer Partners (1:1)', value: 0, frequency: 'ongoing', trackable: false, description: 'Airlines & hotels' },
      { id: 'csp-doordash', name: 'DoorDash DashPass', value: 0, frequency: 'ongoing', trackable: false, description: 'Complimentary subscription' },
      { id: 'csp-instacart', name: 'Instacart+ Membership', value: 0, frequency: 'annual', trackable: false, description: 'Through 2027' },
      { id: 'csp-rental-insurance', name: 'Primary Car Rental Insurance', value: 0, frequency: 'ongoing', trackable: false },
      { id: 'csp-trip-insurance', name: 'Trip Cancellation Insurance', value: 0, frequency: 'ongoing', trackable: false },
      { id: 'csp-purchase', name: 'Purchase Protection', value: 0, frequency: 'ongoing', trackable: false },
      { id: 'csp-warranty', name: 'Extended Warranty', value: 0, frequency: 'ongoing', trackable: false },
      { id: 'csp-no-ftf', name: 'No Foreign Transaction Fees', value: 0, frequency: 'ongoing', trackable: false }
    ]
  },
  {
    id: 'amex-platinum',
    name: 'Platinum Card',
    issuer: 'American Express',
    network: 'Amex',
    annualFee: 695,
    color: '#8c8c8c',
    gradient: 'linear-gradient(135deg, #a8a8a8 0%, #8c8c8c 30%, #6b6b6b 70%, #505050 100%)',
    accentColor: '#c0c0c0',
    defaultSelected: true,
    earningRates: {
      dining: { rate: 1, unit: 'points', portal: false },
      travel_flights: { rate: 5, unit: 'points', portal: false, note: 'Direct with airline or Amex Travel' },
      travel_hotels: { rate: 5, unit: 'points', portal: true, portalNote: 'Prepaid via Amex Travel' },
      groceries: { rate: 1, unit: 'points', portal: false },
      gas: { rate: 1, unit: 'points', portal: false },
      streaming: { rate: 1, unit: 'points', portal: false },
      online_shopping: { rate: 1, unit: 'points', portal: false },
      transit: { rate: 1, unit: 'points', portal: false },
      drugstore: { rate: 1, unit: 'points', portal: false },
      general: { rate: 1, unit: 'points', portal: false }
    },
    perks: [
      { id: 'ap-airline', name: '$200 Airline Fee Credit', value: 200, frequency: 'annual', trackable: true, description: 'Incidentals on one selected airline' },
      { id: 'ap-hotel', name: '$200 Hotel Credit (FHR/THC)', value: 200, frequency: 'annual', trackable: true, description: 'Fine Hotels + Resorts / Hotel Collection' },
      { id: 'ap-entertainment', name: '$240 Digital Entertainment Credit', value: 240, frequency: 'monthly', monthlyValue: 20, trackable: true, description: 'Disney+, Hulu, ESPN+, Peacock, Audible, SiriusXM, NYT' },
      { id: 'ap-uber', name: '$200 Uber Credit', value: 200, frequency: 'monthly', monthlyValue: 15, trackable: true, description: '$15/mo + $20 December bonus' },
      { id: 'ap-walmart', name: '$155 Walmart+ Credit', value: 155, frequency: 'annual', trackable: true, description: 'Walmart+ membership' },
      { id: 'ap-equinox', name: '$300 Equinox Credit', value: 300, frequency: 'monthly', monthlyValue: 25, trackable: true, description: '$25/month for Equinox membership' },
      { id: 'ap-global-entry', name: 'Global Entry / TSA PreCheck Credit', value: 100, frequency: 'quadrennial', trackable: true, description: 'Up to $100 every 4 years' },
      { id: 'ap-centurion', name: 'Centurion Lounge Access', value: 0, frequency: 'ongoing', trackable: false },
      { id: 'ap-priority-pass', name: 'Priority Pass Select', value: 0, frequency: 'ongoing', trackable: false },
      { id: 'ap-delta-skyclub', name: 'Delta Sky Club (when flying Delta)', value: 0, frequency: 'ongoing', trackable: false },
      { id: 'ap-fhr', name: 'Fine Hotels + Resorts Benefits', value: 0, frequency: 'ongoing', trackable: false, description: 'Room upgrade, breakfast, late checkout, credits' },
      { id: 'ap-hilton', name: 'Hilton Honors Gold Status', value: 0, frequency: 'ongoing', trackable: false },
      { id: 'ap-marriott', name: 'Marriott Bonvoy Gold Elite', value: 0, frequency: 'ongoing', trackable: false },
      { id: 'ap-cell', name: 'Cell Phone Protection', value: 0, frequency: 'ongoing', trackable: false, description: 'Up to $800, $50 deductible' },
      { id: 'ap-no-ftf', name: 'No Foreign Transaction Fees', value: 0, frequency: 'ongoing', trackable: false }
    ]
  },
  {
    id: 'freedom-unlimited',
    name: 'Freedom Unlimited',
    issuer: 'Chase',
    network: 'Visa',
    annualFee: 0,
    color: '#003087',
    gradient: 'linear-gradient(135deg, #003087 0%, #004bb5 50%, #0066ff 100%)',
    accentColor: '#66a3ff',
    defaultSelected: true,
    earningRates: {
      dining: { rate: 3, unit: 'percent', portal: false },
      travel_flights: { rate: 5, unit: 'percent', portal: true, portalNote: 'via Chase Travel' },
      travel_hotels: { rate: 5, unit: 'percent', portal: true, portalNote: 'via Chase Travel' },
      groceries: { rate: 1.5, unit: 'percent', portal: false },
      gas: { rate: 1.5, unit: 'percent', portal: false },
      streaming: { rate: 1.5, unit: 'percent', portal: false },
      online_shopping: { rate: 1.5, unit: 'percent', portal: false },
      transit: { rate: 1.5, unit: 'percent', portal: false },
      drugstore: { rate: 3, unit: 'percent', portal: false },
      general: { rate: 1.5, unit: 'percent', portal: false }
    },
    perks: [
      { id: 'cfu-intro-apr', name: '0% Intro APR (15 months)', value: 0, frequency: 'one-time', trackable: false, description: 'On purchases and balance transfers' },
      { id: 'cfu-trifecta', name: '25% Bonus with Sapphire', value: 0, frequency: 'ongoing', trackable: false, description: 'Points worth more via Chase trifecta' },
      { id: 'cfu-doordash', name: 'DoorDash DashPass (1 year)', value: 0, frequency: 'annual', trackable: false, description: 'Activate by Dec 2027' },
      { id: 'cfu-purchase', name: 'Purchase Protection', value: 0, frequency: 'ongoing', trackable: false },
      { id: 'cfu-warranty', name: 'Extended Warranty', value: 0, frequency: 'ongoing', trackable: false }
    ]
  },
  {
    id: 'freedom-flex',
    name: 'Freedom Flex',
    issuer: 'Chase',
    network: 'Mastercard',
    annualFee: 0,
    color: '#003087',
    gradient: 'linear-gradient(135deg, #002266 0%, #003087 50%, #0044aa 100%)',
    accentColor: '#5599ff',
    defaultSelected: false,
    earningRates: {
      dining: { rate: 3, unit: 'percent', portal: false },
      travel_flights: { rate: 5, unit: 'percent', portal: true, portalNote: 'via Chase Travel' },
      travel_hotels: { rate: 5, unit: 'percent', portal: true, portalNote: 'via Chase Travel' },
      groceries: { rate: 1, unit: 'percent', portal: false },
      gas: { rate: 1, unit: 'percent', portal: false },
      streaming: { rate: 1, unit: 'percent', portal: false },
      online_shopping: { rate: 1, unit: 'percent', portal: false },
      transit: { rate: 1, unit: 'percent', portal: false },
      drugstore: { rate: 3, unit: 'percent', portal: false },
      general: { rate: 1, unit: 'percent', portal: false }
    },
    rotatingCategories: true,
    rotatingNote: '5% on rotating quarterly categories (activate each quarter)',
    perks: [
      { id: 'cff-rotating', name: '5% Rotating Categories', value: 0, frequency: 'quarterly', trackable: true, description: 'Activate each quarter for 5% back' },
      { id: 'cff-purchase', name: 'Purchase Protection', value: 0, frequency: 'ongoing', trackable: false },
      { id: 'cff-warranty', name: 'Extended Warranty', value: 0, frequency: 'ongoing', trackable: false }
    ]
  },
  {
    id: 'amex-gold',
    name: 'Gold Card',
    issuer: 'American Express',
    network: 'Amex',
    annualFee: 250,
    color: '#b8860b',
    gradient: 'linear-gradient(135deg, #d4a017 0%, #b8860b 40%, #8b6914 100%)',
    accentColor: '#ffd700',
    defaultSelected: false,
    earningRates: {
      dining: { rate: 4, unit: 'points', portal: false },
      travel_flights: { rate: 3, unit: 'points', portal: false, note: 'Booked directly with airline' },
      travel_hotels: { rate: 1, unit: 'points', portal: false },
      groceries: { rate: 4, unit: 'points', portal: false, note: 'US supermarkets, up to $25k/yr' },
      gas: { rate: 1, unit: 'points', portal: false },
      streaming: { rate: 1, unit: 'points', portal: false },
      online_shopping: { rate: 1, unit: 'points', portal: false },
      transit: { rate: 1, unit: 'points', portal: false },
      drugstore: { rate: 1, unit: 'points', portal: false },
      general: { rate: 1, unit: 'points', portal: false }
    },
    perks: [
      { id: 'ag-dining', name: '$120 Dining Credit', value: 120, frequency: 'monthly', monthlyValue: 10, trackable: true, description: '$10/mo at Grubhub, Cheesecake Factory, Goldbelly, etc.' },
      { id: 'ag-uber', name: '$120 Uber Cash', value: 120, frequency: 'monthly', monthlyValue: 10, trackable: true, description: '$10/month Uber Cash' },
      { id: 'ag-dunkin', name: '$84 Dunkin\' Credit', value: 84, frequency: 'monthly', monthlyValue: 7, trackable: true, description: '$7/month at Dunkin\'' }
    ]
  },
  {
    id: 'citi-double-cash',
    name: 'Double Cash',
    issuer: 'Citi',
    network: 'Mastercard',
    annualFee: 0,
    color: '#003b70',
    gradient: 'linear-gradient(135deg, #003b70 0%, #005299 50%, #0070cc 100%)',
    accentColor: '#4da6ff',
    defaultSelected: false,
    earningRates: {
      dining: { rate: 2, unit: 'percent', portal: false },
      travel_flights: { rate: 2, unit: 'percent', portal: false },
      travel_hotels: { rate: 2, unit: 'percent', portal: false },
      groceries: { rate: 2, unit: 'percent', portal: false },
      gas: { rate: 2, unit: 'percent', portal: false },
      streaming: { rate: 2, unit: 'percent', portal: false },
      online_shopping: { rate: 2, unit: 'percent', portal: false },
      transit: { rate: 2, unit: 'percent', portal: false },
      drugstore: { rate: 2, unit: 'percent', portal: false },
      general: { rate: 2, unit: 'percent', portal: false }
    },
    perks: []
  },
  {
    id: 'ink-business-preferred',
    name: 'Ink Business Preferred',
    issuer: 'Chase',
    network: 'Visa',
    annualFee: 95,
    color: '#1a1a1a',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #333333 50%, #1a1a1a 100%)',
    accentColor: '#003087',
    defaultSelected: false,
    earningRates: {
      dining: { rate: 1, unit: 'points', portal: false },
      travel_flights: { rate: 3, unit: 'points', portal: false },
      travel_hotels: { rate: 3, unit: 'points', portal: false },
      groceries: { rate: 1, unit: 'points', portal: false },
      gas: { rate: 1, unit: 'points', portal: false },
      streaming: { rate: 1, unit: 'points', portal: false },
      online_shopping: { rate: 3, unit: 'points', portal: false, note: 'Internet, cable, phone' },
      transit: { rate: 1, unit: 'points', portal: false },
      drugstore: { rate: 1, unit: 'points', portal: false },
      general: { rate: 1, unit: 'points', portal: false }
    },
    perks: [
      { id: 'ibp-25-bonus', name: '25% More Value via Chase Travel', value: 0, frequency: 'ongoing', trackable: false },
      { id: 'ibp-transfer', name: 'Transfer Partners (1:1)', value: 0, frequency: 'ongoing', trackable: false },
      { id: 'ibp-cell', name: 'Cell Phone Protection', value: 0, frequency: 'ongoing', trackable: false, description: 'Up to $1,000, $100 deductible' },
      { id: 'ibp-purchase', name: 'Purchase Protection', value: 0, frequency: 'ongoing', trackable: false }
    ]
  },
  {
    id: 'blue-cash-preferred',
    name: 'Blue Cash Preferred',
    issuer: 'American Express',
    network: 'Amex',
    annualFee: 95,
    color: '#006fcf',
    gradient: 'linear-gradient(135deg, #004b8d 0%, #006fcf 50%, #0091ff 100%)',
    accentColor: '#66c2ff',
    defaultSelected: false,
    earningRates: {
      dining: { rate: 1, unit: 'percent', portal: false },
      travel_flights: { rate: 1, unit: 'percent', portal: false },
      travel_hotels: { rate: 1, unit: 'percent', portal: false },
      groceries: { rate: 6, unit: 'percent', portal: false, note: 'US supermarkets, up to $6k/yr' },
      gas: { rate: 3, unit: 'percent', portal: false, note: 'US gas stations' },
      streaming: { rate: 6, unit: 'percent', portal: false, note: 'Select US streaming' },
      online_shopping: { rate: 1, unit: 'percent', portal: false },
      transit: { rate: 3, unit: 'percent', portal: false },
      drugstore: { rate: 1, unit: 'percent', portal: false },
      general: { rate: 1, unit: 'percent', portal: false }
    },
    perks: []
  },
  {
    id: 'savor-one',
    name: 'SavorOne',
    issuer: 'Capital One',
    network: 'Visa',
    annualFee: 0,
    color: '#1a1a2e',
    gradient: 'linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 50%, #0f0f1a 100%)',
    accentColor: '#e94560',
    defaultSelected: false,
    earningRates: {
      dining: { rate: 3, unit: 'percent', portal: false },
      travel_flights: { rate: 1, unit: 'percent', portal: false },
      travel_hotels: { rate: 5, unit: 'percent', portal: true, portalNote: 'via Capital One Travel' },
      groceries: { rate: 3, unit: 'percent', portal: false },
      gas: { rate: 1, unit: 'percent', portal: false },
      streaming: { rate: 3, unit: 'percent', portal: false },
      online_shopping: { rate: 1, unit: 'percent', portal: false },
      transit: { rate: 1, unit: 'percent', portal: false },
      drugstore: { rate: 1, unit: 'percent', portal: false },
      general: { rate: 1, unit: 'percent', portal: false }
    },
    perks: []
  },
  {
    id: 'citi-strata-premier',
    name: 'Strata Premier',
    issuer: 'Citi',
    network: 'Mastercard',
    annualFee: 95,
    color: '#003b70',
    gradient: 'linear-gradient(135deg, #002244 0%, #003b70 50%, #004f99 100%)',
    accentColor: '#66b3ff',
    defaultSelected: false,
    earningRates: {
      dining: { rate: 3, unit: 'points', portal: false },
      travel_flights: { rate: 3, unit: 'points', portal: false },
      travel_hotels: { rate: 3, unit: 'points', portal: false },
      groceries: { rate: 3, unit: 'points', portal: false },
      gas: { rate: 3, unit: 'points', portal: false },
      streaming: { rate: 1, unit: 'points', portal: false },
      online_shopping: { rate: 1, unit: 'points', portal: false },
      transit: { rate: 1, unit: 'points', portal: false },
      drugstore: { rate: 1, unit: 'points', portal: false },
      general: { rate: 1, unit: 'points', portal: false }
    },
    perks: [
      { id: 'csp2-hotel', name: '$100 Annual Hotel Credit', value: 100, frequency: 'annual', trackable: true, description: 'Via thankyou.com' }
    ]
  },
  {
    id: 'altitude-reserve',
    name: 'Altitude Reserve',
    issuer: 'U.S. Bank',
    network: 'Visa',
    annualFee: 400,
    color: '#7b2d8e',
    gradient: 'linear-gradient(135deg, #5c1a6e 0%, #7b2d8e 50%, #9b45b0 100%)',
    accentColor: '#c77ddb',
    defaultSelected: false,
    earningRates: {
      dining: { rate: 3, unit: 'points', portal: false, note: 'Mobile wallet only' },
      travel_flights: { rate: 3, unit: 'points', portal: false },
      travel_hotels: { rate: 3, unit: 'points', portal: false },
      groceries: { rate: 3, unit: 'points', portal: false, note: 'Mobile wallet only' },
      gas: { rate: 3, unit: 'points', portal: false, note: 'Mobile wallet only' },
      streaming: { rate: 3, unit: 'points', portal: false, note: 'Mobile wallet only' },
      online_shopping: { rate: 1, unit: 'points', portal: false },
      transit: { rate: 3, unit: 'points', portal: false },
      drugstore: { rate: 3, unit: 'points', portal: false, note: 'Mobile wallet only' },
      general: { rate: 1, unit: 'points', portal: false }
    },
    perks: [
      { id: 'ar-travel-credit', name: '$325 Annual Travel Credit', value: 325, frequency: 'annual', trackable: true },
      { id: 'ar-priority-pass', name: 'Priority Pass Lounge Access', value: 0, frequency: 'ongoing', trackable: false },
      { id: 'ar-global-entry', name: 'Global Entry / TSA PreCheck Credit', value: 100, frequency: 'quadrennial', trackable: true }
    ]
  },
  {
    id: 'active-cash',
    name: 'Active Cash',
    issuer: 'Wells Fargo',
    network: 'Visa',
    annualFee: 0,
    color: '#cd1409',
    gradient: 'linear-gradient(135deg, #8b0000 0%, #cd1409 50%, #e63e36 100%)',
    accentColor: '#ff6b63',
    defaultSelected: false,
    earningRates: {
      dining: { rate: 2, unit: 'percent', portal: false },
      travel_flights: { rate: 2, unit: 'percent', portal: false },
      travel_hotels: { rate: 2, unit: 'percent', portal: false },
      groceries: { rate: 2, unit: 'percent', portal: false },
      gas: { rate: 2, unit: 'percent', portal: false },
      streaming: { rate: 2, unit: 'percent', portal: false },
      online_shopping: { rate: 2, unit: 'percent', portal: false },
      transit: { rate: 2, unit: 'percent', portal: false },
      drugstore: { rate: 2, unit: 'percent', portal: false },
      general: { rate: 2, unit: 'percent', portal: false }
    },
    perks: [
      { id: 'wac-cell', name: 'Cell Phone Protection', value: 0, frequency: 'ongoing', trackable: false, description: 'Up to $600, $25 deductible' }
    ]
  },
  {
    id: 'discover-it',
    name: 'it Cash Back',
    issuer: 'Discover',
    network: 'Discover',
    annualFee: 0,
    color: '#ff6000',
    gradient: 'linear-gradient(135deg, #cc4d00 0%, #ff6000 50%, #ff8533 100%)',
    accentColor: '#ffb380',
    defaultSelected: false,
    rotatingCategories: true,
    rotatingNote: '5% on rotating quarterly categories (activate each quarter)',
    earningRates: {
      dining: { rate: 1, unit: 'percent', portal: false },
      travel_flights: { rate: 1, unit: 'percent', portal: false },
      travel_hotels: { rate: 1, unit: 'percent', portal: false },
      groceries: { rate: 1, unit: 'percent', portal: false },
      gas: { rate: 1, unit: 'percent', portal: false },
      streaming: { rate: 1, unit: 'percent', portal: false },
      online_shopping: { rate: 1, unit: 'percent', portal: false },
      transit: { rate: 1, unit: 'percent', portal: false },
      drugstore: { rate: 1, unit: 'percent', portal: false },
      general: { rate: 1, unit: 'percent', portal: false }
    },
    perks: [
      { id: 'di-match', name: 'First-Year Cash Back Match', value: 0, frequency: 'one-time', trackable: false, description: 'Discover matches all cash back earned in year one' },
      { id: 'di-rotating', name: '5% Rotating Categories', value: 0, frequency: 'quarterly', trackable: true, description: 'Activate each quarter' }
    ]
  }
];

// Helper: normalize rate to cents-per-dollar for comparison
function normalizeRate(rateObj) {
  if (!rateObj) return 0;
  switch (rateObj.unit) {
    case 'percent': return rateObj.rate;
    case 'points': return rateObj.rate * 1.5; // approximate cpp for transferable points
    case 'miles': return rateObj.rate * 1.5;  // approximate cpp for Cap One miles
    default: return rateObj.rate;
  }
}

// Format rate display string
function formatRate(rateObj) {
  if (!rateObj) return '—';
  if (rateObj.unit === 'percent') return `${rateObj.rate}%`;
  if (rateObj.unit === 'points') return `${rateObj.rate}x pts`;
  if (rateObj.unit === 'miles') return `${rateObj.rate}x mi`;
  return `${rateObj.rate}x`;
}
