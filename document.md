# Gamewala Inventory Management System

## Project Overview
**Gamewala** is a high-fidelity, mobile-first inventory and repair management application designed for a gaming shop. It replaces complex legacy systems with a nimble, "no-backend" architecture that is easy to maintain and highly visual.

### Why this project was made
- **Standardization**: To move away from manual record-keeping to a digital, QR-coded system.
- **Mobility**: To allow shop employees to scan and update inventory directly from their mobile phones.
- **Transparency**: To provide the owner with real-time analytics on sales, repairs, and stock levels without needing to open complex spreadsheets.

---

## Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) for high performance and SEO.
- **Styling**: **Vanilla CSS + Tailwind CSS** with a custom "Cyber-Clean" design system (Glassmorphism, Neon Red accents).
- **Database/Backend**: **Google Sheets API v4**. The system uses a Google Sheet as a live database, ensuring the owner can always access the raw data easily.
- **Authentication**: Custom JWT-based session handling with secure cookie persistence.
- **Visuals**: [Lucide React](https://lucide.dev/) for iconography and [Recharts](https://recharts.org/) for business analytics.
- **Utility**: [QRCode Generator](https://www.npmjs.com/package/qrcode) for automated labeling.

---

## How it Works (Architecture)

### 1. Data Flow
The application acts as a middle-layer between the user and a Google Sheet. 
- **Reads**: Fetches data from specific sheets (`NewProducts`, `SecondHand`, `Repairs`) and transforms them into JSON objects.
- **Writes**: Appends new rows or updates existing status cells using the `googleapis` library.

### 2. QR System
Every time a product or repair job is added:
1. A unique ID is generated.
2. A QR code containing the product URL is rendered on the fly.
3. The user prints this label and sticks it on the physical product.
4. Scanning this QR code later instantly takes the employee to the product's detail page for quick status updates.

### 3. Role-Based Access
- **Admin**: Full access to Business Analytics, Employee Management (PIN resets), and the full inventory.
- **Employee**: Access to Dashboard, Inventory lists, and scanning. Restricted from viewing profit margins or sensitive business data.

---

## Key Workflows

### New Stock Entry
1. Employee logs in and clicks **"Add Product"**.
2. Fills in details and optionally captures a photo using the mobile camera.
3. Clicks **"Save"**, a QR code is shown.
4. Item is now live in the inventory and the owner's Google Sheet.

### Repair Management
1. Customer brings a console. 
2. Employee enters owner details and problem description.
3. QR code is stuck to the console.
4. As the technician works on it, they scan the QR to update status from **Pending** -> **In Progress** -> **Ready**.

### Business Analytics
1. Admin logs in and navigates to **Analytics**.
2. Interactive charts show the ratio of New vs. Used stock.
3. Real-time calculation of **Potential Profit** vs. **Investment**.

---

## Maintenance & Deployment
- **Deployment**: Hosted on [Vercel](https://vercel.com).
- **Environment Variables**: Managed via `.env` (Google Service Account keys, Sheet IDs, Admin Password).
- **PWA**: The app is installable on both iOS and Android for a native-like experience.
