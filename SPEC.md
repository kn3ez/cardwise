# CardWise — Credit Card Benefits Optimizer

## Overview
A static web app (vanilla HTML/CSS/JS) that helps users maximize credit card rewards and track perks/benefits. Deploy-ready for GitHub Pages.

## Design System (match neez.me portfolio)
- **Background:** #0a0908 (near-black)
- **Secondary bg:** #141210
- **Text:** #f5f3f0 (warm white)
- **Muted text:** #9a958e
- **Accent (gold):** #e8b059
- **Accent secondary:** #d4956a
- **Card bg:** rgba(20, 18, 16, 0.8) with backdrop-filter blur
- **Border:** rgba(245, 243, 240, 0.1)
- **Fonts:** Inter (body), Fraunces (display/headings)
  - Google Fonts: `Inter:wght@300;400;500;600;700` and `Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700`
- **Border radius:** 8px (sm), 12px (md), 20px (lg)
- **Transitions:** 150ms (fast), 300ms (base), 500ms (slow)
- Subtle lava lamp background blobs (like neez.me) — keep subtle, not distracting
- Glass-morphism card style with border glow on hover

## Features

### 1. Card Selector (My Wallet)
- Browse from a database of popular credit cards
- Search/filter by issuer, card name, category
- Add cards to "My Wallet" — these are the cards you own
- Default wallet (pre-selected): Capital One Venture X, Chase Sapphire Preferred, Amex Platinum, Chase Freedom Unlimited
- Visual card representations with issuer branding colors
- Persist selections in localStorage

### 2. Spending Optimizer
- Show a grid/table of spending categories
- For each category, highlight which card in "My Wallet" earns the best rate
- Categories: Dining, Travel (flights), Travel (hotels), Groceries, Gas, Streaming, Online shopping, Transit, General/everything else
- Show the earning rate (e.g., "3x points", "5% back")
- Quick visual: card color + rate for each category
- Include a "What should I use?" quick-lookup: type a merchant/category, see the best card

### 3. Benefits & Perks Tracker
- List all perks for cards in "My Wallet"
- Group by card
- Show: perk name, value, frequency (annual/monthly), renewal date, status (used/unused/partial)
- Users can mark perks as "used" — save to localStorage
- Highlight upcoming expirations (within 30 days) in gold/warning
- Examples of perks: airline credits, streaming credits, Uber credits, Global Entry credit, hotel credits, annual travel credits, lounge access, etc.

### 4. Calendar Export
- Generate .ics file with perk expiration reminders
- Each perk gets an event 1 week before expiration + day of expiration
- Download button for the .ics file
- Events should have descriptive titles like "⚠️ Use Amex Platinum $200 Uber Credit (expires Dec 31)"

### 5. Dashboard Summary
- Total annual fees across wallet
- Estimated total perk value
- Net value (perks - fees)
- Number of perks unused this cycle
- "Action needed" alerts for expiring perks

## Card Database

Include at MINIMUM these cards with ACCURATE current data. Use the data below — it has been researched.

### Capital One Venture X
- **Issuer:** Capital One
- **Annual Fee:** $395
- **Earning Rates:**
  - 10x on hotels & rental cars booked via Capital One Travel
  - 5x on flights booked via Capital One Travel
  - 2x on all other purchases
- **Key Perks:**
  - $300 annual travel credit (Capital One Travel bookings)
  - 10,000 anniversary bonus miles (annual)
  - Priority Pass lounge access
  - Capital One Lounge access
  - Global Entry / TSA PreCheck credit ($120, every 4 years)
  - Hertz rental car status
  - Capital One Premier Collection hotel benefits
  - No foreign transaction fees
  - Primary car rental insurance
  - Trip cancellation/interruption insurance
  - Lost luggage reimbursement

### Chase Sapphire Preferred
- **Issuer:** Chase
- **Annual Fee:** $95
- **Earning Rates:**
  - 5x on travel booked through Chase Travel
  - 3x on dining (restaurants, delivery, takeout)
  - 3x on online grocery (excluding Target, Walmart, wholesale)
  - 3x on select streaming services
  - 2x on other travel
  - 1x on everything else
- **Key Perks:**
  - $50 annual Chase Travel hotel credit
  - Points worth 25% more when redeemed through Chase Travel
  - Transfer to airline/hotel partners (1:1)
  - DoorDash DashPass subscription
  - Instacart+ membership (through 2027)  
  - Trip cancellation/interruption insurance
  - Primary car rental insurance
  - Purchase protection
  - Extended warranty
  - No foreign transaction fees

### Amex Platinum
- **Issuer:** American Express
- **Annual Fee:** $695
- **Earning Rates:**
  - 5x on flights booked directly with airlines or through Amex Travel
  - 5x on prepaid hotels booked through Amex Travel
  - 1x on everything else
