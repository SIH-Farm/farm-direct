# 🌾 FarmDirect — Farm to Fork, No Middlemen

India's first AI-powered digital marketplace connecting farmers and FPOs directly with consumers and bulk buyers.

## Problem
Multiple intermediaries reduce farmer earnings by **40-60%** and inflate consumer prices. The current supply chain:

```
Farmer → Commission Agent → Wholesaler → Retailer → Consumer
(₹20/kg)   (+₹5)            (+₹10)       (+₹15)     (₹50/kg)
```

## Our Solution
A direct digital marketplace that eliminates middlemen:

```
Farmer → FarmDirect Platform → Consumer
(₹20/kg)    (+₹8)              (₹28/kg)
```

**Result**: Farmers earn **67%** more than through a Mandi commission agent, and consumers pay **45%** less than supermarket retail — both averaged across the 15 crops priced by the shared pricing engine (`apps/client/src/utils/pricingEngine.js`), which is also what the landing page and marketplace render from.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Design System) |
| Backend | Node.js + Express |
| Charts | Recharts |
| Maps | Leaflet.js |
| Icons | Lucide React |

## Project Structure

```
farm-direct/
├── apps/
│   ├── client/          # React frontend (Vite)
│   └── server/          # Node.js + Express backend
├── package.json         # Monorepo workspace config
└── README.md
```

## Team Assignments

| Member | Responsibility | Branch |
|---|---|---|
| **Lead** | Foundation, AI Analytics, Integration | `main`, `feat/analytics` |
| **Person 2** | Farmer Portal + FPO Dashboard | `feat/farmer-portal` |
| **Person 3** | Consumer Marketplace + Cart | `feat/marketplace` |
| **Person 4** | Logistics & Maps | `feat/logistics` |
| **Person 5** | Backend API + Mock Data | `feat/backend` |
| **Person 6** | Landing Page + Hindi i18n + Polish | `feat/landing-i18n` |

## Setup

```bash
# Clone the repo
git clone https://github.com/<YOUR-ORG>/farm-direct.git
cd farm-direct

# Install all dependencies (root + client + server)
npm install

# Run frontend dev server
npm run dev:client

# Run backend dev server (in another terminal)
npm run dev:server
```

## Git Workflow

1. **Never push directly to `main`** — always create a feature branch.
2. Branch naming: `feat/<feature-name>`, `fix/<bug-name>`, `style/<ui-change>`
3. Create Pull Requests for review before merging.
4. Keep your branch updated: `git pull origin main` before pushing.

```bash
# Create your feature branch
git checkout -b feat/your-feature

# Work on your changes, then:
git add .
git commit -m "feat: describe what you did"
git push origin feat/your-feature

# Then create a Pull Request on GitHub
```

## Key Features

- 🛒 **Consumer Marketplace** — Browse farm-fresh produce, price transparency badges
- 🧑‍🌾 **Farmer Portal** — List crops, manage orders, view Mandi price comparisons
- 📦 **Bulk Buyer Portal** — Bid on bulk lots, contract farming
- 📈 **AI Analytics** — Demand forecasting, price predictions, seasonal insights
- 🚛 **Logistics** — Route optimization, delivery tracking, cold-chain monitoring
- 🌐 **Hindi/English** — Bilingual support

## License

MIT
