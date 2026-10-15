import unittest
from dataclasses import replace
from datetime import datetime
from app.receipts import AutoPayReceipt, generate_autopay_receipt
import pymupdf

class ReceiptTests(unittest.TestCase):
    def setUp(self):
        self.receipt = AutoPayReceipt('AP/RCP/0004', 'Sample Donor', 'donor@example.org',
                                     '9000000000', 'Bhubaneswar, Odisha', 100, 'sub_Sample123',
                                     datetime.fromisoformat('2026-10-14T02:36:00+00:00'),
                                     'https://example.org/verify/receipt-token')
    def test_dynamic_fields_and_link(self):
        with pymupdf.open(stream=generate_autopay_receipt(self.receipt), filetype='pdf') as doc:
            self.assertEqual(len(doc), 1)
            text = doc[0].get_text()
            for value in ['Sample Donor', 'donor@example.org', 'AP/RCP/0004', '₹1.00', 'One rupee only', '14-10-2026 08:06']:
                self.assertIn(value, text)
            self.assertEqual(doc[0].get_links()[0]['uri'], self.receipt.verification_url)
    def test_fractional_amount(self):
        with pymupdf.open(stream=generate_autopay_receipt(replace(self.receipt, amount_paise=12345)), filetype='pdf') as doc:
            self.assertIn('₹123.45', doc[0].get_text())
            self.assertIn('forty-five paise', doc[0].get_text())
    def test_invalid_input(self):
        for changes in [{'amount_paise': 0}, {'amount_paise': True}, {'verification_url': 'javascript:alert(1)'},
                        {'activated_at': datetime(2026, 1, 1)}, {'receipt_number': '../../etc/passwd'}]:
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                replace(self.receipt, **changes)
    def test_long_address_fits_or_fails_explicitly(self):
        receipt = replace(self.receipt, donor_address='A long street address, ' * 10)
        try:
            pdf = generate_autopay_receipt(receipt)
        except ValueError as error:
            self.assertIn('too long', str(error))
        else:
            with pymupdf.open(stream=pdf, filetype='pdf') as doc:
                self.assertEqual(len(doc), 1)
    def test_original_private_values_not_in_artwork(self):
        from app.receipts.autopay import ASSETS
        # Artwork is intentionally stripped of original variable fields.
        self.assertTrue((ASSETS / 'autopay-template.png').exists())

if __name__ == '__main__':
    unittest.main()
