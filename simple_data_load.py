import requests
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv('/Users/chernyeh/Documents/sg-property-investment-web/.env.local')

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

NAMES = ['Pinnacle', 'Marina', 'Goodman', 'Affinity', 'Floridian', 'Peak', 'Skyline', 'Nova', 'Crest', 'Eden', 'Luxe', 'Crystal', 'Golden', 'Prestige', 'Quantum']
LOCS = ['Marina Bay', 'Tanjong Pagar', 'Outram', 'Tiong Bahru', 'Bukit Merah', 'Jurong East', 'Clementi', 'Orchard', 'Somerset', 'Newton', 'Bukit Timah', 'Holland Village', 'Novena', 'Toa Payoh', 'Geylang', 'Bedok', 'East Coast', 'Tampines', 'Changi', 'Pasir Ris', 'Serangoon', 'Punggol', 'Hougang', 'Ang Mo Kio', 'Bishan', 'Yishun', 'Woodlands', 'Sembawang']

PRICES = [4500000, 4200000, 3800000, 3600000, 2100000, 5200000, 3400000, 3200000, 2800000, 2400000, 2200000, 2000000, 1900000, 2300000, 1800000, 1900000]

print("\n" + "="*60)
print("🏢 Loading Singapore Property Data")
print("="*60 + "\n")

prop_ids = []

# Generate and load 50 properties
print("📝 Creating 50 properties...\n")
for i in range(50):
    name = f"{random.choice(NAMES)} @ {random.choice(LOCS)}"
    location = random.choice(LOCS)
    price = random.choice(PRICES) * random.uniform(0.8, 1.2)
    
    prop = {
        'project_name': name,
        'location': location,
        'district': random.randint(1, 28),
        'property_type': random.choice(['Condominium', 'Landed', 'HDB']),
        'tenure': random.choice(['Freehold', '99-Year', '999-Year']),
        'size_sqft': random.randint(800, 2000),
        'recent_price': price,
        'recent_date': datetime.now().strftime('%Y-%m-%d'),
        'age': random.randint(2, 15)
    }
    
    try:
        r = requests.post(f'{SUPABASE_URL}/rest/v1/properties', headers=headers, json=prop)
        if r.status_code in [200, 201]:
            pid = r.json()[0]['id']
            prop_ids.append((pid, prop))
            print(f"✅ {i+1}/50 - {name[:30]}")
        else:
            print(f"❌ {i+1}/50 - Error: {r.status_code}")
    except Exception as e:
        print(f"❌ {i+1}/50 - {str(e)[:30]}")

print(f"\n✅ Loaded {len(prop_ids)} properties\n")

# Add rentals
print("🏠 Adding rentals...\n")
rental_count = 0
for pid, prop in prop_ids:
    monthly = prop['recent_price'] * random.uniform(0.003, 0.005)
    rental = {
        'property_id': pid,
        'bedrooms': random.randint(2, 4),
        'monthly_rent': monthly,
        'annual_rent': monthly * 12,
        'rental_date': datetime.now().strftime('%Y-%m-%d')
    }
    
    try:
        r = requests.post(f'{SUPABASE_URL}/rest/v1/rentals', headers=headers, json=rental)
        if r.status_code in [200, 201]:
            rental_count += 1
    except:
        pass

print(f"✅ Added {rental_count} rentals\n")

# Add transactions
print("📈 Adding transactions...\n")
trans_count = 0
for pid, prop in prop_ids:
    for days_back in [0, 90, 180, 365]:
        factor = 1 - (days_back / 365) * 0.15
        trans = {
            'property_id': pid,
            'price': prop['recent_price'] * factor,
            'area': prop['size_sqft'],
            'transaction_date': (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d'),
            'tenure_at_time': prop['tenure']
        }
        
        try:
            r = requests.post(f'{SUPABASE_URL}/rest/v1/transactions', headers=headers, json=trans)
            if r.status_code in [200, 201]:
                trans_count += 1
        except:
            pass

print(f"✅ Added {trans_count} transactions\n")

print("="*60)
print(f"✅ Complete!")
print(f"📊 Properties: {len(prop_ids)}")
print(f"🏠 Rentals: {rental_count}")
print(f"📈 Transactions: {trans_count}")
print("="*60 + "\n")
