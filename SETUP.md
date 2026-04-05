# Gamewala Inventory App — Setup Guide

> **Stack:** Next.js 14 + TypeScript + Tailwind + Google Sheets  
> **Type:** Progressive Web App (PWA) — installs on phone like a native app  
> **Deploy:** Vercel (free)  
> **Updates:** Push code → auto-deploys → app updates instantly, no reinstall needed

---

## What This App Does

| Screen | Who can use it |
|---|---|
| Login | Everyone — employees use 4-digit PIN, admin uses password |
| Dashboard | Everyone — overview of inventory, repairs, tasks |
| Scan QR | Everyone — scan or enter product ID to pull up any item |
| Add Product | Everyone — add new / second-hand / repair jobs |
| Inventory | Everyone — search and browse all products |
| Repair Jobs | Everyone — view and update repair status |
| Admin Panel | Admin only — employees, tasks, stats |

---

## Google Sheet Structure (Set This Up First)

Create a Google Sheet named **Gamewala Inventory** with these tabs:

---

### Tab 1: `NewProducts`
Row 1 headers (exact column names):
```
id | qr_code | name | category | platform | price | mfg_date | description | image_url | in_stock | added_by | added_at | sold_at | sold_by
```

---

### Tab 2: `SecondHand`
Row 1 headers:
```
id | qr_code | name | category | platform | selling_price | buying_price | original_price | purchase_date | condition | known_issues | description | image_url | receipt_image_url | seller_name | seller_phone | seller_address | processed_by | added_at | in_stock | sold_at | sold_by
```

---

### Tab 3: `Repairs`
Row 1 headers:
```
id | qr_code | product_name | platform | problem_description | owner_name | owner_phone | owner_address | received_date | estimated_delivery | delivered_date | estimate_cost | actual_cost | status | status_history | assigned_to | received_by | image_url | added_at
```

---

### Tab 4: `Users`
Row 1 headers:
```
id | name | phone | role | pin | active
```

Add your employees here. Example rows:

| id | name | phone | role | pin | active |
|---|---|---|---|---|---|
| emp-1 | Rahul | 9876543210 | employee | 1234 | TRUE |
| emp-2 | Priya | 9876543211 | employee | 5678 | TRUE |

- `role` must be `employee` or `admin`
- `pin` is the 4-digit PIN the employee uses to login
- `active` = TRUE to allow login, FALSE to block

---

### Tab 5: `Tasks`
Row 1 headers:
```
id | title | description | assigned_to | assigned_by | due_date | status | priority | created_at | completed_at
```

- `status` = `pending` or `done`
- `priority` = `low`, `medium`, or `high`

---

## Step 1 — Google Service Account

