#!/usr/bin/env python3
"""
Comprehensive backend regression test for UBIK2 YEMG marketplace.
Tests all endpoints after defensive fixes for MONGO_URL undefined error.
"""

import requests
import json
import time
from datetime import datetime

# Base URL from .env
BASE_URL = "https://mipyme-hub.preview.emergentagent.com/api"

# Admin credentials from test_credentials.md
ADMIN_EMAIL = "ubik2yemg@gmail.com"
ADMIN_PASSWORD = "Yisel.112729"

# Test results tracking
test_results = {
    "passed": 0,
    "failed": 0,
    "errors": []
}

def log_test(name, passed, details=""):
    """Log test result"""
    if passed:
        test_results["passed"] += 1
        print(f"✅ {name}")
    else:
        test_results["failed"] += 1
        test_results["errors"].append(f"{name}: {details}")
        print(f"❌ {name}: {details}")
    if details and passed:
        print(f"   {details}")

def check_no_undefined_error(response_text):
    """Check that response doesn't contain the undefined error"""
    return "Cannot read properties of undefined" not in response_text

def test_public_endpoints():
    """Test all public endpoints"""
    print("\n=== TESTING PUBLIC ENDPOINTS ===\n")
    
    # 1. GET /api/stats
    try:
        r = requests.get(f"{BASE_URL}/stats", timeout=10)
        data = r.json()
        has_all_fields = all(k in data for k in ["productsCount", "businessesCount", "usersCount", "servicesCount", "activeBusinessesCount"])
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/stats",
            r.status_code == 200 and has_all_fields and no_error,
            f"Status: {r.status_code}, Fields: {list(data.keys())}, Counts: products={data.get('productsCount')}, businesses={data.get('businessesCount')}, users={data.get('usersCount')}, services={data.get('servicesCount')}, active={data.get('activeBusinessesCount')}"
        )
    except Exception as e:
        log_test("GET /api/stats", False, str(e))
    
    # 2. GET /api/categories
    try:
        r = requests.get(f"{BASE_URL}/categories", timeout=10)
        data = r.json()
        has_structure = "categories" in data and "businessTypes" in data and "currencies" in data
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/categories",
            r.status_code == 200 and has_structure and no_error,
            f"Status: {r.status_code}, Categories: {len(data.get('categories', []))}, BusinessTypes: {len(data.get('businessTypes', []))}, Currencies: {len(data.get('currencies', []))}"
        )
    except Exception as e:
        log_test("GET /api/categories", False, str(e))
    
    # 3. GET /api/settings
    try:
        r = requests.get(f"{BASE_URL}/settings", timeout=10)
        data = r.json()
        required_fields = ["usdcWallet", "transfermovilNumber", "premiumPriceUSD"]
        has_fields = all(k in data for k in required_fields)
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/settings",
            r.status_code == 200 and has_fields and no_error,
            f"Status: {r.status_code}, Fields: {list(data.keys())}"
        )
    except Exception as e:
        log_test("GET /api/settings", False, str(e))
    
    # 4. GET /api/products with pagination
    try:
        r = requests.get(f"{BASE_URL}/products?limit=12&page=1", timeout=10)
        data = r.json()
        has_products = "products" in data and isinstance(data["products"], list)
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/products?limit=12&page=1",
            r.status_code == 200 and has_products and no_error,
            f"Status: {r.status_code}, Products returned: {len(data.get('products', []))}, Total: {data.get('total', 0)}"
        )
    except Exception as e:
        log_test("GET /api/products?limit=12&page=1", False, str(e))
    
    # 5. GET /api/products with category filter
    try:
        r = requests.get(f"{BASE_URL}/products?category=electronica", timeout=10)
        data = r.json()
        has_products = "products" in data
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/products?category=electronica",
            r.status_code == 200 and has_products and no_error,
            f"Status: {r.status_code}, Products: {len(data.get('products', []))}"
        )
    except Exception as e:
        log_test("GET /api/products?category=electronica", False, str(e))
    
    # 6. GET /api/products with country filter
    try:
        r = requests.get(f"{BASE_URL}/products?country=Cuba", timeout=10)
        data = r.json()
        has_products = "products" in data
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/products?country=Cuba",
            r.status_code == 200 and has_products and no_error,
            f"Status: {r.status_code}, Products: {len(data.get('products', []))}"
        )
    except Exception as e:
        log_test("GET /api/products?country=Cuba", False, str(e))
    
    # 7. GET /api/products with businessType filter (use real businessType from categories)
    try:
        r = requests.get(f"{BASE_URL}/products?businessType=tienda", timeout=10)
        data = r.json()
        has_products = "products" in data
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/products?businessType=tienda",
            r.status_code == 200 and has_products and no_error,
            f"Status: {r.status_code}, Products: {len(data.get('products', []))}"
        )
    except Exception as e:
        log_test("GET /api/products?businessType=tienda", False, str(e))
    
    # 8. GET /api/products with search query
    try:
        r = requests.get(f"{BASE_URL}/products?q=test", timeout=10)
        data = r.json()
        has_products = "products" in data
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/products?q=test",
            r.status_code == 200 and has_products and no_error,
            f"Status: {r.status_code}, Products: {len(data.get('products', []))}"
        )
    except Exception as e:
        log_test("GET /api/products?q=test", False, str(e))
    
    # 9. GET /api/products with featured filter
    try:
        r = requests.get(f"{BASE_URL}/products?featured=true", timeout=10)
        data = r.json()
        has_products = "products" in data
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/products?featured=true",
            r.status_code == 200 and has_products and no_error,
            f"Status: {r.status_code}, Products: {len(data.get('products', []))}"
        )
    except Exception as e:
        log_test("GET /api/products?featured=true", False, str(e))
    
    # 10. GET /api/products with non-existent search (CRITICAL: must return empty array, not error)
    try:
        r = requests.get(f"{BASE_URL}/products?q=zzzznoexiste999", timeout=10)
        data = r.json()
        is_empty_array = "products" in data and isinstance(data["products"], list) and len(data["products"]) == 0
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/products?q=zzzznoexiste999 (empty result)",
            r.status_code == 200 and is_empty_array and no_error,
            f"Status: {r.status_code}, Products: {len(data.get('products', []))} (should be 0)"
        )
    except Exception as e:
        log_test("GET /api/products?q=zzzznoexiste999 (empty result)", False, str(e))
    
    # 11. GET /api/businesses with limit
    try:
        r = requests.get(f"{BASE_URL}/businesses?limit=12", timeout=10)
        data = r.json()
        is_array = isinstance(data, list)
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/businesses?limit=12",
            r.status_code == 200 and is_array and no_error,
            f"Status: {r.status_code}, Businesses: {len(data) if is_array else 'N/A'}"
        )
    except Exception as e:
        log_test("GET /api/businesses?limit=12", False, str(e))
    
    # 12. GET /api/products/:id with real product (get first product from list)
    try:
        # First get a product list to get a real ID
        r_list = requests.get(f"{BASE_URL}/products?limit=1", timeout=10)
        products = r_list.json().get("products", [])
        if products:
            product_id = products[0]["id"]
            r = requests.get(f"{BASE_URL}/products/{product_id}", timeout=10)
            data = r.json()
            has_business = "business" in data
            no_error = check_no_undefined_error(r.text)
            log_test(
                f"GET /api/products/:id (real ID)",
                r.status_code == 200 and has_business and no_error,
                f"Status: {r.status_code}, Product: {data.get('name', 'N/A')}, Has business: {has_business}"
            )
        else:
            log_test("GET /api/products/:id (real ID)", False, "No products available to test")
    except Exception as e:
        log_test("GET /api/products/:id (real ID)", False, str(e))
    
    # 13. GET /api/products/:id with non-existent ID (should return 404, not crash)
    try:
        r = requests.get(f"{BASE_URL}/products/id-inexistente-999", timeout=10)
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/products/id-inexistente-999 (404 clean)",
            r.status_code == 404 and no_error,
            f"Status: {r.status_code}"
        )
    except Exception as e:
        log_test("GET /api/products/id-inexistente-999 (404 clean)", False, str(e))
    
    # 14. GET /api/businesses/:id with real business
    try:
        # Get a business from the list
        r_list = requests.get(f"{BASE_URL}/businesses?limit=1", timeout=10)
        businesses = r_list.json() if isinstance(r_list.json(), list) else []
        if businesses:
            business_id = businesses[0]["id"]
            r = requests.get(f"{BASE_URL}/businesses/{business_id}", timeout=10)
            data = r.json()
            no_error = check_no_undefined_error(r.text)
            log_test(
                f"GET /api/businesses/:id (real ID)",
                r.status_code == 200 and no_error,
                f"Status: {r.status_code}, Business: {data.get('name', 'N/A')}"
            )
        else:
            log_test("GET /api/businesses/:id (real ID)", False, "No businesses available to test")
    except Exception as e:
        log_test("GET /api/businesses/:id (real ID)", False, str(e))
    
    # 15. GET /api/businesses/:id with non-existent ID (should return 404, not crash)
    try:
        r = requests.get(f"{BASE_URL}/businesses/id-inexistente-999", timeout=10)
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/businesses/id-inexistente-999 (404 clean)",
            r.status_code == 404 and no_error,
            f"Status: {r.status_code}"
        )
    except Exception as e:
        log_test("GET /api/businesses/id-inexistente-999 (404 clean)", False, str(e))
    
    # 16. GET /api/reviews?productId=X (test shape even without reviews)
    try:
        # Get a product ID first
        r_list = requests.get(f"{BASE_URL}/products?limit=1", timeout=10)
        products = r_list.json().get("products", [])
        if products:
            product_id = products[0]["id"]
            r = requests.get(f"{BASE_URL}/reviews?productId={product_id}", timeout=10)
            data = r.json()
            has_shape = "reviews" in data and "average" in data and "count" in data
            no_error = check_no_undefined_error(r.text)
            log_test(
                f"GET /api/reviews?productId=X (shape test)",
                r.status_code == 200 and has_shape and no_error,
                f"Status: {r.status_code}, Shape: {list(data.keys())}, Count: {data.get('count', 0)}"
            )
        else:
            log_test("GET /api/reviews?productId=X (shape test)", False, "No products available to test")
    except Exception as e:
        log_test("GET /api/reviews?productId=X (shape test)", False, str(e))

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("\n=== TESTING AUTH ENDPOINTS ===\n")
    
    # Generate unique email for this test run
    timestamp = int(time.time())
    buyer_email = f"buyer_test_{timestamp}@test.com"
    seller_email = f"seller_test_{timestamp}@test.com"
    test_password = "TestPass123!"
    
    # 1. POST /api/auth/register - buyer
    try:
        payload = {
            "email": buyer_email,
            "password": test_password,
            "accountType": "buyer",
            "name": "Test Buyer"
        }
        r = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        data = r.json()
        has_token = "token" in data and "user" in data
        no_error = check_no_undefined_error(r.text)
        buyer_token = data.get("token", "")
        log_test(
            "POST /api/auth/register (buyer)",
            r.status_code == 200 and has_token and no_error,
            f"Status: {r.status_code}, Has token: {has_token}, User: {data.get('user', {}).get('email', 'N/A')}"
        )
    except Exception as e:
        log_test("POST /api/auth/register (buyer)", False, str(e))
        buyer_token = ""
    
    # 2. POST /api/auth/register - seller
    try:
        payload = {
            "email": seller_email,
            "password": test_password,
            "accountType": "seller",
            "name": "Test Seller",
            "businessName": "Test Business",
            "whatsapp": "+5355123456"
        }
        r = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        data = r.json()
        has_token_and_business = "token" in data and "user" in data and "business" in data
        no_error = check_no_undefined_error(r.text)
        seller_token = data.get("token", "")
        log_test(
            "POST /api/auth/register (seller)",
            r.status_code == 200 and has_token_and_business and no_error,
            f"Status: {r.status_code}, Has token: {'token' in data}, Has business: {'business' in data}"
        )
    except Exception as e:
        log_test("POST /api/auth/register (seller)", False, str(e))
        seller_token = ""
    
    # 3. POST /api/auth/register without email/password (should return 400, not crash with toLowerCase error)
    try:
        payload = {}
        r = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        no_error = check_no_undefined_error(r.text)
        no_tolowercase_error = "toLowerCase" not in r.text
        log_test(
            "POST /api/auth/register (empty body - 400 clean)",
            r.status_code == 400 and no_error and no_tolowercase_error,
            f"Status: {r.status_code}"
        )
    except Exception as e:
        log_test("POST /api/auth/register (empty body - 400 clean)", False, str(e))
    
    # 4. POST /api/auth/login with valid credentials
    try:
        payload = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        r = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        data = r.json()
        has_token = "token" in data
        no_error = check_no_undefined_error(r.text)
        admin_token = data.get("token", "")
        log_test(
            "POST /api/auth/login (admin credentials)",
            r.status_code == 200 and has_token and no_error,
            f"Status: {r.status_code}, Has token: {has_token}"
        )
    except Exception as e:
        log_test("POST /api/auth/login (admin credentials)", False, str(e))
        admin_token = ""
    
    # 5. POST /api/auth/login with empty body (should return 400, not crash)
    try:
        payload = {}
        r = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        no_error = check_no_undefined_error(r.text)
        no_tolowercase_error = "toLowerCase" not in r.text
        log_test(
            "POST /api/auth/login (empty body - 400 clean)",
            r.status_code == 400 and no_error and no_tolowercase_error,
            f"Status: {r.status_code}"
        )
    except Exception as e:
        log_test("POST /api/auth/login (empty body - 400 clean)", False, str(e))
    
    # 6. GET /api/auth/me with token
    if admin_token:
        try:
            headers = {"Authorization": f"Bearer {admin_token}"}
            r = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
            data = r.json()
            has_user = "user" in data
            no_error = check_no_undefined_error(r.text)
            log_test(
                "GET /api/auth/me (with token)",
                r.status_code == 200 and has_user and no_error,
                f"Status: {r.status_code}, User: {data.get('user', {}).get('email', 'N/A')}"
            )
        except Exception as e:
            log_test("GET /api/auth/me (with token)", False, str(e))
    
    # 7. GET /api/auth/me without token (should return 401 clean)
    try:
        r = requests.get(f"{BASE_URL}/auth/me", timeout=10)
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/auth/me (no token - 401 clean)",
            r.status_code == 401 and no_error,
            f"Status: {r.status_code}"
        )
    except Exception as e:
        log_test("GET /api/auth/me (no token - 401 clean)", False, str(e))
    
    return {
        "buyer_token": buyer_token,
        "seller_token": seller_token,
        "admin_token": admin_token,
        "buyer_email": buyer_email,
        "seller_email": seller_email
    }

