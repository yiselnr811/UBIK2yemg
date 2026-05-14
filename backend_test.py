#!/usr/bin/env python3
"""
Backend API Tests for UBIK2 YEMG - Phase B+C
Tests public settings, forgot/reset password, my payments, and admin endpoints
"""

import requests
import json
from uuid import uuid4

BASE_URL = "https://mipyme-hub.preview.emergentagent.com/api"

def test_public_settings():
    """Test GET /api/settings (no auth required)"""
    print("\n=== TEST: Public Settings ===")
    try:
        response = requests.get(f"{BASE_URL}/settings")
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        required_fields = ['usdcWallet', 'usdcNetwork', 'transfermovilNumber', 'transfermovilName', 'premiumPriceUSD']
        
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing field '{field}' in response")
                return False
        
        print(f"✅ PASSED: All required fields present")
        print(f"Settings: {json.dumps(data, indent=2)}")
        return True
    except Exception as e:
        print(f"❌ FAILED: Exception - {str(e)}")
        return False


def test_forgot_reset_password():
    """Test forgot/reset password flow"""
    print("\n=== TEST: Forgot/Reset Password Flow ===")
    
    # Step 1: Register a fresh user with UUID email
    print("\n1. Registering fresh user...")
    user_email = f"test-{uuid4()}@example.com"
    user_password = "oldPassword123"
    
    try:
        register_data = {
            "email": user_email,
            "password": user_password,
            "businessName": f"Test Business {uuid4().hex[:8]}",
            "whatsapp": "+5355512345"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Registration failed with {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        print(f"✅ User registered: {user_email}")
        
        # Step 2: Request password reset with valid email
        print("\n2. Requesting password reset with valid email...")
        response = requests.post(f"{BASE_URL}/auth/forgot", json={"email": user_email})
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        if 'resetToken' not in data or 'expiresAt' not in data:
            print(f"❌ FAILED: Missing resetToken or expiresAt in response")
            print(f"Response: {json.dumps(data, indent=2)}")
            return False
        
        reset_token = data['resetToken']
        if len(reset_token) != 24:
            print(f"❌ FAILED: resetToken should be 24 chars, got {len(reset_token)}")
            return False
        
        print(f"✅ Reset token received: {reset_token}")
        
        # Step 3: Request password reset with invalid email
        print("\n3. Requesting password reset with invalid email...")
        response = requests.post(f"{BASE_URL}/auth/forgot", json={"email": "nope@nope.com"})
        
        if response.status_code != 404:
            print(f"❌ FAILED: Expected 404, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        print(f"✅ Invalid email correctly rejected with 404")
        
        # Step 4: Reset password with valid token
        print("\n4. Resetting password with valid token...")
        new_password = "newPass123"
        response = requests.post(f"{BASE_URL}/auth/reset", json={
            "token": reset_token,
            "newPassword": new_password
        })
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        print(f"✅ Password reset successful")
        
        # Step 5: Try login with old password (should fail)
        print("\n5. Attempting login with old password...")
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": user_email,
            "password": user_password
        })
        
        if response.status_code != 401:
            print(f"❌ FAILED: Expected 401, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        print(f"✅ Old password correctly rejected with 401")
        
        # Step 6: Login with new password (should succeed)
        print("\n6. Attempting login with new password...")
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": user_email,
            "password": new_password
        })
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        if 'token' not in data:
            print(f"❌ FAILED: No token in login response")
            return False
        
        print(f"✅ Login with new password successful")
        
        # Step 7: Try reset with invalid token
        print("\n7. Attempting reset with invalid token...")
        response = requests.post(f"{BASE_URL}/auth/reset", json={
            "token": "invalidtoken123456789012",
            "newPassword": "anotherPass123"
        })
        
        if response.status_code != 400:
            print(f"❌ FAILED: Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        print(f"✅ Invalid token correctly rejected with 400")
        
        print("\n✅ ALL FORGOT/RESET PASSWORD TESTS PASSED")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception - {str(e)}")
        return False


def test_subscription_with_screenshot():
    """Test subscription endpoint with screenshot field"""
    print("\n=== TEST: Subscription with Screenshot ===")
    
    # Register a user first
    print("\n1. Registering user...")
    user_email = f"test-{uuid4()}@example.com"
    
    try:
        register_data = {
            "email": user_email,
            "password": "testPass123",
            "businessName": f"Test Business {uuid4().hex[:8]}",
            "whatsapp": "+5355512345"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Registration failed")
            return False
        
        token = response.json()['token']
        print(f"✅ User registered and logged in")
        
        # Create subscription with screenshot
        print("\n2. Creating subscription with screenshot...")
        subscription_data = {
            "plan": "premium",
            "paymentMethod": "usdc",
            "reference": "tx-hash-123",
            "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(f"{BASE_URL}/subscription", json=subscription_data, headers=headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        
        # Verify payment object is returned
        if 'payment' not in data:
            print(f"❌ FAILED: No payment object in response")
            return False
        
        payment = data['payment']
        
        # Verify screenshot is NOT in response
        if 'screenshot' in payment:
            print(f"❌ FAILED: Screenshot field should NOT be in response")
            print(f"Payment: {json.dumps(payment, indent=2)}")
            return False
        
        print(f"✅ Subscription created, screenshot correctly excluded from response")
        
        # Verify via /api/my/payments
        print("\n3. Verifying payment via /api/my/payments...")
        response = requests.get(f"{BASE_URL}/my/payments", headers=headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        payments = data.get('payments', [])
        
        if len(payments) == 0:
            print(f"❌ FAILED: No payments found")
            return False
        
        # Check that none of the payments have screenshot field
        for p in payments:
            if 'screenshot' in p:
                print(f"❌ FAILED: Screenshot field found in payment from /api/my/payments")
                return False
        
        print(f"✅ Payments list verified, no screenshot fields present")
        
        print("\n✅ ALL SUBSCRIPTION TESTS PASSED")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception - {str(e)}")
        return False


def test_my_payments():
    """Test GET /api/my/payments endpoint"""
    print("\n=== TEST: My Payments ===")
    
    # Register a user and create a payment
    print("\n1. Setting up user and payment...")
    user_email = f"test-{uuid4()}@example.com"
    
    try:
        register_data = {
            "email": user_email,
            "password": "testPass123",
            "businessName": f"Test Business {uuid4().hex[:8]}",
            "whatsapp": "+5355512345"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Registration failed")
            return False
        
        token = response.json()['token']
        
        # Create a payment
        subscription_data = {
            "plan": "premium",
            "paymentMethod": "transfermovil",
            "reference": "ref-123",
            "screenshot": "base64screenshot"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(f"{BASE_URL}/subscription", json=subscription_data, headers=headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Subscription creation failed")
            return False
        
        print(f"✅ User and payment created")
        
        # Get my payments
        print("\n2. Fetching my payments...")
        response = requests.get(f"{BASE_URL}/my/payments", headers=headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        
        if 'payments' not in data:
            print(f"❌ FAILED: No payments array in response")
            return False
        
        payments = data['payments']
        
        if not isinstance(payments, list):
            print(f"❌ FAILED: payments should be an array")
            return False
        
        # Verify no screenshot field in any payment
        for payment in payments:
            if 'screenshot' in payment:
                print(f"❌ FAILED: Screenshot field should not be in response")
                return False
        
        print(f"✅ Payments retrieved successfully, {len(payments)} payment(s) found")
        print(f"✅ No screenshot fields in response")
        
        print("\n✅ ALL MY PAYMENTS TESTS PASSED")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception - {str(e)}")
        return False


def test_admin_endpoints():
    """Test all admin endpoints"""
    print("\n=== TEST: Admin Endpoints ===")
    
    try:
        # Step 1: Login as admin
        print("\n1. Logging in as admin...")
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": "admin@ubik2.com",
            "password": "admin123"
        })
        
        if response.status_code != 200:
            print(f"❌ FAILED: Admin login failed with {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        admin_token = response.json()['token']
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print(f"✅ Admin logged in successfully")
        
        # Step 2: Test GET /api/admin/stats
        print("\n2. Testing GET /api/admin/stats...")
        response = requests.get(f"{BASE_URL}/admin/stats", headers=admin_headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        stats = response.json()
        required_stats = ['products', 'businesses', 'users', 'pendingPayments', 'approvedPayments']
        
        for field in required_stats:
            if field not in stats:
                print(f"❌ FAILED: Missing field '{field}' in stats")
                return False
        
        print(f"✅ Stats retrieved: {json.dumps(stats, indent=2)}")
        
        # Step 3: Test GET /api/admin/settings
        print("\n3. Testing GET /api/admin/settings...")
        response = requests.get(f"{BASE_URL}/admin/settings", headers=admin_headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        if 'settings' not in data:
            print(f"❌ FAILED: No settings object in response")
            return False
        
        print(f"✅ Settings retrieved")
        
        # Step 4: Test PUT /api/admin/settings
        print("\n4. Testing PUT /api/admin/settings...")
        new_wallet = f"NewWallet{uuid4().hex[:8]}"
        new_price = 15.50
        
        response = requests.put(f"{BASE_URL}/admin/settings", json={
            "usdcWallet": new_wallet,
            "premiumPriceUSD": new_price
        }, headers=admin_headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        # Verify update
        response = requests.get(f"{BASE_URL}/admin/settings", headers=admin_headers)
        settings = response.json()['settings']
        
        if settings['usdcWallet'] != new_wallet or settings['premiumPriceUSD'] != new_price:
            print(f"❌ FAILED: Settings not updated correctly")
            return False
        
        print(f"✅ Settings updated successfully")
        
        # Step 5: Test GET /api/admin/payments
        print("\n5. Testing GET /api/admin/payments...")
        response = requests.get(f"{BASE_URL}/admin/payments", headers=admin_headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        payments = data.get('payments', [])
        
        # Check that user and business are attached, and no password leaked
        for payment in payments:
            if payment.get('user'):
                if 'password' in payment['user']:
                    print(f"❌ FAILED: Password leaked in user object")
                    return False
        
        print(f"✅ Payments retrieved with user/business attached, no password leak")
        
        # Step 6: Test GET /api/admin/payments?status=pending
        print("\n6. Testing GET /api/admin/payments?status=pending...")
        response = requests.get(f"{BASE_URL}/admin/payments?status=pending", headers=admin_headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        payments = data.get('payments', [])
        
        # Verify all are pending
        for payment in payments:
            if payment.get('status') != 'pending':
                print(f"❌ FAILED: Non-pending payment in filtered results")
                return False
        
        print(f"✅ Pending payments filter working, {len(payments)} pending payment(s)")
        
        # Step 7: Create a payment and approve it
        print("\n7. Creating payment and testing approve...")
        
        # Register a regular user
        user_email = f"test-{uuid4()}@example.com"
        register_data = {
            "email": user_email,
            "password": "testPass123",
            "businessName": f"Test Business {uuid4().hex[:8]}",
            "whatsapp": "+5355512345"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        user_token = response.json()['token']
        user_id = response.json()['user']['id']
        user_headers = {"Authorization": f"Bearer {user_token}"}
        
        # Create payment
        subscription_data = {
            "plan": "premium",
            "paymentMethod": "usdc",
            "reference": "approve-test-ref"
        }
        response = requests.post(f"{BASE_URL}/subscription", json=subscription_data, headers=user_headers)
        payment_id = response.json()['payment']['id']
        
        # Approve payment
        response = requests.post(f"{BASE_URL}/admin/payments/{payment_id}/approve", headers=admin_headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Approve failed with {response.status_code}")
            return False
        
        # Verify user plan updated
        response = requests.get(f"{BASE_URL}/auth/me", headers=user_headers)
        user_data = response.json()['user']
        
        if user_data['plan'] != 'premium':
            print(f"❌ FAILED: User plan not updated to premium")
            return False
        
        if not user_data.get('planExpiresAt'):
            print(f"❌ FAILED: planExpiresAt not set")
            return False
        
        print(f"✅ Payment approved, user plan updated to premium with expiry date")
        
        # Step 8: Create another payment and reject it
        print("\n8. Creating payment and testing reject...")
        
        # Create another payment
        subscription_data = {
            "plan": "premium",
            "paymentMethod": "transfermovil",
            "reference": "reject-test-ref"
        }
        response = requests.post(f"{BASE_URL}/subscription", json=subscription_data, headers=user_headers)
        payment_id = response.json()['payment']['id']
        
        # Reject payment
        reject_reason = "Bad screenshot"
        response = requests.post(f"{BASE_URL}/admin/payments/{payment_id}/reject", json={
            "reason": reject_reason
        }, headers=admin_headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Reject failed with {response.status_code}")
            return False
        
        # Verify payment status
        response = requests.get(f"{BASE_URL}/admin/payments", headers=admin_headers)
        payments = response.json()['payments']
        rejected_payment = next((p for p in payments if p['id'] == payment_id), None)
        
        if not rejected_payment:
            print(f"❌ FAILED: Rejected payment not found")
            return False
        
        if rejected_payment['status'] != 'rejected':
            print(f"❌ FAILED: Payment status not updated to rejected")
            return False
        
        if rejected_payment.get('rejectReason') != reject_reason:
            print(f"❌ FAILED: Reject reason not set correctly")
            return False
        
        print(f"✅ Payment rejected with reason")
        
        # Step 9: Test GET /api/admin/users
        print("\n9. Testing GET /api/admin/users...")
        response = requests.get(f"{BASE_URL}/admin/users", headers=admin_headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        users = data.get('users', [])
        
        # Verify no password field
        for user in users:
            if 'password' in user:
                print(f"❌ FAILED: Password field present in user object")
                return False
        
        print(f"✅ Users retrieved, no password fields present")
        
        # Step 10: Test PUT /api/admin/users/:id (update plan)
        print("\n10. Testing PUT /api/admin/users/:id (update plan)...")
        
        # Create a new user to update
        new_user_email = f"test-{uuid4()}@example.com"
        register_data = {
            "email": new_user_email,
            "password": "testPass123",
            "businessName": f"Test Business {uuid4().hex[:8]}",
            "whatsapp": "+5355512345"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        new_user_id = response.json()['user']['id']
        
        # Update to premium
        response = requests.put(f"{BASE_URL}/admin/users/{new_user_id}", json={
            "plan": "premium"
        }, headers=admin_headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        updated_user = response.json()['user']
        
        if updated_user['plan'] != 'premium':
            print(f"❌ FAILED: User plan not updated")
            return False
        
        print(f"✅ User plan updated to premium")
        
        # Step 11: Test PUT /api/admin/users/:id (suspend user)
        print("\n11. Testing PUT /api/admin/users/:id (suspend user)...")
        
        response = requests.put(f"{BASE_URL}/admin/users/{new_user_id}", json={
            "suspended": True
        }, headers=admin_headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        updated_user = response.json()['user']
        
        if updated_user.get('suspended') != True:
            print(f"❌ FAILED: User not suspended")
            return False
        
        print(f"✅ User suspended successfully")
        
        # Step 12: Test GET /api/admin/products
        print("\n12. Testing GET /api/admin/products...")
        response = requests.get(f"{BASE_URL}/admin/products", headers=admin_headers)
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        products = data.get('products', [])
        
        # Verify business is attached
        if len(products) > 0:
            if 'business' not in products[0]:
                print(f"❌ FAILED: Business not attached to products")
                return False
        
        print(f"✅ Products retrieved with business attached, {len(products)} product(s)")
        
        # Step 13: Test DELETE /api/admin/products/:id
        print("\n13. Testing DELETE /api/admin/products/:id...")
        
        if len(products) == 0:
            print(f"⚠️  SKIPPED: No products to delete")
        else:
            product_id = products[0]['id']
            response = requests.delete(f"{BASE_URL}/admin/products/{product_id}", headers=admin_headers)
            
            if response.status_code != 200:
                print(f"❌ FAILED: Expected 200, got {response.status_code}")
                return False
            
            # Verify deletion
            response = requests.get(f"{BASE_URL}/admin/products", headers=admin_headers)
            updated_products = response.json()['products']
            
            if any(p['id'] == product_id for p in updated_products):
                print(f"❌ FAILED: Product not deleted")
                return False
            
            print(f"✅ Product deleted successfully")
        
        # Step 14: Test admin endpoints with non-admin user
        print("\n14. Testing admin endpoints with non-admin user (should get 403)...")
        
        # Create regular user
        regular_user_email = f"test-{uuid4()}@example.com"
        register_data = {
            "email": regular_user_email,
            "password": "testPass123",
            "businessName": f"Test Business {uuid4().hex[:8]}",
            "whatsapp": "+5355512345"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        regular_token = response.json()['token']
        regular_headers = {"Authorization": f"Bearer {regular_token}"}
        
        # Try to access admin endpoint
        response = requests.get(f"{BASE_URL}/admin/stats", headers=regular_headers)
        
        if response.status_code != 403:
            print(f"❌ FAILED: Expected 403, got {response.status_code}")
            return False
        
        print(f"✅ Non-admin user correctly rejected with 403")
        
        # Step 15: Test admin endpoints without token
        print("\n15. Testing admin endpoints without token (should get 401)...")
        
        response = requests.get(f"{BASE_URL}/admin/stats")
        
        if response.status_code != 401:
            print(f"❌ FAILED: Expected 401, got {response.status_code}")
            return False
        
        print(f"✅ No token correctly rejected with 401")
        
        print("\n✅ ALL ADMIN ENDPOINT TESTS PASSED")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception - {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("=" * 80)
    print("UBIK2 YEMG - Phase B+C Backend API Tests")
    print("=" * 80)
    
    results = {
        "Public Settings": test_public_settings(),
        "Forgot/Reset Password": test_forgot_reset_password(),
        "Subscription with Screenshot": test_subscription_with_screenshot(),
        "My Payments": test_my_payments(),
        "Admin Endpoints": test_admin_endpoints()
    }
    
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 80)
    
    return all(results.values())


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
