#!/usr/bin/env python3
"""
Backend API Test Suite for UBIK2 YEMG Marketplace
Tests all backend endpoints according to the review request
"""
import requests
import json
import uuid
from pymongo import MongoClient

# Configuration
BASE_URL = "https://mipyme-hub.preview.emergentagent.com/api"
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "ubik2_yemg"

# Test data storage
test_data = {
    'token': None,
    'user': None,
    'business': None,
    'product_id': None,
    'second_user_token': None,
    'second_user_business_id': None,
}

def print_test(name):
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)

def print_result(success, message):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    return success

def test_health():
    """Test 1: Health & basics - GET /api/"""
    print_test("Health endpoint")
    try:
        # Test both /api and /api/ (empty path)
        r = requests.get(f"{BASE_URL}/", timeout=10)
        data = r.json()
        
        if r.status_code == 200 and data.get('ok') == True and 'UBIK2 YEMG API' in data.get('app', ''):
            return print_result(True, f"Health check passed: {data}")
        else:
            return print_result(False, f"Unexpected response: {r.status_code} - {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_categories():
    """Test 1: Categories - GET /api/categories"""
    print_test("Categories endpoint")
    try:
        r = requests.get(f"{BASE_URL}/categories", timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            categories = data.get('categories', [])
            if len(categories) == 8:
                # Check structure
                first = categories[0]
                if 'id' in first and 'name' in first and 'icon' in first:
                    return print_result(True, f"Got 8 categories with correct structure")
                else:
                    return print_result(False, f"Categories missing required fields: {first}")
            else:
                return print_result(False, f"Expected 8 categories, got {len(categories)}")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_stats():
    """Test 1: Stats - GET /api/stats"""
    print_test("Stats endpoint")
    try:
        r = requests.get(f"{BASE_URL}/stats", timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            required = ['productsCount', 'businessesCount', 'usersCount']
            if all(k in data for k in required):
                if all(isinstance(data[k], int) for k in required):
                    return print_result(True, f"Stats: {data}")
                else:
                    return print_result(False, f"Stats values not all integers: {data}")
            else:
                return print_result(False, f"Missing required fields: {data}")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_seed():
    """Test 2: Seed - POST /api/seed (idempotent)"""
    print_test("Seed endpoint (idempotent)")
    try:
        r = requests.post(f"{BASE_URL}/seed", timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            message = data.get('message', '')
            # Should return "Ya hay datos cargados" since seed data already exists
            if 'Ya hay datos cargados' in message or 'count' in data:
                return print_result(True, f"Seed is idempotent: {message}")
            elif 'Datos cargados' in message:
                return print_result(True, f"Seed loaded data: {data}")
            else:
                return print_result(False, f"Unexpected message: {data}")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_auth_register():
    """Test 3: Auth register - POST /api/auth/register"""
    print_test("Auth register with unique email")
    try:
        unique_email = f"test-{uuid.uuid4()}@example.com"
        payload = {
            "email": unique_email,
            "password": "SecurePass123!",
            "businessName": "Test Business",
            "whatsapp": "+5355555000",
            "location": "La Habana, Cuba",
            "description": "Test business description"
        }
        
        r = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            if 'token' in data and 'user' in data and 'business' in data:
                test_data['token'] = data['token']
                test_data['user'] = data['user']
                test_data['business'] = data['business']
                return print_result(True, f"Registration successful, got token and user data")
            else:
                return print_result(False, f"Missing required fields in response: {data.keys()}")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_auth_register_duplicate():
    """Test 3: Auth register duplicate - should fail"""
    print_test("Auth register with duplicate email")
    try:
        if not test_data['user']:
            return print_result(False, "No user from previous test")
        
        payload = {
            "email": test_data['user']['email'],
            "password": "AnotherPass123!",
            "businessName": "Another Business",
            "whatsapp": "+5355555001",
            "location": "La Habana, Cuba"
        }
        
        r = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        data = r.json()
        
        if r.status_code == 400:
            error = data.get('error', '')
            if 'ya está registrado' in error.lower():
                return print_result(True, f"Correctly rejected duplicate: {error}")
            else:
                return print_result(False, f"Wrong error message: {error}")
        else:
            return print_result(False, f"Expected 400, got {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_auth_login():
    """Test 3: Auth login - POST /api/auth/login"""
    print_test("Auth login with correct credentials")
    try:
        if not test_data['user']:
            return print_result(False, "No user from previous test")
        
        payload = {
            "email": test_data['user']['email'],
            "password": "SecurePass123!"
        }
        
        r = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            if 'token' in data:
                return print_result(True, f"Login successful, got token")
            else:
                return print_result(False, f"Missing token in response")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_auth_login_wrong_password():
    """Test 3: Auth login with wrong password - should fail"""
    print_test("Auth login with wrong password")
    try:
        if not test_data['user']:
            return print_result(False, "No user from previous test")
        
        payload = {
            "email": test_data['user']['email'],
            "password": "WrongPassword123!"
        }
        
        r = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        data = r.json()
        
        if r.status_code == 401:
            return print_result(True, f"Correctly rejected wrong password: {data.get('error')}")
        else:
            return print_result(False, f"Expected 401, got {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_auth_me():
    """Test 3: Auth me - GET /api/auth/me with token"""
    print_test("Auth me with Bearer token")
    try:
        if not test_data['token']:
            return print_result(False, "No token from previous test")
        
        headers = {"Authorization": f"Bearer {test_data['token']}"}
        r = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            if 'user' in data and 'business' in data:
                return print_result(True, f"Got user and business data")
            else:
                return print_result(False, f"Missing user or business in response")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_auth_me_no_token():
    """Test 3: Auth me without token - should fail"""
    print_test("Auth me without token")
    try:
        r = requests.get(f"{BASE_URL}/auth/me", timeout=10)
        data = r.json()
        
        if r.status_code == 401:
            return print_result(True, f"Correctly rejected no token: {data.get('error')}")
        else:
            return print_result(False, f"Expected 401, got {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_products_list():
    """Test 4: Products listing - GET /api/products"""
    print_test("Products listing with business attached")
    try:
        r = requests.get(f"{BASE_URL}/products", timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            products = data.get('products', [])
            if len(products) > 0:
                first = products[0]
                if 'business' in first and first['business'] is not None:
                    return print_result(True, f"Got {len(products)} products with business attached")
                else:
                    return print_result(False, f"Product missing business object: {first.keys()}")
            else:
                return print_result(False, f"No products returned")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_products_search():
    """Test 4: Products search - GET /api/products?q=mojito"""
    print_test("Products search for 'mojito'")
    try:
        r = requests.get(f"{BASE_URL}/products?q=mojito", timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            products = data.get('products', [])
            # Check if any product contains "Mojito"
            mojito_found = any('mojito' in p.get('name', '').lower() for p in products)
            if mojito_found:
                return print_result(True, f"Found Mojito in search results")
            else:
                return print_result(False, f"Mojito not found in {len(products)} results")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_products_category():
    """Test 4: Products by category - GET /api/products?category=comida"""
    print_test("Products filtered by category 'comida'")
    try:
        r = requests.get(f"{BASE_URL}/products?category=comida", timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            products = data.get('products', [])
            if len(products) > 0:
                all_comida = all(p.get('category') == 'comida' for p in products)
                if all_comida:
                    return print_result(True, f"All {len(products)} products are category 'comida'")
                else:
                    return print_result(False, f"Some products not in 'comida' category")
            else:
                return print_result(False, f"No products in 'comida' category")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_products_featured():
    """Test 4: Featured products - GET /api/products?featured=true"""
    print_test("Products filtered by featured=true")
    try:
        r = requests.get(f"{BASE_URL}/products?featured=true", timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            products = data.get('products', [])
            if len(products) > 0:
                all_featured = all(p.get('featured') == True for p in products)
                if all_featured:
                    return print_result(True, f"All {len(products)} products are featured")
                else:
                    return print_result(False, f"Some products not featured")
            else:
                return print_result(False, f"No featured products found")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_product_detail():
    """Test 5: Product detail - GET /api/products/:id"""
    print_test("Product detail by ID")
    try:
        # First get a product ID
        r = requests.get(f"{BASE_URL}/products", timeout=10)
        products = r.json().get('products', [])
        if not products:
            return print_result(False, "No products to test with")
        
        product_id = products[0]['id']
        r = requests.get(f"{BASE_URL}/products/{product_id}", timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            product = data.get('product', {})
            if 'business' in product and product['business'] is not None:
                return print_result(True, f"Got product detail with business attached")
            else:
                return print_result(False, f"Product missing business object")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_product_detail_invalid():
    """Test 5: Product detail with invalid ID - should 404"""
    print_test("Product detail with invalid ID")
    try:
        r = requests.get(f"{BASE_URL}/products/invalid-id-12345", timeout=10)
        data = r.json()
        
        if r.status_code == 404:
            return print_result(True, f"Correctly returned 404 for invalid ID")
        else:
            return print_result(False, f"Expected 404, got {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_product_create_no_auth():
    """Test 6: Create product without auth - should fail"""
    print_test("Create product without auth")
    try:
        payload = {
            "name": "Test Product",
            "price": 10,
            "category": "comida",
            "description": "Test description",
            "stock": 5
        }
        
        r = requests.post(f"{BASE_URL}/products", json=payload, timeout=10)
        data = r.json()
        
        if r.status_code == 401:
            return print_result(True, f"Correctly rejected no auth: {data.get('error')}")
        else:
            return print_result(False, f"Expected 401, got {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_product_create():
    """Test 6: Create product with auth"""
    print_test("Create product with auth")
    try:
        if not test_data['token']:
            return print_result(False, "No token from previous test")
        
        headers = {"Authorization": f"Bearer {test_data['token']}"}
        payload = {
            "name": "Test Product Created",
            "price": 15.50,
            "category": "comida",
            "description": "Test product description",
            "stock": 10,
            "image": "https://example.com/image.jpg"
        }
        
        r = requests.post(f"{BASE_URL}/products", json=payload, headers=headers, timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            product = data.get('product', {})
            if 'id' in product and 'businessId' in product:
                test_data['product_id'] = product['id']
                return print_result(True, f"Product created with ID: {product['id']}")
            else:
                return print_result(False, f"Missing id or businessId in response")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_product_update():
    """Test 6: Update product"""
    print_test("Update product price")
    try:
        if not test_data['token'] or not test_data['product_id']:
            return print_result(False, "No token or product_id from previous test")
        
        headers = {"Authorization": f"Bearer {test_data['token']}"}
        payload = {"price": 20.00}
        
        r = requests.put(f"{BASE_URL}/products/{test_data['product_id']}", 
                        json=payload, headers=headers, timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            product = data.get('product', {})
            if product.get('price') == 20.00:
                return print_result(True, f"Product price updated to 20.00")
            else:
                return print_result(False, f"Price not updated correctly: {product.get('price')}")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_product_update_not_owner():
    """Test 6: Update product not owned - should fail"""
    print_test("Update product not owned by user")
    try:
        # First create a second user
        unique_email = f"test2-{uuid.uuid4()}@example.com"
        payload = {
            "email": unique_email,
            "password": "SecurePass123!",
            "businessName": "Second Test Business",
            "whatsapp": "+5355555001",
            "location": "La Habana, Cuba"
        }
        
        r = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        second_user_data = r.json()
        
        if r.status_code != 200:
            return print_result(False, f"Failed to create second user: {second_user_data}")
        
        second_token = second_user_data['token']
        
        # Try to update first user's product with second user's token
        headers = {"Authorization": f"Bearer {second_token}"}
        payload = {"price": 99.99}
        
        r = requests.put(f"{BASE_URL}/products/{test_data['product_id']}", 
                        json=payload, headers=headers, timeout=10)
        data = r.json()
        
        if r.status_code == 403:
            test_data['second_user_token'] = second_token
            test_data['second_user_business_id'] = second_user_data['business']['id']
            return print_result(True, f"Correctly rejected unauthorized update: {data.get('error')}")
        else:
            return print_result(False, f"Expected 403, got {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_product_delete():
    """Test 6: Delete product"""
    print_test("Delete product")
    try:
        if not test_data['token'] or not test_data['product_id']:
            return print_result(False, "No token or product_id from previous test")
        
        headers = {"Authorization": f"Bearer {test_data['token']}"}
        
        r = requests.delete(f"{BASE_URL}/products/{test_data['product_id']}", 
                           headers=headers, timeout=10)
        data = r.json()
        
        if r.status_code == 200 and data.get('ok') == True:
            return print_result(True, f"Product deleted successfully")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_plan_limit():
    """Test 7: Plan limit - create 10 products with basico plan"""
    print_test("Plan limit - create 10 products (basico plan)")
    try:
        # Create a fresh user
        unique_email = f"test-limit-{uuid.uuid4()}@example.com"
        payload = {
            "email": unique_email,
            "password": "SecurePass123!",
            "businessName": "Limit Test Business",
            "whatsapp": "+5355555002",
            "location": "La Habana, Cuba"
        }
        
        r = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        limit_user_data = r.json()
        
        if r.status_code != 200:
            return print_result(False, f"Failed to create limit test user: {limit_user_data}")
        
        limit_token = limit_user_data['token']
        headers = {"Authorization": f"Bearer {limit_token}"}
        
        # Create 10 products
        created_count = 0
        for i in range(10):
            product_payload = {
                "name": f"Limit Test Product {i+1}",
                "price": 10 + i,
                "category": "comida",
                "description": f"Test product {i+1}",
                "stock": 5
            }
            r = requests.post(f"{BASE_URL}/products", json=product_payload, headers=headers, timeout=10)
            if r.status_code == 200:
                created_count += 1
        
        if created_count == 10:
            return print_result(True, f"Successfully created 10 products with basico plan")
        else:
            return print_result(False, f"Only created {created_count} products, expected 10")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_plan_limit_11th():
    """Test 7: Plan limit - 11th product should fail"""
    print_test("Plan limit - 11th product should fail (basico plan)")
    try:
        # Use the same user from previous test
        # Create another fresh user for this test
        unique_email = f"test-limit2-{uuid.uuid4()}@example.com"
        payload = {
            "email": unique_email,
            "password": "SecurePass123!",
            "businessName": "Limit Test Business 2",
            "whatsapp": "+5355555003",
            "location": "La Habana, Cuba"
        }
        
        r = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        limit_user_data = r.json()
        
        if r.status_code != 200:
            return print_result(False, f"Failed to create limit test user: {limit_user_data}")
        
        limit_token = limit_user_data['token']
        limit_user_id = limit_user_data['user']['id']
        headers = {"Authorization": f"Bearer {limit_token}"}
        
        # Create 10 products
        for i in range(10):
            product_payload = {
                "name": f"Limit Test Product {i+1}",
                "price": 10 + i,
                "category": "comida",
                "description": f"Test product {i+1}",
                "stock": 5
            }
            requests.post(f"{BASE_URL}/products", json=product_payload, headers=headers, timeout=10)
        
        # Try 11th product
        product_payload = {
            "name": "11th Product Should Fail",
            "price": 100,
            "category": "comida",
            "description": "This should fail",
            "stock": 5
        }
        r = requests.post(f"{BASE_URL}/products", json=product_payload, headers=headers, timeout=10)
        data = r.json()
        
        if r.status_code == 403:
            error = data.get('error', '')
            if 'plan' in error.lower() or 'límite' in error.lower() or 'limite' in error.lower():
                # Store user ID for premium upgrade test
                test_data['limit_user_id'] = limit_user_id
                test_data['limit_user_token'] = limit_token
                return print_result(True, f"Correctly rejected 11th product: {error}")
            else:
                return print_result(False, f"Wrong error message: {error}")
        else:
            return print_result(False, f"Expected 403, got {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_plan_featured_basico():
    """Test 7: Featured with basico plan should be set to false"""
    print_test("Featured=true with basico plan should be forced to false")
    try:
        if not test_data.get('limit_user_token'):
            return print_result(False, "No limit_user_token from previous test")
        
        headers = {"Authorization": f"Bearer {test_data['limit_user_token']}"}
        
        # Delete one product to make room
        r = requests.get(f"{BASE_URL}/my/products", headers=headers, timeout=10)
        my_products = r.json().get('products', [])
        if my_products:
            requests.delete(f"{BASE_URL}/products/{my_products[0]['id']}", headers=headers, timeout=10)
        
        # Create product with featured=true
        product_payload = {
            "name": "Featured Test Product",
            "price": 50,
            "category": "comida",
            "description": "Should not be featured",
            "stock": 5,
            "featured": True
        }
        r = requests.post(f"{BASE_URL}/products", json=product_payload, headers=headers, timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            product = data.get('product', {})
            if product.get('featured') == False:
                return print_result(True, f"Featured correctly set to false for basico plan")
            else:
                return print_result(False, f"Featured should be false but is: {product.get('featured')}")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_plan_premium_featured():
    """Test 7: Upgrade to premium and test featured=true"""
    print_test("Upgrade to premium and create featured product")
    try:
        if not test_data.get('limit_user_id'):
            return print_result(False, "No limit_user_id from previous test")
        
        # Manually update user to premium in MongoDB
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        result = db.users.update_one(
            {"id": test_data['limit_user_id']},
            {"$set": {"plan": "premium"}}
        )
        
        if result.modified_count == 0:
            return print_result(False, "Failed to update user to premium plan")
        
        # Now create product with featured=true
        headers = {"Authorization": f"Bearer {test_data['limit_user_token']}"}
        product_payload = {
            "name": "Premium Featured Product",
            "price": 100,
            "category": "tecnologia",
            "description": "Should be featured",
            "stock": 10,
            "featured": True
        }
        r = requests.post(f"{BASE_URL}/products", json=product_payload, headers=headers, timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            product = data.get('product', {})
            if product.get('featured') == True:
                return print_result(True, f"Featured correctly set to true for premium plan")
            else:
                return print_result(False, f"Featured should be true but is: {product.get('featured')}")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_my_products():
    """Test 8: My products - GET /api/my/products"""
    print_test("My products (auth required)")
    try:
        if not test_data['token']:
            return print_result(False, "No token from previous test")
        
        headers = {"Authorization": f"Bearer {test_data['token']}"}
        r = requests.get(f"{BASE_URL}/my/products", headers=headers, timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            products = data.get('products', [])
            # Should only return products from this user's business
            if isinstance(products, list):
                return print_result(True, f"Got {len(products)} products for current user")
            else:
                return print_result(False, f"Products is not a list")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_business_detail():
    """Test 8: Business detail - GET /api/businesses/:id"""
    print_test("Business detail with products")
    try:
        # Get a business ID from seed data
        r = requests.get(f"{BASE_URL}/products", timeout=10)
        products = r.json().get('products', [])
        if not products:
            return print_result(False, "No products to get business from")
        
        business_id = products[0]['businessId']
        r = requests.get(f"{BASE_URL}/businesses/{business_id}", timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            if 'business' in data and 'products' in data:
                return print_result(True, f"Got business with {len(data['products'])} products")
            else:
                return print_result(False, f"Missing business or products in response")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_business_update_own():
    """Test 8: Update own business"""
    print_test("Update own business")
    try:
        if not test_data['token'] or not test_data['business']:
            return print_result(False, "No token or business from previous test")
        
        headers = {"Authorization": f"Bearer {test_data['token']}"}
        business_id = test_data['business']['id']
        payload = {"description": "Updated business description"}
        
        r = requests.put(f"{BASE_URL}/businesses/{business_id}", 
                        json=payload, headers=headers, timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            business = data.get('business', {})
            if business.get('description') == "Updated business description":
                return print_result(True, f"Business description updated")
            else:
                return print_result(False, f"Description not updated correctly")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_business_update_other():
    """Test 8: Update other business - should fail"""
    print_test("Update other business (should fail)")
    try:
        if not test_data['token'] or not test_data.get('second_user_business_id'):
            return print_result(False, "No token or second_user_business_id from previous test")
        
        headers = {"Authorization": f"Bearer {test_data['token']}"}
        payload = {"description": "Trying to update someone else's business"}
        
        r = requests.put(f"{BASE_URL}/businesses/{test_data['second_user_business_id']}", 
                        json=payload, headers=headers, timeout=10)
        data = r.json()
        
        if r.status_code == 403:
            return print_result(True, f"Correctly rejected unauthorized business update: {data.get('error')}")
        else:
            return print_result(False, f"Expected 403, got {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_subscription():
    """Test 9: Subscription - POST /api/subscription"""
    print_test("Create subscription request")
    try:
        if not test_data['token']:
            return print_result(False, "No token from previous test")
        
        headers = {"Authorization": f"Bearer {test_data['token']}"}
        payload = {
            "plan": "premium",
            "paymentMethod": "usdc",
            "reference": "tx123456789"
        }
        
        r = requests.post(f"{BASE_URL}/subscription", json=payload, headers=headers, timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            payment = data.get('payment', {})
            if payment.get('status') == 'pending':
                return print_result(True, f"Subscription request created with status pending")
            else:
                return print_result(False, f"Payment status should be pending but is: {payment.get('status')}")
        else:
            return print_result(False, f"Status {r.status_code}: {data}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("UBIK2 YEMG BACKEND API TEST SUITE")
    print("="*80)
    
    results = []
    
    # Test 1: Health & basics
    results.append(("Health endpoint", test_health()))
    results.append(("Categories endpoint", test_categories()))
    results.append(("Stats endpoint", test_stats()))
    
    # Test 2: Seed
    results.append(("Seed endpoint", test_seed()))
    
    # Test 3: Auth flow
    results.append(("Auth register", test_auth_register()))
    results.append(("Auth register duplicate", test_auth_register_duplicate()))
    results.append(("Auth login", test_auth_login()))
    results.append(("Auth login wrong password", test_auth_login_wrong_password()))
    results.append(("Auth me with token", test_auth_me()))
    results.append(("Auth me without token", test_auth_me_no_token()))
    
    # Test 4: Products listing
    results.append(("Products listing", test_products_list()))
    results.append(("Products search", test_products_search()))
    results.append(("Products by category", test_products_category()))
    results.append(("Products featured", test_products_featured()))
    
    # Test 5: Product detail
    results.append(("Product detail", test_product_detail()))
    results.append(("Product detail invalid", test_product_detail_invalid()))
    
    # Test 6: Products CRUD
    results.append(("Product create no auth", test_product_create_no_auth()))
    results.append(("Product create", test_product_create()))
    results.append(("Product update", test_product_update()))
    results.append(("Product update not owner", test_product_update_not_owner()))
    results.append(("Product delete", test_product_delete()))
    
    # Test 7: Plan limits
    results.append(("Plan limit 10 products", test_plan_limit()))
    results.append(("Plan limit 11th product", test_plan_limit_11th()))
    results.append(("Featured with basico plan", test_plan_featured_basico()))
    results.append(("Featured with premium plan", test_plan_premium_featured()))
    
    # Test 8: My products & Business
    results.append(("My products", test_my_products()))
    results.append(("Business detail", test_business_detail()))
    results.append(("Business update own", test_business_update_own()))
    results.append(("Business update other", test_business_update_other()))
    
    # Test 9: Subscription
    results.append(("Subscription request", test_subscription()))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("\nFailed tests:")
    for name, result in results:
        if not result:
            print(f"  ❌ {name}")
    
    print("\nPassed tests:")
    for name, result in results:
        if result:
            print(f"  ✅ {name}")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