def test_seller_crud(seller_token):
    """Test seller CRUD operations"""
    print("\n=== TESTING SELLER CRUD OPERATIONS ===\n")
    
    if not seller_token:
        log_test("Seller CRUD tests", False, "No seller token available")
        return None
    
    headers = {"Authorization": f"Bearer {seller_token}"}
    product_id = None
    
    # 1. POST /api/products - create product
    try:
        payload = {
            "name": "Test Product",
            "description": "Test description",
            "price": 100,
            "category": "electronica",
            "currency": "CUP",
            "available": True,
            "stock": 10
        }
        r = requests.post(f"{BASE_URL}/products", json=payload, headers=headers, timeout=10)
        data = r.json()
        has_product = "id" in data or ("product" in data and "id" in data["product"])
        no_error = check_no_undefined_error(r.text)
        if has_product:
            product_id = data.get("id") or data.get("product", {}).get("id")
        log_test(
            "POST /api/products (create)",
            r.status_code == 200 and has_product and no_error,
            f"Status: {r.status_code}, Product ID: {product_id}"
        )
    except Exception as e:
        log_test("POST /api/products (create)", False, str(e))
    
    # 2. GET /api/my/products
    try:
        r = requests.get(f"{BASE_URL}/my/products", headers=headers, timeout=10)
        data = r.json()
        is_array = isinstance(data, list)
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/my/products",
            r.status_code == 200 and is_array and no_error,
            f"Status: {r.status_code}, Products: {len(data) if is_array else 'N/A'}"
        )
    except Exception as e:
        log_test("GET /api/my/products", False, str(e))
    
    # 3. PUT /api/products/:id - update product
    if product_id:
        try:
            payload = {
                "price": 150,
                "description": "Updated description"
            }
            r = requests.put(f"{BASE_URL}/products/{product_id}", json=payload, headers=headers, timeout=10)
            no_error = check_no_undefined_error(r.text)
            log_test(
                "PUT /api/products/:id (update)",
                r.status_code == 200 and no_error,
                f"Status: {r.status_code}"
            )
        except Exception as e:
            log_test("PUT /api/products/:id (update)", False, str(e))
    
    # 4. DELETE /api/products/:id
    if product_id:
        try:
            r = requests.delete(f"{BASE_URL}/products/{product_id}", headers=headers, timeout=10)
            no_error = check_no_undefined_error(r.text)
            log_test(
                "DELETE /api/products/:id",
                r.status_code == 200 and no_error,
                f"Status: {r.status_code}"
            )
        except Exception as e:
            log_test("DELETE /api/products/:id", False, str(e))
    
    return product_id

