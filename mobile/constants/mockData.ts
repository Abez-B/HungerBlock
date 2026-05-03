export interface Donation {
  id: string;
  foodType: string;
  quantity: number;
  unit: string;
  location: string;
  expiryDate: string;
  status: 'Active' | 'Matched' | 'Verified' | 'Cancelled';
  freshnessScore: number;
  donor: string;
  donorAddress: string;
  createdAt: string;
  notes?: string;
  imageEmoji: string;
}

export interface FoodRequest {
  id: string;
  foodType: string;
  quantityNeeded: number;
  unit: string;
  location: string;
  status: 'Open' | 'Matched' | 'Fulfilled' | 'Cancelled';
  urgencyLevel: 1 | 2 | 3 | 4 | 5;
  ngoName: string;
  ngoAddress: string;
  createdAt: string;
  notes?: string;
}

export const DONATIONS: Donation[] = [
  {
    id: '1',
    foodType: 'Rice & Dal',
    quantity: 200,
    unit: 'servings',
    location: 'Andheri, Mumbai',
    expiryDate: '2026-05-05',
    status: 'Active',
    freshnessScore: 92,
    donor: 'The Grand Hotel',
    donorAddress: '0x1234...abcd',
    createdAt: '2026-05-02T08:00:00Z',
    notes: 'Freshly cooked, packed in containers.',
    imageEmoji: '🍚',
  },
  {
    id: '2',
    foodType: 'Pasta & Salad',
    quantity: 80,
    unit: 'portions',
    location: 'Bandra, Mumbai',
    expiryDate: '2026-05-03',
    status: 'Matched',
    freshnessScore: 85,
    donor: 'Cafe Milano',
    donorAddress: '0x5678...efgh',
    createdAt: '2026-05-02T09:30:00Z',
    imageEmoji: '🍝',
  },
  {
    id: '3',
    foodType: 'Fresh Vegetables',
    quantity: 50,
    unit: 'kg',
    location: 'Dadar, Mumbai',
    expiryDate: '2026-05-04',
    status: 'Active',
    freshnessScore: 95,
    donor: 'FreshMart Supermarket',
    donorAddress: '0x9abc...ijkl',
    createdAt: '2026-05-01T14:00:00Z',
    notes: 'Mixed vegetables: tomatoes, onions, spinach.',
    imageEmoji: '🥦',
  },
  {
    id: '4',
    foodType: 'Bread & Pastries',
    quantity: 150,
    unit: 'pieces',
    location: 'Juhu, Mumbai',
    expiryDate: '2026-05-03',
    status: 'Verified',
    freshnessScore: 88,
    donor: 'Golden Bakery',
    donorAddress: '0xdef0...mnop',
    createdAt: '2026-05-01T18:00:00Z',
    imageEmoji: '🍞',
  },
  {
    id: '5',
    foodType: 'Biryani',
    quantity: 120,
    unit: 'servings',
    location: 'Kurla, Mumbai',
    expiryDate: '2026-05-02',
    status: 'Active',
    freshnessScore: 90,
    donor: 'Spice Garden Restaurant',
    donorAddress: '0x2468...qrst',
    createdAt: '2026-05-02T11:00:00Z',
    notes: 'Vegetable biryani, mildly spiced.',
    imageEmoji: '🍛',
  },
  {
    id: '6',
    foodType: 'Fresh Fruits',
    quantity: 30,
    unit: 'kg',
    location: 'Powai, Mumbai',
    expiryDate: '2026-05-05',
    status: 'Active',
    freshnessScore: 97,
    donor: 'Tech Campus Cafeteria',
    donorAddress: '0x1357...uvwx',
    createdAt: '2026-05-02T10:30:00Z',
    imageEmoji: '🍎',
  },
];

export const REQUESTS: FoodRequest[] = [
  {
    id: '1',
    foodType: 'Cooked Meals',
    quantityNeeded: 300,
    unit: 'servings',
    location: 'Dharavi, Mumbai',
    status: 'Open',
    urgencyLevel: 5,
    ngoName: 'Feeding India Foundation',
    ngoAddress: '0xaaaa...1111',
    createdAt: '2026-05-01T09:00:00Z',
    notes: 'Need meals for flood relief camp.',
  },
  {
    id: '2',
    foodType: 'Rice & Pulses',
    quantityNeeded: 100,
    unit: 'kg',
    location: 'Govandi, Mumbai',
    status: 'Matched',
    urgencyLevel: 4,
    ngoName: 'Asha Kiran NGO',
    ngoAddress: '0xbbbb...2222',
    createdAt: '2026-05-01T11:00:00Z',
    notes: 'For weekly community kitchen.',
  },
  {
    id: '3',
    foodType: 'Fresh Vegetables',
    quantityNeeded: 40,
    unit: 'kg',
    location: 'Mankhurd, Mumbai',
    status: 'Open',
    urgencyLevel: 3,
    ngoName: 'Seva Trust',
    ngoAddress: '0xcccc...3333',
    createdAt: '2026-05-01T13:00:00Z',
  },
  {
    id: '4',
    foodType: 'Bread & Bakery Items',
    quantityNeeded: 200,
    unit: 'pieces',
    location: 'Chembur, Mumbai',
    status: 'Open',
    urgencyLevel: 2,
    ngoName: 'Morning Light Foundation',
    ngoAddress: '0xdddd...4444',
    createdAt: '2026-04-30T08:00:00Z',
    notes: 'For breakfast distribution.',
  },
  {
    id: '5',
    foodType: 'Any Cooked Food',
    quantityNeeded: 500,
    unit: 'servings',
    location: 'Worli, Mumbai',
    status: 'Open',
    urgencyLevel: 5,
    ngoName: 'Hunger Relief Network',
    ngoAddress: '0xeeee...5555',
    createdAt: '2026-05-02T07:00:00Z',
    notes: 'Emergency: cyclone displaced families.',
  },
];

export const STATS = {
  totalDonations: 12450,
  mealsServed: 48200,
  activeNGOs: 340,
  tokensDistributed: 89500,
};

export const USER_STATS = {
  donationsMade: 8,
  mealsContributed: 640,
  tokensEarned: 320,
  achievementBadges: 3,
};

export type TxStatus = 'Confirmed' | 'Pending' | 'Failed';
export type TxType = 'Donation' | 'Request' | 'Token Reward' | 'Verification';

export interface ChainTransaction {
  id: string;
  txHash: string;
  blockNumber: number;
  type: TxType;
  status: TxStatus;
  foodType: string;
  quantity: string;
  from: string;
  to: string;
  gasUsed: string;
  hbkTokens: number;
  timestamp: string;
  network: 'Ethereum' | 'Polygon';
  confirmations: number;
}