Same as the website setup:
1. [console.cloud.google.com](https://console.cloud.google.com) → New project → Enable **Google Sheets API**
2. Create a **Service Account** → Download JSON key
3. Share your Google Sheet with the service account email (Editor access)

> You can use the **same service account** as the website — just share this new sheet with it too.

---

## Step 2 — Fill in `.env.local`

Rename `.env.local.example` → `.env.local` and fill in:

```env
GOOGLE_SHEET_ID=your_inventory_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"

ADMIN_PASSWORD=StrongAdminPassword123!
JWT_SECRET=any-random-32-plus-character-string-here

NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Gamewala Inventory
```

After deploying, update `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g. `https://gamewala-inventory.vercel.app`).

---

## Step 3 — Run Locally

```bash
cd gamewala-app
npm install
npm run dev
```

Open `http://localhost:3001` on your phone (on the same WiFi network use your computer's local IP).

---

## Step 4 — Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Then in Vercel dashboard → Project Settings → Environment Variables → add all `.env.local` values.

Redeploy: `vercel --prod`

---

## Step 5 — Install as App on Phone

### Android:
1. Open Chrome → go to your Vercel URL
2. Tap the **3-dot menu** → **"Add to Home screen"**
3. It installs like a native app — full screen, no browser bar

### iPhone (iOS):
1. Open Safari → go to your Vercel URL
2. Tap the **Share button** (square with arrow) → **"Add to Home Screen"**
3. Done — opens full screen like a native app

> Every time you update and redeploy the code, the app updates automatically when the user opens it. **No reinstall needed.**

---

## How Updates Work

```
You change code
    ↓
git push (or vercel --prod)
    ↓
Vercel auto-deploys in ~1 minute
    ↓
Next time employee opens app → auto-updated
    ↓
No reinstall, no APK, no app store
```

---

## QR Code Flow

```
Employee adds product
    ↓
App generates unique ID (e.g. NEW-A1B2C3D4)
    ↓
QR code generated (encodes URL: yourapp.com/scan?id=NEW-A1B2C3D4)
    ↓
Download and print the QR label
    ↓
Stick on the product
    ↓
Scan with phone camera or app → opens product instantly
```

---

## Login System

| Who | How to login |
|---|---|
| **Admin (owner)** | Tap "Admin Login" → enter password from `.env.local` |
| **Employee** | Tap "Employee Login" → enter their 4-digit PIN |

To add an employee: open Google Sheet → Users tab → add a row with their name, phone, role=employee, pin (any 4 digits), active=TRUE.

Sessions last 12 hours. After that, re-login is required.

---

## File Structure

```
gamewala-app/
├── src/
│   ├── app/
│   │   ├── login/page.tsx          ← PIN pad + admin password login
│   │   ├── dashboard/page.tsx      ← Home screen with stats
│   │   ├── scan/page.tsx           ← QR scanner + manual entry
│   │   ├── add-product/page.tsx    ← Choose product type
│   │   ├── inventory/
│   │   │   ├── page.tsx            ← Full inventory list with search
│   │   │   ├── [id]/page.tsx       ← Product detail + QR display
│   │   │   └── [id]/RepairStatusUpdater.tsx
│   │   ├── repair/page.tsx         ← All repair jobs by status
│   │   ├── admin/
│   │   │   ├── page.tsx            ← Admin dashboard
│   │   │   ├── employees/page.tsx  ← View employees + PINs
│   │   │   └── tasks/page.tsx      ← Create + view tasks
│   │   └── api/
│   │       ├── auth/login/         ← PIN + password auth
│   │       ├── auth/logout/
│   │       ├── inventory/new/      ← Add new product to Sheets
│   │       ├── inventory/secondhand/
│   │       ├── inventory/repair/
│   │       ├── inventory/[id]/     ← Lookup product by ID
│   │       ├── repair/[id]/status/ ← Update repair status
│   │       └── tasks/              ← Create task
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx       ← Mobile bottom navigation
│   │   │   └── AppHeader.tsx       ← Top app bar
│   │   └── forms/
│   │       ├── NewProductForm.tsx  ← New product entry
│   │       ├── SecondHandForm.tsx  ← Second-hand intake
│   │       └── RepairForm.tsx      ← Repair job form
│   ├── lib/
│   │   ├── sheets.ts               ← Google Sheets read/write
│   │   ├── auth.ts                 ← JWT session management
│   │   └── qr.ts                   ← QR code generation
│   └── types/index.ts              ← All TypeScript types
├── public/
│   ├── manifest.json               ← PWA install config
│   └── icons/                      ← App icons (192 + 512px)
├── .env.local.example
├── next.config.js                  ← PWA enabled via next-pwa
└── SETUP.md
```

---

## After Prototype Approval (Upgrades)

When budget is available:
1. **Real database** — migrate from Google Sheets to Supabase (PostgreSQL) for speed
2. **Photo uploads** — direct camera capture and upload to cloud storage
3. **WhatsApp notifications** — auto-message customer when repair is ready
4. **Barcode support** — scan product barcodes to auto-fill product details
5. **Sales reporting** — charts and revenue tracking dashboard
6. **Offline mode** — full offline support with sync when back online

---

## Support

Built with Next.js + Tailwind + Google Sheets API.  
For questions, reach Gamewala: **+91 9827331338**
