import requests
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import random

load_dotenv('/Users/chernyeh/Documents/sg-property-investment-web/.env.local')

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

# District data with realistic prices and locations
DISTRICTS = {
    1: {'name': 'Raffles Place', 'base_price': 4500000, 'locations': ['Marina Bay', 'Raffles Place', 'City Hall']},
    2: {'name': 'Tanjong Pagar', 'base_price': 4200000, 'locations': ['Tanjong Pagar', 'Outram']},
    3: {'name': 'Tiong Bahru', 'base_price': 3800000, 'locations': ['Tiong Bahru', 'Bukit Merah', 'Kallang']},
    4: {'name': 'Bukit Merah', 'base_price': 3600000, 'locations': ['Bukit Merah', 'Marina Bay']},
    5: {'name': 'Jurong', 'base_price': 2100000, 'locations': ['Jurong East', 'Jurong West', 'Clementi', 'Boon Lay']},
    9: {'name': 'Orchard', 'base_price': 5200000, 'locations': ['Orchard', 'Somerset', 'Newton', 'Dhoby Ghaut']},
    10: {'name': 'Bukit Timah', 'base_price': 3400000, 'locations': ['Bukit Timah', 'Holland Village', 'Tanglin']},
    11: {'name': 'Novena', 'base_price': 3200000, 'locations': ['Novena', 'Newton']},
    12: {'name': 'Toa Payoh', 'base_price': 2800000, 'locations': ['Toa Payoh', 'Potong Pasir']},
    14: {'name': 'Geylang', 'base_price': 2400000, 'locations': ['Geylang', 'Eunos']},
    15: {'name': 'Bedok', 'base_price': 2200000, 'locations': ['Bedok', 'East Coast', 'Chai Chee']},
    16: {'name': 'Tampines', 'base_price': 2000000, 'locations': ['Tampines', 'Simei']},
    17: {'name': 'Changi', 'base_price': 1900000, 'locations': ['Changi', 'Pasir Ris', 'Loyang']},
    19: {'name': 'Serangoon', 'base_price': 2300000, 'locations': ['Serangoon', 'Punggol', 'Hougang']},
    20: {'name': 'Ang Mo Kio', 'base_price': 2200000, 'locations': ['Ang Mo Kio', 'Bishan']},
    25: {'name': 'Bukit Panjang', 'base_price': 2000000, 'locations': ['Bukit Panjang', 'Choa Chu Kang', 'Bukit Batok']},
    26: {'name': 'Yishun', 'base_price': 1800000, 'locations': ['Yishun', 'Sengkang']},
    27: {'name': 'Woodlands', 'base_price': 1900000, 'locations': ['Woodlands', 'Sembawang']},
}

PROJECT_NAMES = [
    'The Pinnacle', 'Marina Bay Suites', 'Goodman Residences', 'Affinity', 'The Floridian',
    'Sennett Residences', 'Normanton Park', 'Perfect 10', 'Clement Canary', 'The Peak',
    'Skyline Residences', 'Harmony Heights', 'Pinnacle Towers', 'Riverside Residences', 'Urban Oasis',
    'Luxe Gardens', 'Crystal Courts', 'Golden Link', 'Prestige Park', 'Elite Living',
    'Quantum Tower', 'Serenity Gardens', 'Nova Heights', 'Summit Residences', 'The Crest',
    'Eden Court', 'Apex Living', 'Compass Park', 'Sterling Heights', 'Jade Residences'
]

def clear_existing_data():
    """Clear existing data to avoid duplicates"""
    print("🗑️  Clearing existing data...\n")
    try:
        requests.delete(
            f'{SUPABASE_URL}/rest/v1/transactions?id=not.is.null',
            headers=headers
        )
        requests.delete(
            f'{SUPABASE_URL}/rest/v1/rentals?id=not.is.null',
            headers=headers
        )
        requests.delete(
            f'{SUPABASE_URL}/rest/v1/properties?id=not.is.null',
            headers=headers
        )
        print("✅ Cleared old data\n")
    except:
        pass

def generate_properties():
    """Generate 60+ realistic properties across all districts"""
    properties = []
    
    for district_id, district_info in DISTRICTS.items():
        # 2-3 properties per district
        for i in range(random.randint(2, 3)):
            base_price = district_info['base_price']
            location = random.choice(district_info['locations'])
            
            # Vary prices ±30%
            price = base_price * random.uniform(0.7, 1.3)
            
            # Random size 800-2000 sqft
            size = random.randint(800, 2000)
            
            tenure = random.choice(['Freehold', '99-Year', '999-Year'])
            ptype = random.choice(['Condominium', 'Landed', 'HDB'])
            
            prop_name = f"{random.choice(PROJECT_NAMES)} @ {location}"
            
            properties.append({
                'project_name': prop_name,
                'location': location,
                'district': district_id,
                'property_type': ptype,
                'tenure': tenure,
                'size_sqft': size,
                'recent_price': price,
                'recent_date': datetime.now().strftime('%Y-%m-%d'),
                'age': random.randint(2, 15)
            })
    
    return properties

def load_properties_batch(properties):
    """Batch load properties"""
    print(f"💾 Loading {len(properties)} properties...\n")
    
    loaded = 0
    property_ids = {}
    
    for prop in properties:
        try:
            response = requests.post(
                f'{SUPABASE_URL}/rest/v1/properties',
                headers=headers,
                json=prop,
                timeout=5
            )
            
            if response.status_code in [200, 201]:
                prop_id = response.json()[0]['id']
                property_ids[prop['project_name']] = prop_id
                loaded += 1
                
                if loaded % 10 == 0:
                    print(f"✅ Loaded {loaded}/{len(properties)}")
            else:
                print(f"⚠️  {prop['project_name']}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print(f"\n✅ Total loaded: {loaded}\n")
    return property_ids

def load_rentals(property_ids):
    """Add rental data for each property"""
    print("🏠 Adding rental data...\n")
    
    rentals = []
    
    for prop_name, prop_id in property_ids.items():
        # Get property details to calculate rent
        try:
            response = requests.get(
                f'{SUPABASE_URL}/rest/v1/properties?id=eq.{prop_id}',
                headers=headers
            )
            
            if response.json():
                prop = response.json()[0]
                price = prop['recent_price']
                
                # Estimate monthly rent (0.35-0.45% monthly yield)
                monthly_rent = price * random.uniform(0.0035, 0.0045)
                
                rental = {
                    'property_id': prop_id,
                    'bedrooms': random.randint(2, 4),
                    'monthly_rent': monthly_rent,
                    'annual_rent': monthly_rent * 12,
                    'rental_date': datetime.now().strftime('%Y-%m-%d')
                }
                
                rentals.append(rental)
        except:
            pass
    
    # Batch insert rentals
    if rentals:
        try
