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

DISTRICTS = {
    1: {'name': 'Raffles', 'base': 4500000, 'locs': ['Marina Bay', 'Raffles Place']},
    2: {'name': 'Tanjong Pagar', 'base': 4200000, 'locs': ['Tanjong Pagar', 'Outram']},
    3: {'name': 'Tiong Bahru', 'base': 3800000, 'locs': ['Tiong Bahru']},
    4: {'name': 'Bukit Merah', 'base': 3600000, 'locs': ['Bukit Merah']},
    5: {'name': 'Jurong', 'base': 2100000, 'locs': ['Jurong East', 'Clementi']},
    9: {'name': 'Orchard', 'base': 5200000, 'locs': ['Orchard', 'Somerset']},
    10: {'name': 'Bukit Timah', 'base': 3400000, 'locs': ['Bukit Timah']},
    11: {'name': 'Novena', 'base': 3200000, 'locs': ['Novena']},
    12: {'name': 'Toa Payoh', 'base': 2800000, 'locs': ['Toa Payoh']},
    14: {'name': 'Geylang', 'base': 2400000, 'locs': ['Geylang']},
    15: {'name': 'Bedok', 'base': 2200000, 'locs': ['Bedok', 'East Coast']},
    16: {'name': 'Tampines', 'base': 2000000, 'locs': ['Tampines']},
    17: {'name': 'Changi', 'base': 1900000, 'locs': ['Changi', 'Pasir Ris']},
    19: {'name': 'Serangoon', 'base': 2300000, 'locs': ['Serangoon', 'Punggol']},
    20: {'name': 'Ang Mo Kio', 'base': 2200000, 'locs': ['Ang Mo Kio']},
    25: {'name': 'Bukit Panjang', 'base': 2000000, 'locs': ['Bukit Panjang']},
    26: {'name': 'Yishun', 'base': 1800000, 'locs': ['Yishun']},
    27: {'name': 'Woodlands', 'base': 1900000, 'locs': ['Woodlands']},
}

NAMES = ['Pinnacle', 'Marina', 'Goodman', 'Affinity', 'Floridian', 'Peak', 'Skyline', 'Nova', 'Crest', 'Eden']

print("\n🏢 Generating market data...")

properties = []
for district_id, info in DISTRICTS.items():
    for i in range(2):
        base_price = info['base']
        location = random.choice(info['locs'])
        price = base_price * random.uniform(0.7, 1.3)
        size = random.randint(800, 2000)
        
        properties.append({
            'project_name': f"{random.choice(NAMES)} @ {location}",
            'location': location,
            'district': district_id,
            'property_type': random.choice(['Condominium', 'Landed']),
            'tenure': random.choice(['Freehold', '99-Year']),
            'size_sqft': size,
            'recent_price': price,
            'recent_date': datetime.now().strftime('%Y-%m-%d'),
            'age': random.randint(2, 15)
        })

print(f"✅ Generated {len(properties)} properties")
print("💾 Loading to Supabase...")

loaded = 0
prop_map = {}

for prop in properties:
    try:
        r = requests.post(f'{SUPABASE_URL}/rest/v1/properties', headers=headers, json=prop)
        if r.status_code in [200, 201]:
            pid = r.json()[0]['id']
            prop_map[pid] = prop
            loaded += 1
    except:
        pass

print(f"✅ Loaded {loaded} properties")

# Add rentals
print("🏠 Adding rentals...")
rentals = []
for pid, prop in prop_map.items():
    monthly = prop['recent_price'] * 0.004
    rentals.append({
        'property_id': pid,
        'bedrooms': random.randint(2, 4),
        'monthly_rent': monthly,
        'annual_rent': monthly * 12,
        'rental_date': datetime.now().strftime('%Y-%m-%d')
    })

if rentals:
    requests.post(f'{SUPABASE_URL}/rest/v1/rentals', headers=headers, json=rentals)
print(f"✅ Added {len(rentals)} rentals")

# Add transactions
print("📈 Adding transactions...")
transactions = []
for pid, prop in prop_map.items():
    for days_back in [0, 90, 180, 365]:
        factor = 1 - (days_back / 365) * 0.15
        transactions.append({
            'property_id': pid,
            'price': prop['recent_price'] * factor,
            'area': prop['size_sqft'],
            'transaction_date': (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d'),
            'tenure_at_time': prop['tenure']
        })

if transactions:
    requests.post(f'{SUPABASE_URL}/rest/v1/transactions', headers=headers, json=transactions)
print(f"✅ Added {len(transactions)} transactions")

print("\n✅ Done! Data is live on your website!")
