# Jagannath Foundation — Python AutoPay receipt integration

Drop-in additions for `wh0ami-init/Jagannath_Charity_Foundation` at commit `7680b32`.
This archive contains only new receipt files and the updated backend requirements;
it does not replace your application, change payments, or activate subscriptions.

## Install

1. Copy the `backend/` folder contents into your repository's `backend/` folder.
   Merge the three receipt dependencies if your requirements have changed.
2. Use Python 3.10+ and run `python -m pip install -r requirements.txt` in `backend/`.
3. Run `python -m unittest discover -s tests -p 'test_autopay_receipt.py'`.
4. Generate a sample with:
   `python examples/generate_autopay_receipt.py --verification-url https://YOUR-DOMAIN/your-existing-verification-page`

The verification URL must be your own working HTTPS page. There is no verification
endpoint in this package. The example's donor values are deliberately fictional.

## Use from trusted Python code

```python
from datetime import datetime
from app.receipts import AutoPayReceipt, generate_autopay_receipt

# Load these fields from your trusted, confirmed subscription record.
receipt = AutoPayReceipt(
    receipt_number=record.receipt_number,
    donor_name=record.donor_name,
    donor_email=record.donor_email,
    donor_mobile=record.donor_mobile,
    donor_address=record.donor_address,
    amount_paise=record.amount_paise,
    subscription_id=record.subscription_id,
    activated_at=record.activated_at,  # timezone-aware datetime
    verification_url=record.verification_url,
)
pdf_bytes = generate_autopay_receipt(receipt)
```

A future authenticated FastAPI download handler can return the bytes with
`Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=autopay-receipt.pdf", "Cache-Control": "no-store"})`.
Check access to the stored subscription first. Do not add a public endpoint accepting
arbitrary donor fields or render this active receipt for a one-time payment.

## Template fidelity and limitations

The supplied PDF is a flattened image, not an editable document. The generator
preserves its exact bilingual header, layout, logo, signature, watermark and fixed
monthly UPI/Card activation copy. Original donor fields and original QR were removed;
new values are inserted as searchable Unicode text and a new clickable QR is generated.
Receipt numbers must be allocated by your application, not by this stateless utility.
Only confirmed ACTIVE monthly subscriptions are supported; status and frequency
are not editable to avoid contradictory template wording. Time is displayed in IST.
Long values shrink within their existing cells or raise a clear error, never clip.
The bundled font supports Latin/rupee text; unsupported dynamic glyphs raise an error.
Hindi fixed artwork remains identical to the supplied reference. For editable Hindi
donor names, supply a Devanagari font and a shaping-capable text renderer.
The QR checks only URL format; it does not prove the target page exists.
The sample PDF uses an example.org URL for demonstration, not a live verification service.
No Razorpay, email, storage, database, subscription, or production integration is claimed.

## Licensing

Use of foundation branding and the reproduced signature is subject to your permission
from the foundation. `DejaVuSans.ttf` is redistributed under its included license.
