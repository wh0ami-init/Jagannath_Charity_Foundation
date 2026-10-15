"""Email delivery for donation email verification and payment receipts."""
from email.message import EmailMessage
from html import escape
import smtplib
import ssl

from app.config import settings


def _send(message: EmailMessage) -> None:
    if not settings.smtp_host or not settings.smtp_from_email:
        raise RuntimeError("Donation email delivery is not configured")
    context = ssl.create_default_context()
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
        smtp.ehlo()
        if settings.smtp_use_tls:
            smtp.starttls(context=context)
            smtp.ehlo()
        if settings.smtp_username:
            smtp.login(settings.smtp_username, settings.smtp_password)
        smtp.send_message(message)


def send_verification_code(email: str, code: str) -> None:
    message = EmailMessage()
    message["Subject"] = "Verify your email for your Jagannath Foundation donation"
    message["From"] = settings.smtp_from_email
    message["To"] = email
    message.set_content(f"Your email verification code is {code}. It expires in 10 minutes. If you did not request it, ignore this email.")
    _send(message)


def send_donation_receipt(donation) -> None:
    receipt_no = f"JF-{donation.paid_at.year}-{donation.id:06d}"
    donor = escape(donation.donor_name)
    email = escape(donation.donor_email)
    phone = escape(donation.donor_phone or "—")
    address = escape(donation.donor_address or "—")
    cause = escape(donation.cause or "Where most needed")
    date = donation.paid_at.strftime("%d %b %Y, %I:%M %p UTC")
    amount = f"₹{donation.amount_paise / 100:,.2f}"
    message = EmailMessage()
    message["Subject"] = f"Donation receipt {receipt_no} · Jagannath Foundation"
    message["From"] = settings.smtp_from_email
    message["To"] = donation.donor_email
    message.set_content(
        f"Thank you, {donation.donor_name}, for your donation of {amount} to Jagannath Foundation. "
        f"Receipt {receipt_no}; payment ID {donation.razorpay_payment_id}; paid {date}. "
        "This is a donation receipt, not a tax exemption certificate."
    )
    message.add_alternative(f"""<!doctype html><html><body style="font-family:Arial,sans-serif;color:#19354d">
      <main style="max-width:680px;margin:auto;border:1px solid #d9ad55;padding:32px">
      <p style="text-align:center;color:#718397">PUBLIC CHARITABLE TRUST</p><h1 style="text-align:center">Jagannath Foundation</h1>
      <h2>Donation receipt</h2><p>Thank you, <strong>{donor}</strong>, for supporting our work.</p>
      <p><strong>Receipt number:</strong> {receipt_no}<br><strong>Amount:</strong> {amount}<br>
      <strong>Cause:</strong> {cause}<br><strong>Paid on:</strong> {date}<br>
      <strong>Payment reference:</strong> {escape(donation.razorpay_payment_id or '')}</p>
      <h3>Donor details</h3><p>{donor}<br>{email}<br>{phone}<br>{address}</p>
      <p style="font-size:12px;color:#718397">This confirms a payment received by the Foundation. It is not a tax exemption certificate. Any applicable tax documentation is handled separately under the rules that apply.</p>
      </main></body></html>""", subtype="html")
    _send(message)
