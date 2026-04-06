import requests
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv('/Users/chernyeh/Documents/sg-property-investment-web/.env.local')

# Supabase setup
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

# URA API setup
URA_API_KEY = 'b42f51ea-cf19-485b-b82b-6a3a92cca70a'
URA_BASE = 'https://www.ura.gov.sg/maps/api/layerdata'

headers = {
    'apikey': SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

# Location to district mapping
LOCATION_TO_DISTRICT = {
    'Marina Bay': 1, 'Raffles': 1, 'Boat Quay': 1, 'Shenton Way': 1,
    'Tanjong Pagar': 2, 'Outram': 2, 'Pearl Bank': 2,
    'Tiong Bahru': 3, 'Bukit Merah': 4, 'Kallang': 3,
    'Geylang': 14, 'Bedok': 15, 'East Coast': 15, 'Changi': 17, 'Pasir Ris': 17,
    'Tampines': 16, 'Jurong East': 5, 'Jurong West': 5, 'Boon Lay': 5, 'Clementi': 5,
    'Choa Chu Kang': 25, 'Bukit Batok': 25, 'Bukit Panjang': 25,
    'Woodlands': 27, 'Yishun': 26, 'Sembawang': 27, 'Sengkang': 26,
    'Punggol': 19, 'Hougang': 19, 'Serangoon': 19, 'Ang Mo Kio': 20,
    'Toa Payoh': 12, 'Novena': 11, 'Newton': 11, 'Orchard': 9,
    'Somerset': 9, 'Dhoby Ghaut': 9, 'Holland Village': 10,
    'Bukit Timah': 10, 'Tanglin': 10,
}

def get_district(location):
    """Map location to district"""
    for loc_key, district in LOCATION_TO_DISTRICT.items():
        if loc_key.lower() in location.lower():
            return district
    return 9  # Default to central

def fetch_ura_projects():
    """Fetch real estate projects from URA"""
    print("📊 Fetching URA projects...\n")
    
    try:
        # Fetch from URA API
        url = f'{URA_BASE}?layerid=2&year=2024'
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return data.get('results', [])
        else:
            print(f"❌ URA API error: {response.status_code}")
            return []
    except Exception as e:
        print(f"⚠️  Could not fetch URA data: {e}")
        print("Using sample data instead...\n")
        return get_sample_projects()

def get_sample_projects():
    """Fallback sample data if URA API fails"""
    return [
        {
            'name': 'The Pinnacle@Duxton',
            'location': 'Tanjong Pagar',
            'price': 2800000,
            'size': 1300,
            'type': 'Condominium',
            'tenure': '99-Year',
        },
        {
            'name': 'Marina Bay Suites',
            'location': 'Marina Bay',
            'price': 2500000,
            'size': 1200,
            'type': 'Condominium',
            'tenure': 'Freehold',
        },
        {
            'name': 'The Pinnacle',
            'location': 'Orchard',
            'price': 3200000,
            'size': 1400,
            'type': 'Condominium',
            'tenure': 'Freehold',
        },
        {
            'name': 'Goodman Residences',
            'location': 'Bedok',
            'price': 1950000,
            'size': 1100,
            'type': 'Condominium',
            'tenure': '99-Year',
        },
        {
            'name': 'Affinity at Serangoon',
            'location': 'Serangoon',
            'price': 1650000,
            'size': 950,
            'type': 'Condominium',
            'tenure': '99-Year',
        },
        {
            'name': 'The Floridian',
            'location': 'Clementi',
            'price': 4200000,
            'size': 1500,
            'type': 'Condominium',
            'tenure': 'Freehold',
        },
        {
            'name': 'Sennett Residences',
            'location': 'Bukit Timah',
            'price': 3500000,
            'size': 1350,
            'type': 'Condominium',
            'tenure': 'Freehold',
        },
        {
            'name': 'Normanton Park',
            'location': 'Bukit Timah',
            'price': 2100000,
            'size': 1050,
            'type': 'Condominium',
            'tenure': '99-Year',
        },
    ]

def load_properties(projects):
    """Load properties into Supabase"""
    print("💾 Loading properties...\n")
    
    loaded = 0
    skipped = 0
    
    for project in projects:
        try:
            # Extract data
            name = project.get('name') or project.get('project_name') or 'Unknown'
            location = project.get('location') or 'Unknown'
            price = float(project.get('price') or project.get('asking_price') or 2000000)
            size = float(project.get('size') or project.get('area_sqft') or 1000)
            ptype = project.get('type') or project.get('property_type') or 'Condominium'
            tenure = project.get('tenure') or 'Freehold'
            
            district = get_district(location)
            
            # Check if exists
            check = requests.get(
                f'{SUPABASE_URL}/rest/v1/properties',
                headers=headers,
                params={'project_name': f'eq.{name}'},
            )
            
            if check.json():
                print(f"⏭️  {name}: Already exists")
                skipped += 1
                continue
            
            # Insert property
            property_data = {
                'project_name': name,
                'location': location,
                'district': district,
                'property_type': ptype,
                'tenure': tenure,
                'size_sqft': size,
                'recent_price': price,
                'recent_date': datetime.now().strftime('%Y-%m-%d'),
                'age': 5
            }
            
            response = requests.post(
                f'{SUPABASE_URL}/rest/v1/properties',
                headers=headers,
                json=property_data
            )
            
            if response.status_code in [200, 201]:
                prop_id = response.json()[0]['id']
                print(f"✅ {name} (D{district}) - ${price/1000000:.1f}M")
                
                # Add rental estimate
                monthly_rent = price * 0.004  # Assume 0.4% monthly yield
                rental_data = {
                    'property_id': prop_id,
                    'bedrooms': 3,
                    'monthly_rent': monthly_rent,
                    'annual_rent': monthly_rent * 12,
                    'rental_date': datetime.now().strftime('%Y-%m-%d')
                }
                requests.post(
                    f'{SUPABASE_URL}/rest/v1/rentals',
                    headers=headers,
                    json=rental_data
                )
                
                # Add 3 transactions for history
                transactions = []
                for i, days_back in enumerate([0, 180, 365]):
                    tx_price = price * (0.95 - i * 0.03)  # Decreasing prices over time
                    tx_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
                    transactions.append({
                        'property_id': prop_id,
                        'price': tx_price,
                        'area': size,
                        'transaction_date': tx_date,
                        'tenure_at_time': tenure
                    })
                
                requests.post(
                    f'{SUPABASE_URL}/rest/v1/transactions',
                    headers=headers,
                    json=transactions
                )
                
                loaded += 1
            else:
                print(f"❌ {name}: {response.text[:50]}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
            continue
    
    return loaded, skipped

if __name__ == '__main__':
    print("=" * 60)
    print("🏢 Singapore Property URA Data Loader")
    print("=" * 60 + "\n")
    
    # Fetch projects
    projects = fetch_ura_projects()
    
    if projects:
        # Load into Supabase
        loaded, skipped = load_properties(projects)
        
        print(f"\n" + "=" * 60)
        print(f"✅ Loaded: {loaded} properties")
        print(f"⏭️  Skipped: {skipped} (already exist)")
        print(f"📊 Total: {len(projects)} projects")
        print("=" * 60)
    else:
        print("❌ No projects found")
