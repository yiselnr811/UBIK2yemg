#!/usr/bin/env python3
"""
Phase-1 Backend Expansion Testing for UBIK2 YEMG
Tests hierarchical categories, expanded stats, new filters, business types, currencies, and subcategories.
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://mipyme-hub.preview.emergentagent.com/api"
ADMIN_EMAIL = "ubik2yemg@gmail.com"
ADMIN_PASSWORD = "Yisel.112729"

# Test state
test_results = []
admin_token = None
test_seller_token = None
test_seller_id = None
test_business_id = None
test_product_id = None
initial_stats = {}

def log_test(test_name, passed, details=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status} | {test_name}"
    if details:
        result += f"\n    Details: {details}"
    test_results.append(result)
    print(result)

def print_json(label, data):
    """Pretty print JSON data"""
    print(f"\n{label}:")
    print(json.dumps(data, indent=2, ensure_ascii=False))

# ============================================================================
# TEST 1: GET /api/categories — hierarchical & expanded shape
# ============================================================================
def test_categories():
    print("\n" + "="*80)
    print("TEST 1: GET /api/categories — hierarchical & expanded shape")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/categories")
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Categories endpoint", False, f"Expected 200, got {response.status_code}")
            return
        
        data = response.json()
        print_json("Response", data)
        
        # Check 3 top-level keys
        if not all(key in data for key in ['categories', 'businessTypes', 'currencies']):
            log_test("Categories - top-level keys", False, f"Missing keys. Got: {list(data.keys())}")
            return
        log_test("Categories - top-level keys", True, "categories, businessTypes, currencies present")
        
        # Check categories array
        categories = data['categories']
        if not isinstance(categories, list) or len(categories) < 19:
            log_test("Categories - array length", False, f"Expected ≥19 categories, got {len(categories)}")
            return
        log_test("Categories - array length", True, f"Found {len(categories)} categories")
        
        # Check category structure
        sample_cat = categories[0]
        required_fields = ['id', 'name', 'icon', 'children']
        if not all(field in sample_cat for field in required_fields):
            log_test("Categories - structure", False, f"Missing fields in category. Got: {list(sample_cat.keys())}")
            return
        log_test("Categories - structure", True, "All categories have id, name, icon, children")
        
        # Check electronica has smartphones child
        electronica = next((c for c in categories if c['id'] == 'electronica'), None)
        if not electronica:
            log_test("Categories - electronica category", False, "electronica category not found")
            return
        
        smartphones = next((child for child in electronica.get('children', []) if child['id'] == 'smartphones'), None)
        if not smartphones:
            log_test("Categories - smartphones subcategory", False, f"smartphones not in electronica.children. Got: {electronica.get('children', [])}")
            return
        log_test("Categories - smartphones subcategory", True, "electronica has smartphones child")
        
        # Check businessTypes
        business_types = data['businessTypes']
        expected_types = ['tienda', 'online', 'servicio', 'restaurante', 'mayorista', 'particular']
        found_types = [bt['id'] for bt in business_types]
        if not all(t in found_types for t in expected_types):
            log_test("Categories - businessTypes", False, f"Missing types. Expected: {expected_types}, Got: {found_types}")
            return
        log_test("Categories - businessTypes", True, f"All 6 business types present: {found_types}")
        
        # Check currencies
        currencies = data['currencies']
        expected_currencies = ['CUP', 'MLC', 'USD', 'EUR', 'GBP', 'CAD', 'MXN', 'USDT', 'USDC']
        found_currencies = [c['id'] for c in currencies]
        if len(currencies) < 9 or not all(c in found_currencies for c in expected_currencies):
            log_test("Categories - currencies", False, f"Expected ≥9 currencies including {expected_currencies}. Got: {found_currencies}")
            return
        log_test("Categories - currencies", True, f"All 9 currencies present: {found_currencies}")
        
    except Exception as e:
        log_test("Categories endpoint", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 2: GET /api/stats — real-time expanded stats
# ============================================================================
def test_stats():
    global initial_stats
    print("\n" + "="*80)
    print("TEST 2: GET /api/stats — real-time expanded stats")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/stats")
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Stats endpoint", False, f"Expected 200, got {response.status_code}")
            return
        
        data = response.json()
        print_json("Response", data)
        initial_stats = data.copy()
        
        # Check 5 numeric fields
        required_fields = ['productsCount', 'businessesCount', 'usersCount', 'servicesCount', 'activeBusinessesCount']
        if not all(field in data for field in required_fields):
            log_test("Stats - required fields", False, f"Missing fields. Got: {list(data.keys())}")
            return
        log_test("Stats - required fields", True, "All 5 fields present")
        
        # Check all are numbers ≥0
        for field in required_fields:
            if not isinstance(data[field], (int, float)) or data[field] < 0:
                log_test(f"Stats - {field} is number ≥0", False, f"Expected number ≥0, got {data[field]}")
                return
        log_test("Stats - all values are numbers ≥0", True, f"productsCount={data['productsCount']}, businessesCount={data['businessesCount']}, usersCount={data['usersCount']}, servicesCount={data['servicesCount']}, activeBusinessesCount={data['activeBusinessesCount']}")
        
        # Check activeBusinessesCount ≤ businessesCount
        if data['activeBusinessesCount'] > data['businessesCount']:
            log_test("Stats - activeBusinessesCount ≤ businessesCount", False, f"activeBusinessesCount ({data['activeBusinessesCount']}) > businessesCount ({data['businessesCount']})")
            return
        log_test("Stats - activeBusinessesCount ≤ businessesCount", True, f"{data['activeBusinessesCount']} ≤ {data['businessesCount']}")
        
    except Exception as e:
        log_test("Stats endpoint", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 3: GET /api/products filters (new)
# ============================================================================
def test_products_filters():
    print("\n" + "="*80)
    print("TEST 3: GET /api/products filters (new)")
    print("="*80)
    
    # Test 3a: ?subcategory=smartphones
    try:
        response = requests.get(f"{BASE_URL}/products?subcategory=smartphones")
        print(f"\n3a. ?subcategory=smartphones - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Products filter - subcategory", False, f"Expected 200, got {response.status_code}")
        else:
            data = response.json()
            print(f"    Total: {data.get('total', 0)}, Products: {len(data.get('products', []))}")
            
            # Check response shape
            if not all(key in data for key in ['products', 'total', 'page', 'limit', 'hasMore']):
                log_test("Products filter - subcategory response shape", False, f"Missing keys. Got: {list(data.keys())}")
            else:
                log_test("Products filter - subcategory response shape", True, "Response has products, total, page, limit, hasMore")
                
                # If there are results, verify subcategory
                if data['total'] > 0:
                    products = data['products']
                    # Check first few products
                    sample = products[:3]
                    all_match = all(p.get('subcategory') == 'smartphones' for p in sample)
                    if all_match:
                        log_test("Products filter - subcategory=smartphones", True, f"Found {data['total']} products, all have subcategory='smartphones'")
                    else:
                        log_test("Products filter - subcategory=smartphones", False, f"Some products don't have subcategory='smartphones'. Sample: {[p.get('subcategory') for p in sample]}")
                else:
                    log_test("Products filter - subcategory=smartphones", True, "No products with subcategory='smartphones' (acceptable)")
    except Exception as e:
        log_test("Products filter - subcategory", False, f"Exception: {str(e)}")
    
    # Test 3b: ?businessType=tienda (should have results after backfill)
    try:
        response = requests.get(f"{BASE_URL}/products?businessType=tienda")
        print(f"\n3b. ?businessType=tienda - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Products filter - businessType=tienda", False, f"Expected 200, got {response.status_code}")
        else:
            data = response.json()
            print(f"    Total: {data.get('total', 0)}, Products: {len(data.get('products', []))}")
            
            if data['total'] == 0:
                log_test("Products filter - businessType=tienda", False, "Expected total > 0 after backfill, got 0")
            else:
                # Verify business.businessType === 'tienda'
                products = data['products'][:5]  # Check first 5
                all_tienda = all(p.get('business', {}).get('businessType') == 'tienda' for p in products)
                if all_tienda:
                    log_test("Products filter - businessType=tienda", True, f"Found {data['total']} products, all have business.businessType='tienda'")
                else:
                    types = [p.get('business', {}).get('businessType') for p in products]
                    log_test("Products filter - businessType=tienda", False, f"Some products don't have business.businessType='tienda'. Got: {types}")
    except Exception as e:
        log_test("Products filter - businessType=tienda", False, f"Exception: {str(e)}")
    
    # Test 3c: ?businessType=restaurante (may be 0 or have results)
    try:
        response = requests.get(f"{BASE_URL}/products?businessType=restaurante")
        print(f"\n3c. ?businessType=restaurante - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Products filter - businessType=restaurante", False, f"Expected 200, got {response.status_code}")
        else:
            data = response.json()
            print(f"    Total: {data.get('total', 0)}, Products: {len(data.get('products', []))}")
            
            if data['total'] == 0:
                log_test("Products filter - businessType=restaurante", True, "No restaurante products (acceptable)")
            else:
                # Verify all have business.businessType === 'restaurante'
                products = data['products'][:5]
                all_restaurante = all(p.get('business', {}).get('businessType') == 'restaurante' for p in products)
                if all_restaurante:
                    log_test("Products filter - businessType=restaurante", True, f"Found {data['total']} products, all have business.businessType='restaurante'")
                else:
                    types = [p.get('business', {}).get('businessType') for p in products]
                    log_test("Products filter - businessType=restaurante", False, f"Some products don't have business.businessType='restaurante'. Got: {types}")
    except Exception as e:
        log_test("Products filter - businessType=restaurante", False, f"Exception: {str(e)}")
    
    # Test 3d: ?country=Cuba (should have results after backfill)
    try:
        response = requests.get(f"{BASE_URL}/products?country=Cuba")
        print(f"\n3d. ?country=Cuba - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Products filter - country=Cuba", False, f"Expected 200, got {response.status_code}")
        else:
            data = response.json()
            print(f"    Total: {data.get('total', 0)}, Products: {len(data.get('products', []))}")
            
            if data['total'] == 0:
                log_test("Products filter - country=Cuba", False, "Expected total > 0 after backfill, got 0")
            else:
                # Verify business.country includes 'Cuba'
                products = data['products'][:5]
                all_cuba = all('Cuba' in (p.get('business', {}).get('country', '') or '') for p in products)
                if all_cuba:
                    log_test("Products filter - country=Cuba", True, f"Found {data['total']} products, all have business.country including 'Cuba'")
                else:
                    countries = [p.get('business', {}).get('country') for p in products]
                    log_test("Products filter - country=Cuba", False, f"Some products don't have business.country='Cuba'. Got: {countries}")
    except Exception as e:
        log_test("Products filter - country=Cuba", False, f"Exception: {str(e)}")
    
    # Test 3e: ?currency=CUP
    try:
        response = requests.get(f"{BASE_URL}/products?currency=CUP")
        print(f"\n3e. ?currency=CUP - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Products filter - currency=CUP", False, f"Expected 200, got {response.status_code}")
        else:
            data = response.json()
            print(f"    Total: {data.get('total', 0)}, Products: {len(data.get('products', []))}")
            
            if data['total'] > 0:
                products = data['products'][:5]
                all_cup = all(p.get('currency') == 'CUP' for p in products)
                if all_cup:
                    log_test("Products filter - currency=CUP", True, f"Found {data['total']} products, all have currency='CUP'")
                else:
                    currencies = [p.get('currency') for p in products]
                    log_test("Products filter - currency=CUP", False, f"Some products don't have currency='CUP'. Got: {currencies}")
            else:
                log_test("Products filter - currency=CUP", True, "No CUP products (acceptable)")
    except Exception as e:
        log_test("Products filter - currency=CUP", False, f"Exception: {str(e)}")
    
    # Test 3f: Combined filters ?businessType=tienda&country=Cuba
    try:
        response = requests.get(f"{BASE_URL}/products?businessType=tienda&country=Cuba")
        print(f"\n3f. ?businessType=tienda&country=Cuba - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Products filter - combined businessType+country", False, f"Expected 200, got {response.status_code}")
        else:
            data = response.json()
            print(f"    Total: {data.get('total', 0)}, Products: {len(data.get('products', []))}")
            
            if data['total'] > 0:
                products = data['products'][:3]
                all_match = all(
                    p.get('business', {}).get('businessType') == 'tienda' and 
                    'Cuba' in (p.get('business', {}).get('country', '') or '')
                    for p in products
                )
                if all_match:
                    log_test("Products filter - combined businessType+country", True, f"Found {data['total']} products matching both filters")
                else:
                    log_test("Products filter - combined businessType+country", False, "Some products don't match both filters")
            else:
                log_test("Products filter - combined businessType+country", True, "No matching products (acceptable)")
    except Exception as e:
        log_test("Products filter - combined businessType+country", False, f"Exception: {str(e)}")
    
    # Test 3g: Edge case - invalid businessType
    try:
        response = requests.get(f"{BASE_URL}/products?businessType=___invalid_value___")
        print(f"\n3g. ?businessType=___invalid_value___ - Status: {response.status_code}")
        
        if response.status_code == 500:
            log_test("Products filter - invalid businessType", False, "Got 500 error, should return 200 with total:0")
        elif response.status_code == 200:
            data = response.json()
            print(f"    Total: {data.get('total', 0)}")
            if data.get('total') == 0:
                log_test("Products filter - invalid businessType", True, "Returns 200 with total:0 (clean handling)")
            else:
                log_test("Products filter - invalid businessType", False, f"Expected total:0, got {data.get('total')}")
        else:
            log_test("Products filter - invalid businessType", False, f"Unexpected status: {response.status_code}")
    except Exception as e:
        log_test("Products filter - invalid businessType", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 4: Business mutations with new fields
# ============================================================================
def test_business_mutations():
    global test_seller_token, test_seller_id, test_business_id
    print("\n" + "="*80)
    print("TEST 4: Business mutations with new fields")
    print("="*80)
    
    # Test 4a: Register new seller with businessType='servicio' and country='México'
    try:
        timestamp = int(time.time())
        test_email = f"phase1_test_{timestamp}@test.com"
        
        payload = {
            "email": test_email,
            "password": "Test1234",
            "accountType": "seller",
            "businessName": "Phase1 Servicios SRL",
            "whatsapp": "+5355001122",
            "businessType": "servicio",
            "country": "México",
            "location": "CDMX, México"
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        print(f"\n4a. Register seller - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Business mutation - register with new fields", False, f"Expected 200, got {response.status_code}. Response: {response.text}")
        else:
            data = response.json()
            print_json("Response", data)
            
            test_seller_token = data.get('token')
            test_seller_id = data.get('user', {}).get('id')
            test_business_id = data.get('business', {}).get('id')
            
            business = data.get('business', {})
            if business.get('businessType') != 'servicio':
                log_test("Business mutation - register businessType", False, f"Expected 'servicio', got '{business.get('businessType')}'")
            elif business.get('country') != 'México':
                log_test("Business mutation - register country", False, f"Expected 'México', got '{business.get('country')}'")
            else:
                log_test("Business mutation - register with new fields", True, f"Created seller with businessType='servicio' and country='México'")
    except Exception as e:
        log_test("Business mutation - register with new fields", False, f"Exception: {str(e)}")
        return
    
    # Test 4b: Update business with PUT /api/businesses/<id>
    if not test_seller_token or not test_business_id:
        log_test("Business mutation - update business", False, "No seller token or business ID from registration")
        return
    
    try:
        payload = {
            "businessType": "restaurante",
            "country": "Perú"
        }
        
        headers = {"Authorization": f"Bearer {test_seller_token}"}
        response = requests.put(f"{BASE_URL}/businesses/{test_business_id}", json=payload, headers=headers)
        print(f"\n4b. Update business - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Business mutation - update business", False, f"Expected 200, got {response.status_code}. Response: {response.text}")
        else:
            data = response.json()
            print_json("Response", data)
            
            business = data.get('business', {})
            if business.get('businessType') != 'restaurante':
                log_test("Business mutation - update businessType", False, f"Expected 'restaurante', got '{business.get('businessType')}'")
            elif business.get('country') != 'Perú':
                log_test("Business mutation - update country", False, f"Expected 'Perú', got '{business.get('country')}'")
            else:
                log_test("Business mutation - update business", True, "Updated business with businessType='restaurante' and country='Perú'")
    except Exception as e:
        log_test("Business mutation - update business", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 5: Product mutations with subcategory + new currencies
# ============================================================================
def test_product_mutations():
    global test_product_id
    print("\n" + "="*80)
    print("TEST 5: Product mutations with subcategory + new currencies")
    print("="*80)
    
    if not test_seller_token:
        log_test("Product mutation - create product", False, "No seller token from registration")
        return
    
    # Test 5a: Create product with currency='EUR' and subcategory='smartphones'
    try:
        payload = {
            "name": "Test Phone EUR",
            "price": 499.99,
            "currency": "EUR",
            "category": "electronica",
            "subcategory": "smartphones",
            "stock": 3,
            "description": "Test product for Phase 1"
        }
        
        headers = {"Authorization": f"Bearer {test_seller_token}"}
        response = requests.post(f"{BASE_URL}/products", json=payload, headers=headers)
        print(f"\n5a. Create product - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Product mutation - create with new fields", False, f"Expected 200, got {response.status_code}. Response: {response.text}")
        else:
            data = response.json()
            print_json("Response", data)
            
            product = data.get('product', {})
            test_product_id = product.get('id')
            
            if product.get('currency') != 'EUR':
                log_test("Product mutation - create currency", False, f"Expected 'EUR', got '{product.get('currency')}'")
            elif product.get('subcategory') != 'smartphones':
                log_test("Product mutation - create subcategory", False, f"Expected 'smartphones', got '{product.get('subcategory')}'")
            else:
                log_test("Product mutation - create with new fields", True, "Created product with currency='EUR' and subcategory='smartphones'")
    except Exception as e:
        log_test("Product mutation - create with new fields", False, f"Exception: {str(e)}")
        return
    
    # Test 5b: Update product with PUT /api/products/<id>
    if not test_product_id:
        log_test("Product mutation - update product", False, "No product ID from creation")
        return
    
    try:
        payload = {
            "currency": "USDT",
            "subcategory": "audio"
        }
        
        headers = {"Authorization": f"Bearer {test_seller_token}"}
        response = requests.put(f"{BASE_URL}/products/{test_product_id}", json=payload, headers=headers)
        print(f"\n5b. Update product - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Product mutation - update product", False, f"Expected 200, got {response.status_code}. Response: {response.text}")
        else:
            data = response.json()
            print_json("Response", data)
            
            product = data.get('product', {})
            if product.get('currency') != 'USDT':
                log_test("Product mutation - update currency", False, f"Expected 'USDT', got '{product.get('currency')}'")
            elif product.get('subcategory') != 'audio':
                log_test("Product mutation - update subcategory", False, f"Expected 'audio', got '{product.get('subcategory')}'")
            else:
                log_test("Product mutation - update product", True, "Updated product with currency='USDT' and subcategory='audio'")
    except Exception as e:
        log_test("Product mutation - update product", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 6: Backward compatibility
# ============================================================================
def test_backward_compatibility():
    print("\n" + "="*80)
    print("TEST 6: Backward compatibility")
    print("="*80)
    
    # Test 6a: GET existing product without subcategory
    try:
        response = requests.get(f"{BASE_URL}/products?limit=1")
        print(f"\n6a. Get products without filters - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Backward compatibility - get products", False, f"Expected 200, got {response.status_code}")
        else:
            data = response.json()
            products = data.get('products', [])
            
            if len(products) == 0:
                log_test("Backward compatibility - get products", True, "No products found (acceptable)")
            else:
                product = products[0]
                # Product without subcategory should not error
                # subcategory can be missing or empty string
                subcategory = product.get('subcategory', '')
                log_test("Backward compatibility - product without subcategory", True, f"Product retrieved successfully. subcategory='{subcategory}' (acceptable)")
    except Exception as e:
        log_test("Backward compatibility - get products", False, f"Exception: {str(e)}")
    
    # Test 6b: GET /api/products without new filters (legacy behavior)
    try:
        response = requests.get(f"{BASE_URL}/products")
        print(f"\n6b. Get products (legacy) - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Backward compatibility - legacy products list", False, f"Expected 200, got {response.status_code}")
        else:
            data = response.json()
            print(f"    Total: {data.get('total', 0)}, Products: {len(data.get('products', []))}")
            
            # Should return default 20 products per page
            products = data.get('products', [])
            if len(products) > 20:
                log_test("Backward compatibility - legacy products list", False, f"Expected ≤20 products per page, got {len(products)}")
            else:
                log_test("Backward compatibility - legacy products list", True, f"Returns {len(products)} products (≤20 per page, legacy behavior intact)")
    except Exception as e:
        log_test("Backward compatibility - legacy products list", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 7: Stats refresh after mutations
# ============================================================================
def test_stats_refresh():
    print("\n" + "="*80)
    print("TEST 7: Stats refresh after mutations")
    print("="*80)
    
    if not initial_stats:
        log_test("Stats refresh", False, "No initial stats captured")
        return
    
    # Wait 16 seconds for cache to expire (stats cached for 15s)
    print("\nWaiting 16 seconds for stats cache to expire...")
    time.sleep(16)
    
    try:
        response = requests.get(f"{BASE_URL}/stats")
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Stats refresh", False, f"Expected 200, got {response.status_code}")
            return
        
        new_stats = response.json()
        print_json("New stats", new_stats)
        print_json("Initial stats", initial_stats)
        
        # Check increments
        users_increment = new_stats['usersCount'] - initial_stats['usersCount']
        businesses_increment = new_stats['businessesCount'] - initial_stats['businessesCount']
        products_increment = new_stats['productsCount'] - initial_stats['productsCount']
        
        print(f"\nIncrements:")
        print(f"  Users: +{users_increment} (expected +1)")
        print(f"  Businesses: +{businesses_increment} (expected +1)")
        print(f"  Products: +{products_increment} (expected +1)")
        
        if users_increment != 1:
            log_test("Stats refresh - usersCount", False, f"Expected +1, got +{users_increment}")
        else:
            log_test("Stats refresh - usersCount", True, "usersCount incremented by 1")
        
        if businesses_increment != 1:
            log_test("Stats refresh - businessesCount", False, f"Expected +1, got +{businesses_increment}")
        else:
            log_test("Stats refresh - businessesCount", True, "businessesCount incremented by 1")
        
        if products_increment != 1:
            log_test("Stats refresh - productsCount", False, f"Expected +1, got +{products_increment}")
        else:
            log_test("Stats refresh - productsCount", True, "productsCount incremented by 1")
        
    except Exception as e:
        log_test("Stats refresh", False, f"Exception: {str(e)}")

# ============================================================================
# TEST 8: Cleanup
# ============================================================================
def test_cleanup():
    global admin_token
    print("\n" + "="*80)
    print("TEST 8: Cleanup")
    print("="*80)
    
    # Login as admin
    try:
        payload = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=payload)
        print(f"\nAdmin login - Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Cleanup - admin login", False, f"Expected 200, got {response.status_code}")
            return
        
        data = response.json()
        admin_token = data.get('token')
        log_test("Cleanup - admin login", True, "Admin logged in successfully")
    except Exception as e:
        log_test("Cleanup - admin login", False, f"Exception: {str(e)}")
        return
    
    # Delete test user
    if not admin_token or not test_seller_id:
        log_test("Cleanup - delete test user", False, "No admin token or test seller ID")
        return
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.delete(f"{BASE_URL}/admin/users/{test_seller_id}", headers=headers)
        print(f"\nDelete test user - Status: {response.status_code}")
        
        if response.status_code == 200:
            log_test("Cleanup - delete test user", True, "Test user deleted successfully")
        else:
            log_test("Cleanup - delete test user", False, f"Expected 200, got {response.status_code}. Response: {response.text}")
    except Exception as e:
        log_test("Cleanup - delete test user", False, f"Exception: {str(e)}")

# ============================================================================
# MAIN
# ============================================================================
def main():
    print("\n" + "="*80)
    print("PHASE-1 BACKEND EXPANSION TESTING FOR UBIK2 YEMG")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin: {ADMIN_EMAIL}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run all tests
    test_categories()
    test_stats()
    test_products_filters()
    test_business_mutations()
    test_product_mutations()
    test_backward_compatibility()
    test_stats_refresh()
    test_cleanup()
    
    # Print summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    for result in test_results:
        print(result)
    
    # Count results
    passed = sum(1 for r in test_results if "✅ PASS" in r)
    failed = sum(1 for r in test_results if "❌ FAIL" in r)
    total = len(test_results)
    
    print("\n" + "="*80)
    print(f"TOTAL: {passed}/{total} PASSED, {failed}/{total} FAILED")
    print("="*80)
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
