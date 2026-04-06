# Singapore Property Investment Platform

A powerful web application for analyzing Singapore property investments with advanced filtering, comparison tools, mortgage calculation, and portfolio tracking.

## Features

✨ **Market Dashboard** - Real-time market overview and key statistics
📊 **Project Comparison** - Side-by-side analysis of multiple properties
🔍 **Investment Screening** - Find undervalued deals with advanced filters
💰 **Mortgage Calculator** - Advanced loan scenarios with variable rates
📈 **Portfolio Tracker** - Manage and track your properties

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Deployment**: Vercel
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier available)
- GitHub account

### 1. Setup Locally

```bash
# Navigate to project folder
cd ~/Documents/sg-property-investment-web

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 2. Configure Supabase

1. Go to https://supabase.com/dashboard
2. Create a new project:
   - Name: `sg-property-web`
   - Password: Strong password
   - Region: Singapore
3. Wait for initialization (~5 minutes)
4. Go to Settings → API
5. Copy your credentials:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

### 3. Create Database Tables

In Supabase SQL Editor, run:

```sql
-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name TEXT NOT NULL,
  location TEXT NOT NULL,
  district INTEGER NOT NULL,
  property_type TEXT NOT NULL,
  tenure TEXT NOT NULL,
  age INTEGER,
  size_sqft NUMERIC NOT NULL,
  recent_price NUMERIC NOT NULL,
  recent_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public_read" ON properties FOR SELECT USING (true);
```

### 4. Add Sample Data (Optional)

```sql
INSERT INTO properties (project_name, location, district, property_type, tenure, age, size_sqft, recent_price, recent_date) VALUES
('Marina Bay Suites', 'Singapore', 4, 'Condo', 'Freehold', 8, 1850, 3500000, '2024-03-01'),
('The Pinnacle', 'Singapore', 9, 'Condo', '99-Year Lease', 15, 1450, 2800000, '2024-02-28'),
('Goodman Residences', 'Singapore', 15, 'Condo', '99-Year Lease', 5, 1100, 1950000, '2024-03-05');
```

### 5. Run Locally

```bash
npm run dev
```

Visit: http://localhost:3000

### 6. Deploy to Vercel

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit: Property analyzer app"
git push origin main
```

2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase key
5. Click Deploy

Your app is now live!

## Usage

### Dashboard
- View market overview
- Check key statistics
- Browse recent properties

### Compare Projects
- Select up to 5 properties
- View side-by-side comparison
- Analyze pricing and tenure
- Get quick investment scores

### Investment Screening
- Filter by price, district, type
- Find undervalued deals
- Sort by price/sqft
- See deals vs market average

### Mortgage Calculator
- Input purchase price and down payment
- Select bank package or custom rates
- Compare loan scenarios
- Export amortization schedule
- Calculate early termination costs

### Portfolio
- Add your properties
- Track total value
- View purchase history
- Add notes and analysis

## Data Sources

This app is designed to work with:
- **URA APIs** - Official Singapore property transaction data
- **Manual data input** - For your portfolio properties
- **Your own data** - Import CSV or add manually

To add market data:
1. Fetch from URA APIs (official sources)
2. Insert into Supabase via admin panel or API
3. Data automatically appears in dashboards

## Environment Variables

Create `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx           # Market overview
│   ├── ProjectComparison.tsx   # Compare properties
│   ├── InvestmentScreening.tsx # Filter & find deals
│   ├── MortgageCalculator.tsx  # Loan calculations
│   └── Portfolio.tsx           # Your properties
├── lib/
│   ├── supabase.ts            # Database client
│   └── mortgage.ts            # Mortgage logic
├── styles/
│   └── globals.css            # Global styles
├── App.tsx                     # Main app component
└── main.tsx                    # Entry point
```

## API Reference

### Properties

```typescript
getProperties()              // Get all properties
getPropertyById(id)          // Get single property
getPropertiesByDistrict(d)   // Filter by district
searchProperties(filters)    // Advanced search
```

### Mortgage

```typescript
calculateMortgage(input)  // Calculate loan scenarios
formatCurrency(value)     // Format SGD currency
formatPercent(value)      // Format percentages
```

## Future Features

- Real-time URA data integration
- AI-powered property recommendations
- Historical price trend analysis
- Rental income projections
- Investment performance tracking
- Multi-user collaboration

## Support

For issues or questions:
1. Check the documentation
2. Review example properties
3. Test with sample data first
4. Contact support or open an issue on GitHub

## License

Personal use only. Not for commercial distribution.

## Built With ❤️

By Chern for intelligent property investing in Singapore.

