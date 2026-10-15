"""Generate an A4 receipt using the supplied foundation template.

Call only after your own server has confirmed monthly AutoPay activation.
The verification URL must point to your own implemented verification page;
this module does not create a subscription or verification service.
"""
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from io import BytesIO
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo
import re

import pymupdf
import qrcode
from num2words import num2words

ASSETS = Path(__file__).resolve().parent / 'assets'
INK = (0.10, 0.23, 0.34)
SUCCESS = (0.0, 0.43, 0.32)

@dataclass(frozen=True)
class AutoPayReceipt:
    receipt_number: str
    donor_name: str
    donor_email: str
    donor_mobile: str
    donor_address: str
    amount_paise: int
    subscription_id: str
    activated_at: datetime
    verification_url: str

    def __post_init__(self):
        if not re.fullmatch(r'AP/RCP/[0-9]{4,12}', self.receipt_number):
            raise ValueError('Receipt number must have the form AP/RCP/0004')
        if type(self.amount_paise) is not int or not 1 <= self.amount_paise <= 100_000_000:
            raise ValueError('Amount must be an integer between 1 and 100000000 paise')
        if not re.fullmatch(r'sub_[A-Za-z0-9]{1,90}', self.subscription_id):
            raise ValueError('A valid confirmed subscription ID is required')
        if not isinstance(self.activated_at, datetime) or self.activated_at.utcoffset() is None:
            raise ValueError('Activation datetime must include a timezone')
        parsed = urlparse(self.verification_url)
        if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password:
            raise ValueError('Verification URL must be an absolute HTTPS URL without credentials')
        if len(self.verification_url) > 2048:
            raise ValueError('Verification URL is too long')
        for name in ('donor_name', 'donor_email', 'donor_mobile', 'donor_address'):
            text = getattr(self, name)
            if not isinstance(text, str) or not text.strip() or len(text) > 300:
                raise ValueError(f'{name} must be a nonempty string of at most 300 characters')
            if any(ord(c) < 32 for c in text):
                raise ValueError(f'{name} cannot contain control characters')


def _amount_words(paise):
    rupees, fraction = divmod(paise, 100)
    words = num2words(rupees, lang='en_IN') + (' rupee' if rupees == 1 else ' rupees')
    if fraction:
        words += ' and ' + num2words(fraction, lang='en_IN') + (' paisa' if fraction == 1 else ' paise')
    return words.capitalize() + ' only'


def _field(page, rect, text, size=6.5, minimum=4.5, color=INK):
    """Fit inside the original cell; refuse rather than clip impossible input."""
    font = pymupdf.Font(fontfile=str(ASSETS / 'DejaVuSans.ttf'))
    if any(not font.has_glyph(ord(c)) for c in text if not c.isspace()):
        raise ValueError('Dynamic fields contain unsupported glyphs; add a matching Unicode font')
    page.insert_font(fontname='ReceiptUnicode', fontfile=str(ASSETS / 'DejaVuSans.ttf'))
    while size >= minimum:
        shape = page.new_shape()
        remaining = shape.insert_textbox(pymupdf.Rect(rect), text, fontname='ReceiptUnicode',
                                         fontsize=size, color=color, lineheight=1.1)
        if remaining >= 0:
            shape.commit()
            return
        size = round(size - 0.25, 2)
    raise ValueError('A receipt field is too long for the original template; shorten the value')


def generate_autopay_receipt(receipt: AutoPayReceipt) -> bytes:
    """Return PDF bytes for a confirmed, active, monthly UPI/Card subscription.

    Receipt numbers and activation status are supplied by trusted server code.
    Never feed unverified checkout form fields directly into this function.
    Branding, Hindi copy, signature, and watermark are the supplied artwork.
    Variable fields are searchable Unicode text; the fixed artwork is raster.
    """
    amount = f'₹{Decimal(receipt.amount_paise) / 100:,.2f}'
    with pymupdf.open() as doc:
        page = doc.new_page(width=595.28, height=841.89)
        page.insert_image(page.rect, filename=str(ASSETS / 'autopay-template.png'))
        _field(page, (423, 242, 466, 253), receipt.receipt_number, size=5.6)
        _field(page, (133, 294, 156.5, 309), amount, size=8.0, minimum=4.0, color=SUCCESS)
        _field(page, (222, 361, 465, 375), receipt.donor_name)
        _field(page, (222, 380.5, 465, 395), receipt.donor_email)
        _field(page, (222, 400.5, 465, 414), receipt.donor_mobile)
        _field(page, (222, 420, 465, 433), receipt.donor_address)
        _field(page, (222, 473, 465, 490), f'{amount} ({_amount_words(receipt.amount_paise)})', size=6)
        _field(page, (230, 499, 465, 511), 'Monthly')
        _field(page, (222, 539, 465, 551), receipt.subscription_id, size=5.4)
        _field(page, (230, 558, 465, 571), receipt.activated_at.astimezone(ZoneInfo('Asia/Kolkata')).strftime('%d-%m-%Y %H:%M'))
        qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=8, border=4)
        qr.add_data(receipt.verification_url); qr.make(fit=True)
        buffer = BytesIO(); qr.make_image(fill_color='#193b57', back_color='white').save(buffer, format='PNG')
        area = pymupdf.Rect(134, 671, 190, 728)
        page.insert_image(area, stream=buffer.getvalue())
        page.insert_link({'kind': pymupdf.LINK_URI, 'from': area, 'uri': receipt.verification_url})
        doc.set_metadata({'title': f'AutoPay Subscription Receipt {receipt.receipt_number}',
                          'author': 'Jagannath Foundation', 'subject': 'Monthly AutoPay activation receipt'})
        return doc.tobytes(garbage=4, deflate=True)
