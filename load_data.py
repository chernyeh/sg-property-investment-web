import csv
import json
from datetime import datetime
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv('/Users/chernyeh/Documents/sg-property-investment-web/.env.local')
# Supabase setup
SUPABASE_URL = 'https://shsoigspjfkdygqpptri.supabase.co'
SUPABASE_KEY = sb_publishable_i9n3VmrUY8v2EfCOOXAg0w_MhB6l21u
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Location to district mapping
LOCATION_TO_DISTRICT = {
    'Marina Bay': 4,
    'Bukit Merah': 4,
    'Kallang': 3,
    'Geylang': 14,
    'Bedok': 15,
    'East Coast': 15,
    'Changi': 17,
    'Pasir Ris': 17,
    'Tampines': 16,
    'Jurong East': 5,
    'Jurong West': 5,
    'Boon Lay': 5,
    'Clementi': 5,
    'Choa Chu Kang': 25,
    'Bukit Batok': 25,
    'Bukit Panjang': 25,
    'Woodlands': 27,
    'Yishun': 26,
    'Sembawang': 27,
    'Sengkang': 26,
    'Punggol': 19,
    'Hougang': 19,
    'Serangoon': 19,
    'Ang Mo Kio': 20,
    'Toa Payoh': 12,
    'Novena': 11,
    'Newton': 11,
    'Orchard': 9,
    'Somerset': 9,
    'Dhoby Ghaut': 9,
    'City Hall': 1,
    'Raffles Place': 1,
    'Tanjong Pagar': 2,
    'Outram': 2,
    'Tiong Bahru': 3,
    'Holland Village': 10,
    'Bukit Timah': 10,
    'Tanglin': 10,
}

def get_district(location):
    """Map location to district number"""
    for loc_key, district in LOCATION_TO_DISTRICT.items():
        if loc_key.lower() in location.lower():
            return district
    return 9  # Default to central if not found

def load_csv_data(filepath):
    """Load data from CSV into Supabase"""
    try:
        with open(filepath, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # Parse the data
                    project_name = row['project']
                    location = row['location']
                    asking_price = float(row['asking_price'])
                    area_sqft = float(row['area_sqft'])
                    property_type = row['property_type']
                    tenure = row['tenure']
                    monthly_rent = float(row['monthly_rent']) if row['monthly_rent'] else None
                    date_recorded = row['date_recorded']
                    
                    district = get_district(location)
                    
                    # Check if property already exists
                    existing = supabase.table('properties').select('*').eq('project_name', project_name).execute()
                    
                    if not existing.data:
                        # Insert new property
                        property_data = {
                            'project_name': project_name,
                            'location': location,
                            'district': district,
                            'property_type': property_type,
                            'tenure': tenure,
                            'size_sqft': area_sqft,
                            'recent_price': asking_price,
                            'recent_date': date_recorded[:10],  # Extract date only
                            'age': 5  # Default age
                        }
                        
                        result = supabase.table('properties').insert(property_data).execute()
                        property_id = result.data[0]['id'] if result.data else None
                        
                        print(f"✅ Inserted: {project_name} (D{district})")
                        
                        # Insert rental data if available
                        if monthly_rent and property_id:
                            rental_data = {
                                'property_id': property_id,
                                'bedrooms': 3,  # Default
                                'monthly_rent': monthly_rent,
                                'annual_rent': monthly_rent * 12,
                                'rental_date': date_recorded[:10]
                            }
                            supabase.table('rentals').insert(rental_data).execute()
                            print(f"   ├─ Rental: ${monthly_rent}/month")
                    else:
                        print(f"⏭️  Skipped: {project_name} (already exists)")
                        
                except Exception as e:
                    print(f"❌ Error processing row: {e}")
                    continue
        
        print("\n✅ CSV data loaded successfully!")
        
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")

def load_sample_transactions():
    """Add sample transaction history for testing"""
    try:
        # Get all properties
        properties = supabase.table('properties').select('id, project_name, recent_price, recent_date').execute()
        
        for prop in properties.data:
            # Add 3 historical transactions (simulated)
            import datetime as dt
            base_price = prop['recent_price']
            
            transactions = [
                {
                    'property_id': prop['id'],
                    'price': base_price * 0.95,  # 5% lower
                    'area': 1000,
                    'transaction_date': (dt.datetime.now() - dt.timedelta(days=180)).strftime('%Y-%m-%d'),
                    'tenure_at_time': 'Freehold'
                },
                {
                    'property_id': prop['id'],
                    'price': base_price * 0.92,  # 8% lower
                    'area': 1000,
                    'transaction_date': (dt.datetime.now() - dt.timedelta(days=365)).strftime('%Y-%m-%d'),
                    'tenure_at_time': 'Freehold'
                },
                {
                    'property_id': prop['id'],
                    'price': base_price * 0.88,  # 12% lower
                    'area': 1000,
                    'transaction_date': (dt.datetime.now() - dt.timedelta(days=730)).strftime('%Y-%m-%d'),
                    'tenure_at_time': 'Freehold'
                }
            ]
            
            # Check if transactions already exist
            existing = supabase.table('transactions').select('*').eq('property_id', prop['id']).execute()
            if not existing.data:
                supabase.table('transactions').insert(transactions).execute()
                print(f"✅ Added 3 transactions for {prop['project_name']}")
        
    except Exception as e:
        print(f"❌ Error adding transactions: {e}")

if __name__ == '__main__':
    print("🚀 Loading Singapore property data...\n")
    
    # Load CSV data
    load_csv_data('/Users/chernyeh/Documents/singapore-property-app/listings.csv')
    
    # Add sample transactions for charting
    load_sample_transactions()
    
    print("\n✅ Data loading complete!")
