# 👥 FarmDirect — Team Task Division & Hackathon Execution Guide

> **Repository**: [https://github.com/SIH-Farm/farm-direct.git](https://github.com/SIH-Farm/farm-direct.git)  
> **Main Branch**: `main`  
> **Stack**: React (Vite) + Express (Node.js) + Vanilla CSS  

---

## 🔀 Git Branching & Workflow Rules (For All Teammates)

Each member works on their dedicated feature branch and uses AI tools (Gemini, ChatGPT, Copilot, Cursor, etc.) to build fast.

### Daily Commands:
```bash
# 1. Pull latest main before starting
git checkout main
git pull origin main

# 2. Switch to your feature branch
git checkout -b feat/your-feature-name

# 3. Commit your changes
git add .
git commit -m "feat: description of changes made"

# 4. Push branch to GitHub
git push -u origin feat/your-feature-name

# 5. Create Pull Request on GitHub → Lead reviews & merges to main
```

---

## 👤 Team Member Task Division (6 Members)

### 👤 Member 1 (Team Lead) — `main` / `feat/auth-tour`
**Role**: Role-Based Access Control + Guided Tour + Integration + Pitch  

* **Key Deliverables**:
  1. Verify `src/components/Auth/ProtectedRoute.jsx` route gating works across all 4 roles (`consumer`, `farmer`, `bulk_buyer`, `admin`).
  2. Maintain `src/components/Tour/GuidedTour.jsx` step-by-step judge walkthrough overlay.
  3. Ensure role selector dropdown in `Navbar.jsx` transitions correctly.
  4. Perform final PR reviews and merge code into `main`.
* **Files to focus on**:
  - `src/App.jsx`
  - `src/components/Auth/ProtectedRoute.jsx`
  - `src/components/Tour/GuidedTour.jsx`
  - `src/components/Layout/Navbar.jsx`
* **AI Prompt to use**:
  > *"Enhance the React GuidedTour component to highlight elements on screen during each step of the tour overlay."*

---

### 👤 Member 2 (Farmer Experience) — `feat/farmer-portal`
**Role**: Farmer Portal & Produce Posting Flow  

* **Key Deliverables**:
  1. Enhance `src/pages/FarmerPortal/FarmerPortal.jsx` produce posting form.
  2. Add **Hindi Voice Input Simulation** on the produce form (microphone button that auto-fills crop name & price).
  3. Add active listing table actions (edit, delete, stock update).
  4. Connect Mandi vs FarmDirect payout comparison cards.
* **Files to focus on**:
  - `src/pages/FarmerPortal/FarmerPortal.jsx`
  - `src/pages/FarmerPortal/FarmerPortal.css`
* **AI Prompt to use**:
  > *"Write a React hook for Web Speech API speech recognition that listens to Hindi input like '500 kilo Tamatar 25 rupaye' and extracts cropName, quantity, and farmPrice."*

---

### 👤 Member 3 (Consumer Marketplace) — `feat/consumer-marketplace`
**Role**: Live Marketplace, Cart & Order Flow  

* **Key Deliverables**:
  1. Maintain `src/pages/Marketplace/Marketplace.jsx` live polling mechanism.
  2. Ensure "🆕 JUST LISTED" badges appear when new products are fetched.
  3. Add order tracking progress modal (`Placed` → `Quality Tested` → `In Transit` → `Delivered`) when buyer places an order.
  4. Integrate search filters (by crop name, category, and farmer district).
* **Files to focus on**:
  - `src/pages/Marketplace/Marketplace.jsx`
  - `src/components/Cart/CartDrawer.jsx`
  - `src/components/LiveTicker/LiveTicker.jsx`
* **AI Prompt to use**:
  > *"Build a React OrderTracker component showing a animated progress bar with 4 steps: Order Placed, Quality Certification, Dispatch, and Delivered."*

---

### 👤 Member 4 (Pricing & Mandi Engine) — `feat/pricing-engine`
**Role**: Transparent Pricing Model & Benchmark Intelligence  

* **Key Deliverables**:
  1. Maintain `src/utils/pricingEngine.js` formulas:
     - `Farm Price`: Direct farmer payout
     - `Platform Fee`: 8% transparent operational fee
     - `Platform Consumer Price`: `Farm Price + 8%`
     - `Mandi Rate`: Official Agmarknet benchmark
     - `Retail Rate`: Mandi × 2.0
     - `Consumer Savings`: Up to 40% vs retail
  2. Enhance `<PriceBreakdown />` visual card with interactive price breakdown toggle.
  3. Add crop price trend graph comparison (Mandi vs FarmDirect payout).
* **Files to focus on**:
  - `src/utils/pricingEngine.js`
  - `src/components/PriceBreakdown/PriceBreakdown.jsx`
  - `src/components/PriceBreakdown/PriceBreakdown.css`
* **AI Prompt to use**:
  > *"Create a visual CSS stacked bar chart component comparing Mandi Payout, FarmDirect Payout, and Retail Price for a crop."*

---

### 👤 Member 5 (Backend API & Data) — `feat/backend-api`
**Role**: Express API, Mandi Database & Notifications  

* **Key Deliverables**:
  1. Maintain `apps/server/index.js` endpoints:
     - `GET /api/products` (supports `farmerId`, `category`, `search` filtering)
     - `POST /api/products` (inserts product + emits notification)
     - `PATCH /api/products/:id` (updates stock/status)
     - `DELETE /api/products/:id`
     - `POST /api/orders`
     - `GET /api/mandi-prices`
     - `GET /api/notifications`
  2. Add sample seed data for 20+ Indian crops across Maharashtra, Punjab, UP, Kerala, and Karnataka.
* **Files to focus on**:
  - `apps/server/index.js`
* **AI Prompt to use**:
  > *"Add Express route handlers for bulk order RFQ quotes and farmer notifications with proper CORS headers."*

---

### 👤 Member 6 (UI/UX Polish & Hindi i18n) — `feat/ui-i18n`
**Role**: Aesthetics, Hindi Language Pack & Mobile Responsiveness  

* **Key Deliverables**:
  1. Complete Hindi translation dictionary in `src/data/mockData.js` (`i18n.hi`).
  2. Ensure all cards, tables, and modals are 100% mobile-responsive.
  3. Fix dark mode contrast styling in `src/styles/index.css`.
  4. Prepare slide deck / PPT presentation highlighting key differentiators.
* **Files to focus on**:
  - `src/data/mockData.js`
  - `src/styles/index.css`
  - `src/components/Layout/Footer.jsx`
* **AI Prompt to use**:
  > *"Expand the i18n object with Hindi translations for Marketplace, Farmer Portal, Pricing breakdown, and Cart labels."*

---

## 📅 Hackathon Time Schedule

| Time Window | Activity | Responsible |
|---|---|---|
| **Hour 0 – 1** | Clone repo, checkout feature branches, review task assignment | All Members |
| **Hour 1 – 3** | Execute feature branch development using AI prompt helpers | Members 1–6 |
| **Hour 3 – 4** | Push branches to GitHub, create PRs, resolve merge conflicts | Lead & Members |
| **Hour 4 – 5** | Run end-to-end integration test with Guided Demo Tour | Lead & Member 3 |
| **Hour 5 – 6** | Slide deck preparation & presentation rehearsal | All Members |

---

## 🏆 Standout Features to Emphasize to Judges

1. **End-to-End Live Flow**: Switch from Farmer to Consumer → Post a produce listing → See it appear **live** on the marketplace with zero page refresh.
2. **Transparent Pricing Model**: Proves exact rupee allocation (Farmer payout, 8% platform fee, consumer savings vs supermarket).
3. **Role Gating**: Shows real security posture for Farmers, Consumers, Bulk Processors, and Admins.
4. **Guided Judge Tour**: Instant floating walkthrough for judges evaluating the project.
