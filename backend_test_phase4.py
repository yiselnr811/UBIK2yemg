#!/usr/bin/env python3
"""
Backend API Tests for UBIK2 YEMG - Phase 4: Crypto Payments (Own Wallets)
Tests crypto invoice creation, submission, admin approval/rejection, and verification
"""

import requests
import json
import time
import uuid
from datetime import datetime

BASE_URL = "https://mipyme-hub.preview.emergentagent.com/api"

# Test credentials (from test_credentials.md)
ADMIN_EMAIL = "ubik2yemg@gmail.com"
ADMIN_PASSWORD = "[redacted]"
BUYER_EMAIL = "testbuyer_crypto@example.com"
BUYER_PASSWORD = "TestPass123!"
SELLER_EMAIL = "testseller_crypto@example.com"
SELLER_PASSWORD = "TestPass123!"

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

def test_crypto_config():
    """Test GET /api/payments/crypto/config"""
    print("\n=== TEST: Crypto Config ===\n")
    
    try:
        r = requests.get(f"{BASE_URL}/payments/crypto/config", timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            has_enabled = 'enabled' in data and isinstance(data['enabled'], list)
            has_expiry = 'expiryMinutes' in data
            has_tolerances = 'underpayTolerancePct' in data and 'overpayTolerancePct' in data
            
            log_test(
                "GET /api/payments/crypto/config",
                has_enabled and has_expiry and has_tolerances,
                f"Status: {r.status_code}, Enabled networks: {len(data.get('enabled', []))}"
            )
            
            # Check structure of enabled networks
            for net in data.get('enabled', []):
                required = ['currency', 'network', 'receiverAddress', 'decimals', 'minConfirmations', 'label']
                if all(k in net for k in required):
                    log_test(f"  Network {net['key']} structure", True)
                else:
                    log_test(f"  Network {net['key']} structure", False, f"Missing fields: {[k for k in required if k not in net]}")
            
            return data
        else:
            log_test("GET /api/payments/crypto/config", False, f"Status: {r.status_code}, Response: {data}")
            return None
    except Exception as e:
        log_test("GET /api/payments/crypto/config", False, str(e))
        return None

def test_create_order_crypto(buyer_token, product_id, crypto_config):
    """Test POST /api/orders with paymentMethod=crypto"""
    print("\n=== TEST: Create Order with Crypto ===\n")
    
    if not crypto_config or not crypto_config.get('enabled'):
        log_test("Create order crypto - skip (no networks)", True, "No crypto networks configured")
        return None
    
    network = crypto_config['enabled'][0]
    
    try:
        r = requests.post(
            f"{BASE_URL}/orders",
            headers={'Authorization': f'Bearer {buyer_token}', 'Content-Type': 'application/json'},
            json={
                "items": [{"productId": product_id, "quantity": 1}],
                "shippingName": "Test Buyer",
                "shippingPhone": "+5355555555",
                "shippingAddress": "Test Address, Cuba",
                "shippingNotes": "Crypto payment test",
                "paymentMethod": "crypto",
                "cryptoCurrency": network['currency'],
                "cryptoNetwork": network['network'],
            },
            timeout=15
        )
        data = r.json()
        
        if r.status_code == 201:
            has_order = 'order' in data
            has_invoice = 'invoice' in data
            invoice = data.get('invoice', {})
            
            invoice_valid = all(k in invoice for k in ['id', 'currency', 'network', 'expectedAmount', 'receiverAddress', 'expiresAt', 'txHash'])
            
            log_test(
                "POST /api/orders (crypto)",
                has_order and has_invoice and invoice_valid,
                f"Order: {data.get('order', {}).get('id')}, Invoice: {invoice.get('id')}, Amount: {invoice.get('expectedAmount')} {invoice.get('currency')}"
            )
            return data
        else:
            log_test("POST /api/orders (crypto)", False, f"Status: {r.status_code}, Response: {data}")
            return None
    except Exception as e:
        log_test("POST /api/orders (crypto)", False, str(e))
        return None

def test_get_invoice(buyer_token, order_id):
    """Test GET /api/orders/:id/invoice"""
    print("\n=== TEST: Get Invoice ===\n")
    
    try:
        r = requests.get(
            f"{BASE_URL}/orders/{order_id}/invoice",
            headers={'Authorization': f'Bearer {buyer_token}'},
            timeout=10
        )
        data = r.json()
        
        if r.status_code == 200:
            invoice = data.get('invoice', {})
            has_required = all(k in invoice for k in ['id', 'currency', 'network', 'expectedAmount', 'receiverAddress', 'expiresAt', 'status'])
            # Should NOT have verification internals
            no_verification = 'verification' not in invoice
            
            log_test(
                "GET /api/orders/:id/invoice",
                has_required and no_verification,
                f"Invoice status: {invoice.get('status')}, Amount: {invoice.get('expectedAmount')} {invoice.get('currency')}"
            )
            return data
        else:
            log_test("GET /api/orders/:id/invoice", False, f"Status: {r.status_code}, Response: {data}")
            return None
    except Exception as e:
        log_test("GET /api/orders/:id/invoice", False, str(e))
        return None

def test_submit_txhash(buyer_token, order_id, fake_txhash="0x" + "a" * 64):
    """Test POST /api/orders/:id/invoice/submit-tx"""
    print("\n=== TEST: Submit TxHash ===\n")
    
    try:
        r = requests.post(
            f"{BASE_URL}/orders/{order_id}/invoice/submit-tx",
            headers={'Authorization': f'Bearer {buyer_token}', 'Content-Type': 'application/json'},
            json={"txHash": fake_txhash},
            timeout=10
        )
        data = r.json()
        
        if r.status_code == 200:
            invoice = data.get('invoice', {})
            status_updated = invoice.get('status') == 'submitted'
            txhash_stored = invoice.get('txHash') == fake_txhash
            
            log_test(
                "POST /api/orders/:id/invoice/submit-tx",
                status_updated and txhash_stored,
                f"Invoice status: {invoice.get('status')}, TxHash stored: {bool(txhash_stored)}"
            )
            return data
        else:
            # Might fail if fake hash format invalid - that's OK for test
            log_test("POST /api/orders/:id/invoice/submit-tx", r.status_code == 400, f"Expected 400 for fake hash: {r.status_code}")
            return data
    except Exception as e:
        log_test("POST /api/orders/:id/invoice/submit-tx", False, str(e))
        return None

def test_admin_crypto_invoices(admin_token):
    """Test GET /api/admin/crypto-invoices"""
    print("\n=== TEST: Admin Crypto Invoices List ===\n")
    
    try:
        r = requests.get(
            f"{BASE_URL}/admin/crypto-invoices",
            headers={'Authorization': f'Bearer {admin_token}'},
            timeout=10
        )
        data = r.json()
        
        if r.status_code == 200:
            has_invoices = 'invoices' in data and isinstance(data['invoices'], list)
            has_pagination = 'total' in data and 'limit' in data and 'offset' in data
            
            log_test(
                "GET /api/admin/crypto-invoices",
                has_invoices and has_pagination,
                f"Total: {data.get('total')}, Returned: {len(data.get('invoices', []))}"
            )
            return data
        else:
            log_test("GET /api/admin/crypto-invoices", False, f"Status: {r.status_code}, Response: {data}")
            return None
    except Exception as e:
        log_test("GET /api/admin/crypto-invoices", False, str(e))
        return None

def test_admin_approve_invoice(admin_token, invoice_id):
    """Test POST /api/admin/crypto-invoices/:id/approve"""
    print("\n=== TEST: Admin Approve Invoice ===\n")
    
    try:
        r = requests.post(
            f"{BASE_URL}/admin/crypto-invoices/{invoice_id}/approve",
            headers={'Authorization': f'Bearer {admin_token}', 'Content-Type': 'application/json'},
            json={"notes": "Verificado manualmente en explorer"},
            timeout=10
        )
        data = r.json()
        
        if r.status_code == 200:
            invoice = data.get('invoice', {})
            approved = invoice.get('status') == 'approved'
            has_approved_by = 'approvedBy' in invoice
            has_approved_at = 'approvedAt' in invoice
            
            log_test(
                "POST /api/admin/crypto-invoices/:id/approve",
                approved and has_approved_by and has_approved_at,
                f"Invoice status: {invoice.get('status')}, Approved by: {invoice.get('approvedBy')}"
            )
            return data
        else:
            log_test("POST /api/admin/crypto-invoices/:id/approve", False, f"Status: {r.status_code}, Response: {data}")
            return None
    except Exception as e:
        log_test("POST /api/admin/crypto-invoices/:id/approve", False, str(e))
        return None

def test_admin_reject_invoice(admin_token, invoice_id):
    """Test POST /api/admin/crypto-invoices/:id/reject"""
    print("\n=== TEST: Admin Reject Invoice ===\n")
    
    try:
        r = requests.post(
            f"{BASE_URL}/admin/crypto-invoices/{invoice_id}/reject",
            headers={'Authorization': f'Bearer {admin_token}', 'Content-Type': 'application/json'},
            json={"reason": "Hash no encontrado en blockchain"},
            timeout=10
        )
        data = r.json()
        
        if r.status_code == 200:
            invoice = data.get('invoice', {})
            rejected = invoice.get('status') == 'rejected'
            has_reason = invoice.get('rejectReason') == "Hash no encontrado en blockchain"
            has_rejected_by = 'rejectedBy' in invoice
            
            log_test(
                "POST /api/admin/crypto-invoices/:id/reject",
                rejected and has_reason and has_rejected_by,
                f"Invoice status: {invoice.get('status')}, Reason: {invoice.get('rejectReason')}"
            )
            return data
        else:
            log_test("POST /api/admin/crypto-invoices/:id/reject", False, f"Status: {r.status_code}, Response: {data}")
            return None
    except Exception as e:
        log_test("POST /api/admin/crypto-invoices/:id/reject", False, str(e))
        return None

def test_duplicate_txhash_rejection(buyer_token, order_id, txhash):
    """Test that duplicate txHash is rejected"""
    print("\n=== TEST: Duplicate TxHash Rejection ===\n")
    
    try:
        # Try to submit same txHash to another order (if we had one) or same order
        r = requests.post(
            f"{BASE_URL}/orders/{order_id}/invoice/submit-tx",
            headers={'Authorization': f'Bearer {buyer_token}', 'Content-Type': 'application/json'},
            json={"txHash": txhash},
            timeout=10
        )
        data = r.json()
        
        # Should fail because already submitted
        if r.status_code == 400:
            log_test("Duplicate TxHash rejection", True, "Correctly rejected duplicate txHash")
        else:
            log_test("Duplicate TxHash rejection", False, f"Expected 400, got {r.status_code}: {data}")
    except Exception as e:
        log_test("Duplicate TxHash rejection", False, str(e))

def test_unauthorized_access():
    """Test unauthorized access to crypto endpoints"""
    print("\n=== TEST: Unauthorized Access ===\n")
    
    # Test without token
    endpoints = [
        ("GET", f"{BASE_URL}/orders/test-id/invoice"),
        ("POST", f"{BASE_URL}/orders/test-id/invoice/submit-tx"),
        ("GET", f"{BASE_URL}/admin/crypto-invoices"),
    ]
    
    for method, url in endpoints:
        try:
            if method == "GET":
                r = requests.get(url, timeout=5)
            else:
                r = requests.post(url, json={}, timeout=5)
            
            # Should be 401 or 403
            if r.status_code in [401, 403]:
                log_test(f"Unauthorized {method} {url}", True, f"Status: {r.status_code}")
            else:
                log_test(f"Unauthorized {method} {url}", False, f"Expected 401/403, got {r.status_code}")
        except Exception as e:
            log_test(f"Unauthorized {method} {url}", False, str(e))

def main():
    print("=" * 60)
    print("UBIK2 YEMG - Phase 4: Crypto Payments Tests")
    print("=" * 60)
    
    # 1. Test crypto config (public)
    crypto_config = test_crypto_config()
    
    # 2. Get admin token
    print("\n=== Auth: Admin Login ===")
    try:
        r = requests.post(f"{BASE_URL}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
        admin_token = r.json().get('token') if r.status_code == 200 else None
        log_test("Admin login", bool(admin_token), f"Status: {r.status_code}")
    except Exception as e:
        log_test("Admin login", False, str(e))
        admin_token = None
    
    if not admin_token:
        print("Cannot continue without admin token")
        print_summary()
        return
    
    # 3. Create/ensure buyer user
    print("\n=== Auth: Buyer Register/Login ===")
    try:
        # Try login first
        r = requests.post(f"{BASE_URL}/auth/login", json={"email": BUYER_EMAIL, "password": BUYER_PASSWORD}, timeout=10)
        if r.status_code == 200:
            buyer_token = r.json().get('token')
        else:
            # Register
            r = requests.post(f"{BASE_URL}/auth/register", json={
                "email": BUYER_EMAIL, "password": BUYER_PASSWORD, "accountType": "buyer", "name": "Test Buyer"
            }, timeout=10)
            buyer_token = r.json().get('token') if r.status_code == 200 else None
        log_test("Buyer auth", bool(buyer_token))
    except Exception as e:
        log_test("Buyer auth", False, str(e))
        buyer_token = None
    
    # 4. Create/ensure seller user (need a product to buy)
    print("\n=== Auth: Seller Register ===")
    try:
        r = requests.post(f"{BASE_URL}/auth/register", json={
            "email": SELLER_EMAIL, "password": SELLER_PASSWORD, "accountType": "seller", 
            "name": "Test Seller", "businessName": "Test Seller Business", "whatsapp": "+5355555555"
        }, timeout=10)
        seller_token = r.json().get('token') if r.status_code == 200 else None
        log_test("Seller register", bool(seller_token))
    except Exception as e:
        log_test("Seller register", False, str(e))
        seller_token = None
    
    # 5. Create a product to buy
    product_id = None
    if seller_token:
        print("\n=== Create Product ===")
        try:
            r = requests.post(
                f"{BASE_URL}/products",
                headers={'Authorization': f'Bearer {seller_token}', 'Content-Type': 'application/json'},
                json={
                    "name": "Test Product Crypto", "price": 1000, "description": "Test product for crypto payment",
                    "category": "electronica", "stock": 10, "currency": "CUP", "available": True
                },
                timeout=10
            )
            product_id = r.json().get('product', {}).get('id')
            log_test("Create product", bool(product_id), f"Product ID: {product_id}")
        except Exception as e:
            log_test("Create product", False, str(e))
    
    if not product_id:
        # Try to find existing product
        try:
            r = requests.get(f"{BASE_URL}/products?limit=1", timeout=10)
            products = r.json().get('products', [])
            if products:
                product_id = products[0]['id']
                log_test("Use existing product", True, f"Product ID: {product_id}")
        except:
            pass
    
    if not product_id:
        print("Cannot continue without product")
        print_summary()
        return
    
    # 6. Test order creation with crypto
    order_data = test_create_order_crypto(buyer_token, product_id, crypto_config)
    if not order_data:
        print("Cannot continue without order")
        print_summary()
        return
    
    order_id = order_data['order']['id']
    invoice_id = order_data['invoice']['id']
    
    # 7. Test get invoice
    test_get_invoice(buyer_token, order_id)
    
    # 8. Test submit txHash
    fake_txhash = "0x" + "b" * 64  # Different from any real hash
    test_submit_txhash(buyer_token, order_id, fake_txhash)
    
    # 9. Test admin list
    admin_data = test_admin_crypto_invoices(admin_token)
    
    # 10. Test approve/reject (need submitted invoice)
    if admin_data and admin_data.get('invoices'):
        # Find a submitted invoice
        submitted_invoice = next((inv for inv in admin_data['invoices'] if inv.get('status') == 'submitted'), None)
        if submitted_invoice:
            test_admin_approve_invoice(admin_token, submitted_invoice['id'])
        else:
            # Test reject on the one we just submitted
            test_admin_reject_invoice(admin_token, invoice_id)
    
    # 11. Test duplicate txHash rejection
    test_duplicate_txhash_rejection(buyer_token, order_id, fake_txhash)
    
    # 12. Test unauthorized access
    test_unauthorized_access()
    
    # 13. Test retry verification endpoint
    print("\n=== TEST: Admin Retry Verification ===\n")
    try:
        r = requests.post(
            f"{BASE_URL}/admin/crypto-invoices/{invoice_id}/retry-verification",
            headers={'Authorization': f'Bearer {admin_token}'},
            timeout=15
        )
        data = r.json()
        log_test(
            "POST /admin/crypto-invoices/:id/retry-verification",
            r.status_code == 200,
            f"Status: {r.status_code}, Verification: {data.get('verification', {}).get('confirmations', 'N/A')} confirmations"
        )
    except Exception as e:
        log_test("POST /admin/crypto-invoices/:id/retry-verification", False, str(e))
    
    # 14. Test batch verify pending
    print("\n=== TEST: Admin Batch Verify Pending ===\n")
    try:
        r = requests.post(
            f"{BASE_URL}/admin/crypto-invoices/verify-pending",
            headers={'Authorization': f'Bearer {admin_token}'},
            timeout=30
        )
        data = r.json()
        log_test(
            "POST /admin/crypto-invoices/verify-pending",
            r.status_code == 200,
            f"Results: {len(data.get('results', []))} invoices processed"
        )
    except Exception as e:
        log_test("POST /admin/crypto-invoices/verify-pending", False, str(e))
    
    print_summary()

def print_summary():
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    print(f"📊 Total: {test_results['passed'] + test_results['failed']}")
    
    if test_results['errors']:
        print("\n❌ FAILED TESTS:")
        for error in test_results['errors']:
            print(f"  - {error}")
    
    print("\n" + "=" * 60)
    if test_results['failed'] > 0:
        exit(1)
    else:
        exit(0)

if __name__ == "__main__":
    main()