- **Key Perks:**
  - $200 airline fee credit (annual, select one airline)
  - $200 hotel credit (Amex Fine Hotels + Resorts / Hotel Collection)
  - $240 digital entertainment credit ($20/month — Disney+, Hulu, ESPN+, Peacock, Audible, SiriusXM, NYT)
  - $200 Uber credit ($15/month + $20 December bonus)
  - $155 Walmart+ membership credit
  - $300 Equinox credit ($25/month)
  - Global Entry / TSA PreCheck credit ($100, every 4 years)
  - Centurion Lounge access
  - Priority Pass Select lounge access
  - Delta Sky Club access (when flying Delta)
  - Fine Hotels + Resorts benefits (room upgrade, breakfast, late checkout, experience credit)
  - Hotel Collection benefits ($100 credit at 2+ night stays)
  - Hilton Honors Gold status
  - Marriott Bonvoy Gold Elite status
  - National Car Rental Executive status
  - Hertz Gold Plus Rewards status
  - Extensive travel insurance suite
  - Cell phone protection (up to $800, $50 deductible)
  - No foreign transaction fees
  - Purchase protection & extended warranty
  - Rakuten bonus (extra points for Amex cardholders)

### Chase Freedom Unlimited
- **Issuer:** Chase
- **Annual Fee:** $0
- **Earning Rates:**
  - 5% on travel booked through Chase Travel
  - 3% on dining (restaurants, delivery, takeout)
  - 3% on drugstore purchases
  - 1.5% on everything else
- **Key Perks:**
  - 0% intro APR for 15 months on purchases and balance transfers
  - Points worth 25% more when paired with Sapphire card (via Chase trifecta)
  - Purchase protection
  - Extended warranty
  - No annual fee — great base card
  - DoorDash DashPass for 1 year (if activated by Dec 2027)

### Additional Popular Cards to Include (abbreviated data is fine but be accurate):

**Chase Freedom Flex** — $0 AF, 5% rotating categories (activate quarterly), 3% dining, 3% drugstore, 1% everything else
**Amex Gold** — $250 AF, 4x dining worldwide, 4x US supermarkets (up to $25k/yr), 3x flights booked directly, 1x everything else. $120 dining credit ($10/month Grubhub, Cheesecake Factory, Goldbelly, etc.), $120 Uber Cash ($10/month), $84 Dunkin' credit ($7/month)
**Citi Double Cash** — $0 AF, effectively 2% on everything (1% when you buy, 1% when you pay)
**Chase Ink Business Preferred** — $95 AF, 3x on travel, shipping, internet/cable/phone, social media advertising; 1x everything else
**Amex Blue Cash Preferred** — $0 AF first year then $95, 6% US supermarkets (up to $6k/yr), 6% select streaming, 3% transit, 3% US gas stations, 1% everything else
**Capital One Savor One** — $0 AF, 3% dining, entertainment, streaming, grocery, 5% hotels/car booked through Cap One Travel, 8% on Capital One Entertainment, 1% everything else
**Citi Strata Premier** — $95 AF, 3x on air travel and hotels, 3x restaurants, 3x supermarkets, 3x gas, 3x at EV charging, 1x everything else, $100 annual hotel credit
**US Bank Altitude Reserve** — $400 AF, 3x travel, mobile wallet purchases; 1x everything else. $325 annual travel credit, Priority Pass, Global Entry credit
**Wells Fargo Active Cash** — $0 AF, 2% on everything (flat)
**Discover it Cash Back** — $0 AF, 5% rotating categories (activate quarterly), 1% everything else, first-year cash back match

## Architecture
- `index.html` — single page app
- `css/style.css` — all styles
- `js/app.js` — main application logic
- `js/cards.js` — card database (export as module or global)
- No build tools, no frameworks, no npm — pure vanilla for GitHub Pages
- Use ES modules if desired (type="module" script tags)
- Responsive: mobile-first, works beautifully on phones and desktops
- All data persisted to localStorage (wallet selections, perk usage tracking)

## UI Layout
1. **Header/Nav** — "CardWise" branding with subtle card icon, minimal nav
2. **Dashboard** — summary cards (total fees, total value, net, alerts)
3. **My Wallet** — horizontal scroll of selected cards with quick stats
4. **Spending Optimizer** — category grid showing best card per category
5. **Benefits Tracker** — expandable card sections with perk checklist
6. **Card Browser** — search/add more cards to wallet
7. **Footer** — "Built by Neez" link back to neez.me

## Important Notes
- This MUST be a polished, production-quality tool — not a prototype
- Animations should be smooth and tasteful (not overdone)
- The card representations should feel premium — use gradients, subtle shadows
- Make the spending optimizer genuinely useful — clear visual hierarchy
- Calendar .ics export is a key feature — make it prominent
- The app should feel like a premium fintech product, not a homework assignment
- Ensure all card data is accurate to the best of your knowledge
- Support adding custom cards (name, earning rates, perks) for future expansion
- Include a subtle "Add to Calendar" button next to each expiring perk

## Deployment
After building, the repo will be pushed to GitHub and deployed via GitHub Pages.
The repo name will be `cardwise` → URL: https://kn3ez.github.io/cardwise/

When completely finished building and all files are committed, run this command to notify me:
openclaw gateway wake --text "Done: CardWise credit card optimizer built and ready for deployment" --mode now
