// Transparent Pricing Engine Utility
// Calculates exact cost breakdown, platform fee (8%), estimated retail price, consumer savings, and farmer bonus vs Mandi.

export const MANDI_BENCHMARKS = {
  tomato: { crop: 'Tomato', mandiPrice: 28, avgRetail: 58 },
  onion: { crop: 'Onion', mandiPrice: 22, avgRetail: 45 },
  wheat: { crop: 'Wheat', mandiPrice: 32, avgRetail: 55 },
  rice: { crop: 'Rice', mandiPrice: 38, avgRetail: 65 },
  coffee: { crop: 'Coffee', mandiPrice: 420, avgRetail: 800 },
  mango: { crop: 'Mango', mandiPrice: 75, avgRetail: 150 },
  banana: { crop: 'Banana', mandiPrice: 22, avgRetail: 50 },
  potato: { crop: 'Potato', mandiPrice: 18, avgRetail: 35 },
  chilli: { crop: 'Green Chilli', mandiPrice: 40, avgRetail: 80 },
  pepper: { crop: 'Black Pepper', mandiPrice: 520, avgRetail: 950 },
  turmeric: { crop: 'Turmeric', mandiPrice: 140, avgRetail: 280 },
  cumin: { crop: 'Cumin Seeds', mandiPrice: 320, avgRetail: 600 },
  pomegranate: { crop: 'Pomegranate', mandiPrice: 95, avgRetail: 180 },
  grapes: { crop: 'Grapes', mandiPrice: 55, avgRetail: 120 },
  sugarcane: { crop: 'Sugarcane', mandiPrice: 3.5, avgRetail: 8 },
};

/** Strips case, spaces and punctuation so "Black Pepper" and "blackpepper" agree. */
const normalizeCropName = (name = '') => name.toLowerCase().replace(/[^a-z]/g, '');

/**
 * Resolves the Mandi benchmark for a crop name.
 * Multi-word crops are keyed by their short name in MANDI_BENCHMARKS
 * ("Black Pepper" -> `pepper`, "Green Chilli" -> `chilli`), so a plain key lookup
 * silently misses them and invents a benchmark instead. Matching against the
 * benchmark's own `crop` label as well keeps those crops honest.
 */
function findBenchmark(cropName) {
  const normalized = normalizeCropName(cropName);
  if (!normalized) return null;
  if (MANDI_BENCHMARKS[normalized]) return MANDI_BENCHMARKS[normalized];
  return Object.values(MANDI_BENCHMARKS).find(b => normalizeCropName(b.crop) === normalized) || null;
}

/**
 * Calculates transparent price metrics for a given crop and farmer price.
 * @param {number} farmPrice - Payout requested by farmer (₹/kg)
 * @param {string} cropName - Name of crop
 * @returns {Object} Full breakdown of fees, savings, and bonuses
 */
export function calculatePricing(farmPrice, cropName = '') {
  const numericFarmPrice = Number(farmPrice) || 0;
  const benchmark = findBenchmark(cropName) || {
    mandiPrice: Math.round(numericFarmPrice * 0.85),
    avgRetail: Math.round(numericFarmPrice * 1.8),
  };

  const PLATFORM_FEE_PERCENT = 0.08; // 8% direct platform transparent fee
  const platformFee = Math.round(numericFarmPrice * PLATFORM_FEE_PERCENT * 10) / 10;
  const platformPrice = Math.round((numericFarmPrice + platformFee) * 10) / 10;
  const retailPrice = benchmark.avgRetail;

  const consumerSaving = Math.max(0, Math.round((retailPrice - platformPrice) * 10) / 10);
  const consumerSavingPercent = retailPrice > 0 ? Math.round((consumerSaving / retailPrice) * 100) : 0;

  // Farmers selling in Mandi usually get only ~60% of Mandi price after agent commissions, transport, & grading cuts
  const mandiNetFarmerPayout = Math.round(benchmark.mandiPrice * 0.6 * 10) / 10;
  const farmerBonusVsMandi = Math.max(0, Math.round((numericFarmPrice - mandiNetFarmerPayout) * 10) / 10);
  const farmerBonusPercent = mandiNetFarmerPayout > 0 ? Math.round((farmerBonusVsMandi / mandiNetFarmerPayout) * 100) : 0;

  return {
    farmPrice: numericFarmPrice,
    platformFee,
    platformPrice,
    mandiPrice: benchmark.mandiPrice,
    retailPrice,
    consumerSaving,
    consumerSavingPercent,
    mandiNetFarmerPayout,
    farmerBonusVsMandi,
    farmerBonusPercent,
  };
}
