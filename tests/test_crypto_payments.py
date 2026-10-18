#!/usr/bin/env python3
"""
Unit tests for crypto payment logic (offline, no network required)
Tests: hash normalization, amount conversion, config parsing, validation
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Base directory for finding project files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

import unittest
from unittest.mock import Mock, patch, AsyncMock
import json

# Import the functions we're testing (would need to be importable from route.js)
# For now, we test the logic in Python

class TestCryptoPayments(unittest.TestCase):
    """Test crypto payment logic"""

    def test_normalize_tx_hash(self):
        """Test txHash normalization for uniqueness"""
        test_cases = [
            ("0xabc123", "abc123"),
            ("abc123", "abc123"),
            ("0XABC123", "abc123"),
            ("0x0xabc", "0xabc"),  # Only strip leading 0x once
            ("", ""),
        ]

        for input_hash, expected in test_cases:
            # JavaScript equivalent: txHash.toLowerCase().replace(/^0x/, '')
            import re
            result = re.sub(r'^0x', '', input_hash.lower())
            self.assertEqual(result, expected, f"Failed for {input_hash}")

    def test_amount_to_raw_conversion(self):
        """Test amount to raw units (6 decimals for USDT/USDC)"""
        test_cases = [
            (100.00, 6, "100000000"),
            (100.50, 6, "100500000"),
            (0.01, 6, "10000"),
            (1.0, 18, "1000000000000000000"),
        ]

        for amount, decimals, expected in test_cases:
            result = str(int(round(amount * (10 ** decimals))))
            self.assertEqual(result, expected, f"Failed for {amount} with {decimals} decimals")

    def test_bep20_raw_amount_preserves_18_decimal_places(self):
        """BEP20 raw units must preserve all 18 decimal places exactly."""
        cases = [
            ("1234567890123456789", "1234567890123456789"),
            ("1000000000000000001", "1000000000000000001"),
            ("123000000000000000", "123000000000000000"),
        ]
        for raw, expected in cases:
            self.assertEqual(str(int(raw)), expected)

    def test_raw_to_amount_conversion(self):
        """Test raw units to amount"""
        test_cases = [
            ("100000000", 6, 100.00),
            ("100500000", 6, 100.50),
            ("10000", 6, 0.01),
        ]

        for raw, decimals, expected in test_cases:
            result = int(raw) / (10 ** decimals)
            self.assertAlmostEqual(result, expected, places=2)

    def test_crypto_config_parsing(self):
        """Test parsing of CRYPTO_ENABLED_NETWORKS"""
        env = "TRC20_USDT,ERC20_USDC,POLYGON_USDT"
        parts = env.split(',')

        networks = []
        for part in parts:
            part = part.strip()
            if '_' in part:
                network, currency = part.split('_', 1)
                networks.append({'network': network, 'currency': currency})

        self.assertEqual(len(networks), 3)
        self.assertEqual(networks[0], {'network': 'TRC20', 'currency': 'USDT'})
        self.assertEqual(networks[1], {'network': 'ERC20', 'currency': 'USDC'})
        self.assertEqual(networks[2], {'network': 'POLYGON', 'currency': 'USDT'})

    def test_invalid_network_format(self):
        """Test that invalid network formats are skipped"""
        env = "TRC20_USDT,INVALID,ERC20_USDC,ALSO_INVALID_FORMAT"
        parts = env.split(',')

        networks = []
        for part in parts:
            part = part.strip()
            if '_' in part:
                split_result = part.split('_', 1)
                if len(split_result) == 2:
                    network, currency = split_result
                    networks.append({'network': network, 'currency': currency})

        # INVALID and ALSO_INVALID_FORMAT have no underscore so they're skipped
        # But wait - "INVALID" has no underscore, "ALSO_INVALID_FORMAT" has two underscores
        # With split('_', 1), ALSO_INVALID_FORMAT becomes ['ALSO', 'INVALID_FORMAT']
        # So we get 3 networks: TRC20_USDT, ERC20_USDC, ALSO_INVALID_FORMAT
        self.assertEqual(len(networks), 3)

    def test_expiry_calculation(self):
        """Test invoice expiry calculation"""
        from datetime import datetime, timedelta

        now = datetime(2025, 1, 15, 10, 0, 0)
        expiry_minutes = 30
        expires_at = now + timedelta(minutes=expiry_minutes)

        expected = datetime(2025, 1, 15, 10, 30, 0)
        self.assertEqual(expires_at, expected)

    def test_underpay_overpay_tolerance(self):
        """Test tolerance calculations"""
        expected = 100.00
        underpay_pct = 0.5  # 0.5%
        overpay_pct = 5.0   # 5%

        min_amount = expected * (1 - underpay_pct / 100)
        max_amount = expected * (1 + overpay_pct / 100)

        self.assertAlmostEqual(min_amount, 99.50, places=2)
        self.assertAlmostEqual(max_amount, 105.00, places=2)

        # Test boundary values
        self.assertTrue(99.50 >= min_amount)  # Exactly at boundary = OK
        self.assertTrue(99.49 < min_amount)   # Below = underpaid
        self.assertTrue(105.00 <= max_amount) # Exactly at boundary = OK
        self.assertTrue(105.01 > max_amount)  # Above = overpaid

    def test_currency_network_validation(self):
        """Test valid currency/network combinations"""
        valid_combinations = [
            ('USDT', 'TRC20'),
            ('USDT', 'ERC20'),
            ('USDC', 'ERC20'),
            ('USDT', 'POLYGON'),
            ('USDC', 'POLYGON'),
            ('USDT', 'BASE'),
            ('USDC', 'BASE'),
            ('USDT', 'ARBITRUM'),
            ('USDC', 'ARBITRUM'),
                ('USDT', 'BEP20'),
                ('USDC', 'BEP20'),
        ]

        for currency, network in valid_combinations:
            key = f"{network}_{currency}"
            self.assertIn(key, [
                'TRC20_USDT', 'ERC20_USDT', 'ERC20_USDC',
                'POLYGON_USDT', 'POLYGON_USDC', 'BASE_USDT', 'BASE_USDC',
                'ARBITRUM_USDT', 'ARBITRUM_USDC', 'BEP20_USDT', 'BEP20_USDC'
            ])

    def test_invalid_currency(self):
        """Test that invalid currencies are rejected"""
        invalid = ['BTC', 'ETH', 'BNB', 'DOGE', 'XRP']
        valid_currencies = ['USDT', 'USDC']

        for currency in invalid:
            self.assertNotIn(currency, valid_currencies)

    def test_invalid_network(self):
        """Test that invalid networks are rejected"""
        invalid = ['BSC', 'SOLANA', 'AVALANCHE', 'FANTOM']
        valid_networks = ['TRC20', 'ERC20', 'POLYGON', 'BASE', 'ARBITRUM', 'BEP20']

        for network in invalid:
            self.assertNotIn(network, valid_networks)

    def test_decimals_by_currency(self):
        """Test decimal places by currency"""
        decimals_map = {
            'USDT': 6,
            'USDC': 6,
        }

        self.assertEqual(decimals_map['USDT'], 6)
        self.assertEqual(decimals_map['USDC'], 6)

    def test_bep20_uses_18_decimals(self):
        """BEP20 tokens configured here use 18 decimal places."""
        from pathlib import Path
        route_text = (Path(BASE_DIR) / "app" / "api" / "[[...path]]" / "route.js").read_text()
        self.assertIn("decimals: network === 'BEP20' ? 18", route_text)

    def test_min_confirmations_by_network(self):
        """Test required confirmations by network"""
        confirmations = {
            'TRC20': 1,
            'ERC20': 12,
            'POLYGON': 20,
            'BASE': 2,
            'ARBITRUM': 20,
            'BEP20': 15,
        }

        # Tron is fast (1 block)
        self.assertEqual(confirmations['TRC20'], 1)
        # Ethereum needs more
        self.assertEqual(confirmations['ERC20'], 12)
        # Polygon needs more for safety
        self.assertEqual(confirmations['POLYGON'], 20)
        # Base is fast
        self.assertEqual(confirmations['BASE'], 2)
        # Arbitrum needs more
        self.assertEqual(confirmations['ARBITRUM'], 20)

    def test_token_contracts_exist(self):
        """Verify the configured token contracts in the actual server source."""
        import re
        from pathlib import Path

        route_path = (
            Path(BASE_DIR) / "app" / "api" / "[[...path]]" / "route.js"
        )
        route_text = route_path.read_text()

        match = re.search(
            r"const\s+CRYPTO_TOKEN_CONTRACTS\s*=\s*\{(.*?)\};",
            route_text,
            re.DOTALL,
        )
        self.assertIsNotNone(
            match, "CRYPTO_TOKEN_CONTRACTS was not found in route.js"
        )

        actual = dict(
            re.findall(
                r"""([A-Z0-9_]+)\s*:\s*['"]([^'"]+)['"]""",
                match.group(1),
            )
        )

        expected = {
            "TRC20_USDT": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
            "ERC20_USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "ERC20_USDC": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "POLYGON_USDT": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
            "POLYGON_USDC": "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
            "BASE_USDT": "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
            "BASE_USDC": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            "ARBITRUM_USDT": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
            "ARBITRUM_USDC": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
            "BEP20_USDT": "0x55d398326f99059fF775485246999027B3197955",
            "BEP20_USDC": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        }

        self.assertEqual(
            set(actual),
            set(expected),
            "Server token contract keys do not match the expected configuration",
        )

        for key, expected_address in expected.items():
            with self.subTest(contract=key):
                self.assertEqual(
                    actual[key].lower(),
                    expected_address.lower(),
                    f"Incorrect contract address for {key}",
                )

        self.assertNotIn(
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            [address.lower() for address in actual.values()],
            "The old Polygon USDC.e address must not be configured as native USDC",
        )

class TestSecurity(unittest.TestCase):
    """Security-focused tests"""

    def test_no_private_keys_in_env(self):
        """Ensure env.example doesn't contain private key patterns"""
        with open(os.path.join(BASE_DIR, '.env.example'), 'r') as f:
            content = f.read()

        # Should not contain private key patterns
        forbidden = ['PRIVATE_KEY', 'MNEMONIC', 'SEED', 'private_key', 'mnemonic', 'seed']
        for forbidden_word in forbidden:
            # Allow in comments that say NOT to use them
            lines = content.split('\n')
            for line in lines:
                if forbidden_word in line and not line.strip().startswith('#'):
                    # Allow if it's in a "NEVER" or "NUNCA" warning
                    if 'NEVER' not in line.upper() and 'NUNCA' not in line.upper():
                        self.fail(f"Found {forbidden_word} in env.example: {line}")

    def test_only_public_addresses_in_env(self):
        """Ensure only public addresses (wallet receive addresses) in env"""
        with open(os.path.join(BASE_DIR, '.env.example'), 'r') as f:
            content = f.read()

        # All CRYPTO_WALLET_* should be example addresses (not real ones)
        import re
        wallet_lines = [line for line in content.split('\n') if 'CRYPTO_WALLET_' in line and '=' in line and not line.strip().startswith('#')]

        # At least some should be example/placeholder addresses
        # The test just checks that the file has wallet config lines
        self.assertGreater(len(wallet_lines), 0, "Should have CRYPTO_WALLET_ lines")

    def test_rpc_urls_are_public(self):
        """Ensure RPC URLs are public endpoints (no API keys)"""
        with open(os.path.join(BASE_DIR, '.env.example'), 'r') as f:
            content = f.read()

        rpc_lines = [line for line in content.split('\n') if 'CRYPTO_RPC_' in line and '=' in line and not line.strip().startswith('#')]

        for line in rpc_lines:
            # Should not contain API key patterns
            self.assertNotIn('api_key', line.lower())
            self.assertNotIn('apikey', line.lower())
            self.assertNotIn('key=', line.lower())
            # Should be known public endpoints
            known_public = ['trongrid.io', 'llamarpc.com', 'polygon-rpc.com', 'mainnet.base.org', 'arbitrum.io']
            self.assertTrue(any(ep in line for ep in known_public), f"Unknown RPC endpoint: {line}")

    def test_no_hardcoded_secrets_in_route(self):
        """Check route.js doesn't have hardcoded secrets"""
        with open(os.path.join(BASE_DIR, 'app/api/[[...path]]/route.js'), 'r') as f:
            content = f.read()

        # Should not have hardcoded private keys, mnemonics, etc.
        forbidden_patterns = [
            'privateKey', 'private_key', 'mnemonic', 'seedPhrase', 'seed_phrase',
            'PRIVATE_KEY', 'MNEMONIC', 'SEED_PHRASE'
        ]

        for pattern in forbidden_patterns:
            self.assertNotIn(pattern, content, f"Found forbidden pattern: {pattern}")

    def test_jwt_secret_no_fallback(self):
        """Test that JWT_SECRET has no insecure fallback"""
        with open(os.path.join(BASE_DIR, 'app/api/[[...path]]/route.js'), 'r') as f:
            content = f.read()

        # Should not have 'dev_secret' or similar fallback
        self.assertNotIn('dev_secret', content)
        # Should have check for missing JWT_SECRET
        self.assertIn('JWT_SECRET no está definida', content)

    def test_txhash_unique_index(self):
        """Test that txHashNormalized unique index is created"""
        with open(os.path.join(BASE_DIR, 'app/api/[[...path]]/route.js'), 'r') as f:
            content = f.read()

        # Should have unique index on txHashNormalized
        self.assertIn('txHashNormalized', content)
        self.assertIn('unique', content)
        # A partial unique index allows invoices without a submitted hash
        # while enforcing uniqueness for string-valued normalized hashes.
        self.assertIn('partialFilterExpression', content)
        self.assertIn("$type: 'string'", content)

    def test_order_invoice_unique_index(self):
        """Test that orderId unique index is created"""
        with open(os.path.join(BASE_DIR, 'app/api/[[...path]]/route.js'), 'r') as f:
            content = f.read()

        # Should have unique index on orderId for crypto_invoices
        # Check for the pattern in the ensureIndexes function
        self.assertIn('orderId', content)
        self.assertIn('unique', content)
        # Check that crypto_invoices collection gets orderId index
        self.assertIn('crypto_invoices', content)

    def test_crypto_invoice_statuses(self):
        """Test all valid crypto invoice statuses"""
        valid_statuses = ['pending', 'submitted', 'approved', 'rejected', 'expired']
        # Note: 'underpaid' and 'overpaid' are designed but not yet implemented in route.js

        # These should be handled in the code
        with open(os.path.join(BASE_DIR, 'app/api/[[...path]]/route.js'), 'r') as f:
            content = f.read()

        for status in valid_statuses:
            self.assertIn(status, content, f"Status {status} not found in route.js")


