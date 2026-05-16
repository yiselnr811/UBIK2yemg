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
    """Test forgot/reset password flow with Resend integration (anti-enumeration)"""
    print("\n=== TEST: Forgot/Reset Password Flow (Resend Integration) ===")
    
    try:
        # SCENARIO A: POST /api/auth/forgot with EXISTING user email (admin@ubik2.com)
        print("\n[A] Testing forgot with EXISTING user (admin@ubik2.com)...")
        response = requests.post(f"{BASE_URL}/auth/forgot", json={"email": "admin@ubik2.com"})
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Verify generic message
        if 'message' not in data:
            print(f"❌ FAILED: Missing 'message' field in response")
            return False
        
        expected_message = "Si el correo está registrado, te enviamos un mensaje con instrucciones para restablecer tu contraseña."
        if data['message'] != expected_message:
            print(f"❌ FAILED: Message doesn't match expected anti-enumeration message")
            print(f"Expected: {expected_message}")
            print(f"Got: {data['message']}")
            return False
        
        # Verify emailDelivered is true
        if 'emailDelivered' not in data:
            print(f"❌ FAILED: Missing 'emailDelivered' field in response")
            return False
        
        if data['emailDelivered'] != True:
            print(f"❌ FAILED: emailDelivered should be true for existing user, got {data['emailDelivered']}")
            return False
        
        # SECURITY: Verify NO resetToken in response
        if 'resetToken' in data:
            print(f"❌ FAILED: SECURITY ISSUE - resetToken should NOT be in response body")
            return False
        
        # SECURITY: Verify NO expiresAt in response
        if 'expiresAt' in data:
            print(f"❌ FAILED: SECURITY ISSUE - expiresAt should NOT be in response body")
            return False
        
        print(f"✅ PASSED: Existing user returns 200 with generic message, emailDelivered=true, no token leak")
        
        # SCENARIO B: POST /api/auth/forgot with NON-EXISTING email
        print("\n[B] Testing forgot with NON-EXISTING email...")
        response = requests.post(f"{BASE_URL}/auth/forgot", json={"email": "random-noexiste-xyz@test.com"})
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected 200 (anti-enumeration), got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Verify same generic message
        if data.get('message') != expected_message:
            print(f"❌ FAILED: Non-existing email should return same generic message")
            return False
        
        # emailDelivered should be false or undefined (not true)
        if data.get('emailDelivered') == True:
            print(f"❌ FAILED: emailDelivered should not be true for non-existing email")
            return False
        
        print(f"✅ PASSED: Non-existing email returns 200 with generic message (anti-enumeration working)")
        
        # SCENARIO C: POST /api/auth/forgot missing email field
        print("\n[C] Testing forgot with missing email field...")
        response = requests.post(f"{BASE_URL}/auth/forgot", json={})
        
        if response.status_code != 400:
            print(f"❌ FAILED: Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        if data.get('error') != 'Email requerido':
            print(f"❌ FAILED: Expected error message 'Email requerido', got {data.get('error')}")
            return False
        
        print(f"✅ PASSED: Missing email correctly rejected with 400")
        
        # SCENARIO D: Full forgot→reset cycle with MongoDB token retrieval
        print("\n[D] Testing full forgot→reset cycle with MongoDB token retrieval...")
        
        # D1: Create a temporary test user
        print("\n  D1. Creating temporary test user...")
        test_email = f"test-reset-{uuid4().hex[:8]}@ubik2test.com"
        test_password_old = "OldPassword123"
        test_password_new = "NewPassword456"
        
        register_data = {
            "email": test_email,
            "password": test_password_old,
            "businessName": f"Test Reset Business {uuid4().hex[:6]}",
            "whatsapp": "+5355512345"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        
        if response.status_code != 200:
            print(f"❌ FAILED: User registration failed with {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        print(f"  ✅ Test user created: {test_email}")
        
        # D2: Call forgot password
        print("\n  D2. Calling forgot password...")
        response = requests.post(f"{BASE_URL}/auth/forgot", json={"email": test_email})
        
        if response.status_code != 200:
            print(f"❌ FAILED: Forgot password failed with {response.status_code}")
            return False
        
        data = response.json()
        if data.get('emailDelivered') != True:
            print(f"❌ FAILED: emailDelivered should be true for valid user")
            return False
        
        print(f"  ✅ Forgot password called successfully")
        
        # D3: Read resetToken directly from MongoDB
        print("\n  D3. Reading resetToken from MongoDB...")
        import pymongo
        mongo_client = pymongo.MongoClient("mongodb://localhost:27017")
        db = mongo_client["ubik2_yemg"]
        user_doc = db.users.find_one({"email": test_email})
        
        if not user_doc:
            print(f"❌ FAILED: User not found in MongoDB")
            return False
        
        if 'resetToken' not in user_doc:
            print(f"❌ FAILED: resetToken not stored in MongoDB")
            return False
        
        reset_token = user_doc['resetToken']
        
        if len(reset_token) != 24:
            print(f"❌ FAILED: resetToken should be 24 chars, got {len(reset_token)}")
            return False
        
        if 'resetExpires' not in user_doc:
            print(f"❌ FAILED: resetExpires not stored in MongoDB")
            return False
        
        print(f"  ✅ resetToken retrieved from MongoDB: {reset_token[:8]}... (24 chars)")
        
        # D4: Call reset password with token
        print("\n  D4. Calling reset password with token...")
        response = requests.post(f"{BASE_URL}/auth/reset", json={
            "token": reset_token,
            "newPassword": test_password_new
        })
        
        if response.status_code != 200:
            print(f"❌ FAILED: Reset password failed with {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        if data.get('message') != 'Contraseña actualizada':
            print(f"❌ FAILED: Expected message 'Contraseña actualizada', got {data.get('message')}")
            return False
        
        print(f"  ✅ Password reset successful")
        
        # D5: Verify old password no longer works
        print("\n  D5. Verifying old password no longer works...")
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": test_email,
            "password": test_password_old
        })
        
        if response.status_code != 401:
            print(f"❌ FAILED: Old password should be rejected with 401, got {response.status_code}")
            return False
        
        print(f"  ✅ Old password correctly rejected with 401")
        
        # D6: Verify new password works
        print("\n  D6. Verifying new password works...")
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": test_email,
            "password": test_password_new
        })
        
        if response.status_code != 200:
            print(f"❌ FAILED: New password should work, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        if 'token' not in data:
            print(f"❌ FAILED: No token in login response")
            return False
        
        print(f"  ✅ New password works, login successful")
        
        print(f"✅ PASSED: Full forgot→reset cycle working correctly")
        
        # SCENARIO E: POST /api/auth/reset with invalid token
        print("\n[E] Testing reset with invalid token...")
        response = requests.post(f"{BASE_URL}/auth/reset", json={
            "token": "invalidtoken1234567890ab",
            "newPassword": "SomePassword123"
        })
        
        if response.status_code != 400:
            print(f"❌ FAILED: Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        if data.get('error') != 'Token inválido':
            print(f"❌ FAILED: Expected error 'Token inválido', got {data.get('error')}")
            return False
        
        print(f"✅ PASSED: Invalid token correctly rejected with 400")
        
        # SCENARIO F: POST /api/auth/reset missing token or newPassword
        print("\n[F] Testing reset with missing fields...")
        
        # Missing token
        response = requests.post(f"{BASE_URL}/auth/reset", json={"newPassword": "Test123"})
        if response.status_code != 400:
            print(f"❌ FAILED: Missing token should return 400, got {response.status_code}")
            return False
        
        # Missing newPassword
        response = requests.post(f"{BASE_URL}/auth/reset", json={"token": "sometoken123456789012"})
        if response.status_code != 400:
            print(f"❌ FAILED: Missing newPassword should return 400, got {response.status_code}")
            return False
        
        print(f"✅ PASSED: Missing fields correctly rejected with 400")
        
        print("\n✅ ALL FORGOT/RESET PASSWORD TESTS PASSED (Resend Integration)")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception - {str(e)}")
        import traceback
        traceback.print_exc()
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
            "password": "Administra2r.1279"
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