def test_admin_endpoints(admin_token):
    """Test admin endpoints"""
    print("\n=== TESTING ADMIN ENDPOINTS ===\n")
    
    if not admin_token:
        log_test("Admin tests", False, "No admin token available")
        return
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. GET /api/admin/stats with token
    try:
        r = requests.get(f"{BASE_URL}/admin/stats", headers=headers, timeout=10)
        data = r.json()
        has_fields = "products" in data or "productsCount" in data
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/admin/stats (with admin token)",
            r.status_code == 200 and has_fields and no_error,
            f"Status: {r.status_code}, Fields: {list(data.keys())}"
        )
    except Exception as e:
        log_test("GET /api/admin/stats (with admin token)", False, str(e))
    
    # 2. GET /api/admin/stats without token (should return 401/403 clean)
    try:
        r = requests.get(f"{BASE_URL}/admin/stats", timeout=10)
        no_error = check_no_undefined_error(r.text)
        log_test(
            "GET /api/admin/stats (no token - 401/403 clean)",
            r.status_code in [401, 403] and no_error,
            f"Status: {r.status_code}"
        )
    except Exception as e:
        log_test("GET /api/admin/stats (no token - 401/403 clean)", False, str(e))

def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    print(f"📊 Total: {test_results['passed'] + test_results['failed']}")
    
    if test_results['errors']:
        print("\n❌ FAILED TESTS:")
        for error in test_results['errors']:
            print(f"  - {error}")
    
    print("\n" + "="*60)
    
    # Check for critical issues
    critical_issues = []
    for error in test_results['errors']:
        if "Cannot read properties of undefined" in error:
            critical_issues.append(error)
        elif "toLowerCase" in error:
            critical_issues.append(error)
    
    if critical_issues:
        print("\n🚨 CRITICAL ISSUES FOUND:")
        for issue in critical_issues:
            print(f"  - {issue}")
    else:
        print("\n✅ NO CRITICAL ISSUES FOUND (no 'Cannot read properties of undefined' errors)")

def main():
    """Main test runner"""
    print("="*60)
    print("UBIK2 YEMG BACKEND REGRESSION TEST")
    print("Testing after defensive fixes for MONGO_URL undefined error")
    print("="*60)
    
    # Run all tests
    test_public_endpoints()
    auth_tokens = test_auth_endpoints()
    test_seller_crud(auth_tokens.get("seller_token"))
    test_admin_endpoints(auth_tokens.get("admin_token"))
    
    # Print summary
    print_summary()
    
    # Exit with appropriate code
    if test_results['failed'] > 0:
        exit(1)
    else:
        exit(0)

if __name__ == "__main__":
    main()