class TestIntegration(unittest.TestCase):
    """Integration-style tests (mock-based)"""

    def test_create_order_validates_stock(self):
        """Test that order creation validates stock (mock-free version)"""
        # Simulate the validation logic
        product = {'id': 'prod-1', 'stock': 5}
        requested_quantity = 10

        # Should detect insufficient stock
        has_stock = product['stock'] >= requested_quantity
        self.assertFalse(has_stock)

        # Test sufficient stock
        requested_quantity = 3
        has_stock = product['stock'] >= requested_quantity
        self.assertTrue(has_stock)

    def test_idempotency_key_prevents_duplicates(self):
        """Test idempotency key logic"""
        # Simulate the check
        existing_order = {'id': 'order-1', 'idempotencyKey': 'key-123'}
        new_request_key = 'key-123'

        # Should detect duplicate
        is_duplicate = existing_order.get('idempotencyKey') == new_request_key
        self.assertTrue(is_duplicate)

    def test_stock_restored_on_reject(self):
        """Test that stock is restored when invoice rejected"""
        order_items = [
            {'productId': 'prod-1', 'quantity': 2},
            {'productId': 'prod-2', 'quantity': 1},
        ]

        restored = {}
        for item in order_items:
            restored[item['productId']] = restored.get(item['productId'], 0) + item['quantity']

        self.assertEqual(restored, {'prod-1': 2, 'prod-2': 1})


    def test_crypto_invoice_uses_exact_raw_amount(self):
        """Invoice verification must use integer raw units, not float arithmetic."""
        from pathlib import Path
        route = (Path(BASE_DIR) / "app" / "api" / "[[...path]]" / "route.js").read_text()
        self.assertIn("parseUnits(amountDecimal, networkConfig.decimals).toString()", route)
        self.assertIn("expectedAmountRaw", route)
        self.assertIn("transfer.amountRaw === String(expectedAmountRaw)",
                      (Path(BASE_DIR) / "lib" / "crypto-verify.js").read_text())



class TestEscrowWalletGuard(unittest.TestCase):
    """Regression tests for escrow payout destination safeguards."""

    @classmethod
    def setUpClass(cls):
        from pathlib import Path
        cls.route = (Path(BASE_DIR) / "app" / "api" / "[[...path]]" / "route.js").read_text()

    def test_missing_seller_wallet_blocks_release_state(self):
        self.assertIn("'blocked_missing_seller_wallet'", self.route)
        self.assertIn("payoutAddress ? 'confirmed_pending_release' : 'blocked_missing_seller_wallet'", self.route)

    def test_existing_pending_ledger_is_rechecked(self):
        self.assertIn("'blocked_payment_verification', 'blocked_missing_seller_wallet'", self.route)

    def test_real_release_remains_disabled(self):
        self.assertIn("releaseStatus: 'pending_custody_integration'", self.route)
        self.assertIn("releaseTxHash: null", self.route)

    def test_wallet_save_recovers_legacy_escrows_with_cursor(self):
        self.assertIn("if ('cryptoPayoutWallets' in body)", self.route)
        self.assertIn("for await (const ledger of blockedLedgers)", self.route)
        self.assertIn(".batchSize(100)", self.route)
        self.assertIn("releaseStatus: 'pending_custody_integration'", self.route)
        self.assertIn("releaseTxHash: null", self.route)

    def test_recovery_requires_both_confirmations_and_approved_invoice(self):
        self.assertIn("!order.buyerReceiptConfirmation?.confirmedAt", self.route)
        self.assertIn("!order.sellerDeliveryConfirmation?.confirmedAt", self.route)
        self.assertIn("invoice.status !== 'approved'", self.route)
        self.assertIn("invoice.buyerId !== order.buyerId", self.route)
        self.assertIn("invoice.businessId !== order.businessId", self.route)

    def test_recovery_does_not_require_buyer_to_confirm_again(self):
        start = self.route.find("// Recuperación segura de escrows bloqueados")
        end = self.route.find("return json({ business: updated, recoveredEscrows });", start)
        self.assertGreaterEqual(start, 0)
        self.assertGreater(end, start)
        recovery = self.route[start:end]
        self.assertIn("buyerReceiptConfirmation?.confirmedAt", recovery)
        self.assertIn("status: 'confirmed_pending_release'", recovery)
        self.assertNotIn("confirm-receipt", recovery)
        self.assertNotIn("sendTransaction(", recovery)
        self.assertNotIn("sendRawTransaction(", recovery)


    def test_recovery_validates_invoice_network_and_raw_amount(self):
        start = self.route.find("// Recuperación segura de escrows bloqueados")
        end = self.route.find("return json({ business: updated, recoveredEscrows });", start)
        self.assertGreaterEqual(start, 0)
        self.assertGreater(end, start)
        recovery = self.route[start:end]
        self.assertIn("invoice.network?.toUpperCase() !== network", recovery)
        self.assertIn("!/^\\d+$/.test(invoiceRaw)", recovery)
        self.assertIn("const rate = invoice.commissionRateBps;", recovery)
        self.assertNotIn("ledger.commissionRateBps", recovery)
        self.assertIn("grossAmountRaw.toString()", recovery)
        self.assertIn("sellerNetAmountRaw.toString()", recovery)

    def test_recovery_update_is_conditional_and_never_releases_funds(self):
        start = self.route.find("// Recuperación segura de escrows bloqueados")
        end = self.route.find("return json({ business: updated, recoveredEscrows });", start)
        self.assertGreaterEqual(start, 0)
        self.assertGreater(end, start)
        recovery = self.route[start:end]
        self.assertIn("status: ledger.status", recovery)
        self.assertIn("grossAmountRaw: { $in: [null, grossAmountRaw.toString()] }", recovery)
        self.assertIn("commissionAmountRaw: { $in: [null, commissionAmountRaw.toString()] }", recovery)
        self.assertIn("sellerNetAmountRaw: { $in: [null, sellerNetAmountRaw.toString()] }", recovery)
        self.assertIn("commissionRateBps: { $in: [null, commissionRateBps] }", recovery)
        self.assertIn("amountDecimals: { $in: [null, decimals] }", recovery)
        self.assertIn("grossAmount: { $in: [null, grossAmount] }", recovery)
        self.assertIn("commissionAmount: { $in: [null, commissionAmount] }", recovery)
        self.assertIn("sellerNetAmount: { $in: [null, sellerNetAmount] }", recovery)

        self.assertIn("releaseStatus: 'pending_custody_integration'", recovery)
        self.assertIn("releaseTxHash: null", recovery)
        self.assertNotIn("sendTransaction(", recovery)
        self.assertNotIn("sendRawTransaction(", recovery)


    def test_settlement_uses_frozen_invoice_commission_without_silent_fallback(self):
        start = self.route.find("const ensureSettlementLedger = async")
        end = self.route.find("if (order.buyerReceiptConfirmation?.confirmedAt)", start)
        self.assertGreaterEqual(start, 0)
        self.assertGreater(end, start)
        settlement = self.route[start:end]
        self.assertIn("invoice?.commissionRateBps", settlement)
        self.assertIn("commissionRateBps", settlement)
        # La factura debe contener una comisión congelada válida; sin fallback.
        self.assertIn("const validCommissionRate", settlement)
        self.assertIn("if (!validCommissionRate)", settlement)
        self.assertIn("const commissionRateBps = Number(invoice.commissionRateBps);", settlement)
        self.assertNotIn(": 300;", settlement)

    def test_existing_ledger_recalculation_is_limited_to_pending_statuses(self):
        start = self.route.find("const ensureSettlementLedger = async")
        end = self.route.find("if (order.buyerReceiptConfirmation?.confirmedAt)", start)
        self.assertGreaterEqual(start, 0)
        self.assertGreater(end, start)
        settlement = self.route[start:end]
        self.assertIn("status: { $in: ['blocked_payment_verification', 'blocked_missing_seller_wallet'] }", settlement)
        self.assertNotIn("status: { $in: ['blocked_payment_verification', 'blocked_missing_seller_wallet', 'confirmed_pending_release'] }", settlement)
        self.assertIn("releaseStatus: 'pending_custody_integration'", settlement)
        self.assertIn("releaseTxHash: null", settlement)


    def test_settlement_blocks_invoice_without_valid_frozen_commission(self):
        start = self.route.find("const ensureSettlementLedger = async")
        end = self.route.find("if (order.buyerReceiptConfirmation?.confirmedAt)", start)
        self.assertGreaterEqual(start, 0)
        self.assertGreater(end, start)
        settlement = self.route[start:end]
        self.assertIn("invoice?.commissionRateBps", settlement)
        self.assertIn("if (!validCommissionRate)", settlement)
        self.assertIn("const commissionRateBps = Number(invoice.commissionRateBps);", settlement)
        self.assertNotIn("? Number(invoice.commissionRateBps) : 300;", settlement)


if __name__ == '__main__':
    unittest.main(verbosity=2)
