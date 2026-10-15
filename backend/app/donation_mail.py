"""Email delivery for donation email verification and payment receipts."""
from email.message import EmailMessage
from html import escape
from pathlib import Path
import smtplib
import ssl
from datetime import timezone
from zoneinfo import ZoneInfo

from app.config import settings


def _send(message: EmailMessage) -> None:
    if not settings.smtp_host or not settings.smtp_from_email:
        raise RuntimeError("Donation email delivery is not configured")
    context = ssl.create_default_context()
    if settings.smtp_port == 465:
        smtp_connection = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=15, context=context)
    else:
        smtp_connection = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15)
    with smtp_connection as smtp:
        if settings.smtp_port != 465:
            smtp.ehlo()
            if settings.smtp_use_tls:
                smtp.starttls(context=context)
                smtp.ehlo()
        if settings.smtp_username:
            smtp.login(settings.smtp_username, settings.smtp_password)
        smtp.send_message(message)


def send_verification_code(email: str, code: str) -> None:
    message = EmailMessage()
    message["Subject"] = "Your Jagannath Foundation email verification code"
    message["From"] = settings.smtp_from_email
    message["To"] = email
    message.set_content(
        "Hello,\n\n"
        "Please use the verification code below to confirm this email address for your Jagannath Foundation donation.\n\n"
        f"Verification code: {code}\n\n"
        "This code expires in 10 minutes. Return to the donation page and enter it to continue.\n\n"
        "If you did not request this code, you can safely ignore this email. No payment has been made, and the donation cannot continue unless this code is entered. Please do not share this code with anyone.\n\n"
        "Regards,\nJagannath Foundation\nServing with dignity"
    )
    message.add_alternative(f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:28px 12px;background:#f3f5f3;font-family:Arial,Helvetica,sans-serif;color:#26352d">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e1e6e1;border-radius:12px;overflow:hidden">
    <tr><td style="height:4px;background:#d9ad55;font-size:0;line-height:0">&nbsp;</td></tr>
    <tr><td align="center" bgcolor="#214638" style="padding:27px 28px 24px;background-color:#214638;background-image:linear-gradient(120deg,#18372f 0%,#315b49 100%)">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="76" height="76" bgcolor="#ffffff" style="width:76px;height:76px;margin:0 auto 12px;border-radius:50%;background:#ffffff;border:2px solid #ead6a8">
        <tr><td align="center" valign="middle" style="padding:5px;border-radius:50%">
          <img src="cid:jf-foundation-logo" width="62" height="62" alt="Jagannath Foundation logo" style="display:block;width:62px;height:62px;border:0;border-radius:50%;object-fit:cover">
        </td></tr>
      </table>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:1.4;font-weight:700;letter-spacing:.2px;color:#ffffff">Jagannath Foundation</div>
      <div style="padding-top:4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;letter-spacing:1.4px;color:#e5d6b3;text-transform:uppercase">Serving with dignity</div>
    </td></tr>
    <tr><td style="padding:0 34px"><div style="height:1px;background:#e8edf1"></div></td></tr>
    <tr><td style="padding:28px 34px 10px;font-family:Arial,Helvetica,sans-serif">
      <h1 style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:23px;line-height:1.4;font-weight:700;color:#18372f">Confirm your email address</h1>
      <p style="margin:0;font-size:15px;line-height:1.65;color:#526159">Use this code to verify your email and continue with your donation.</p>
    </td></tr>
    <tr><td align="center" style="padding:20px 34px 14px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:390px;border:1px solid #dce6dc;border-radius:10px;background:#f7faf6">
        <tr><td align="center" style="padding:16px 16px 17px;font-family:Arial,Helvetica,sans-serif">
          <div style="font-size:11px;line-height:1.5;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#637469">Your verification code</div>
          <div style="padding-top:8px;font-family:'Courier New',Courier,monospace;font-size:32px;line-height:1.3;font-weight:bold;letter-spacing:7px;color:#18372f">{escape(code)}</div>
        </td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding:0 34px 19px;font-family:Arial,Helvetica,sans-serif">
      <p style="margin:0;font-size:13px;line-height:1.6;color:#56655b">This code expires in <strong style="color:#29483b">10 minutes</strong>.</p>
    </td></tr>
    <tr><td style="padding:0 34px 26px;font-family:Arial,Helvetica,sans-serif">
      <p style="margin:0;padding:14px 16px;border-left:3px solid #d9ad55;background:#f6f7f5;font-size:13px;line-height:1.65;color:#5e6c62"><strong style="color:#34483c">Didn’t request this code?</strong> You can safely ignore this email. No payment has been made, and the donation cannot continue unless this code is entered. Please do not share this code with anyone.</p>
    </td></tr>
    <tr><td align="center" style="padding:16px 24px;background:#e8eee9;border-top:1px solid #d8e1d9;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:#5f6e64"><strong style="font-size:12px;color:#34483c">Jagannath Foundation</strong><br>This message was sent automatically. Please do not reply.</td></tr>
  </table>
</body></html>""", subtype="html")
    logo_path = Path(__file__).resolve().parents[2] / "frontend" / "public" / "images" / "logo-mark.png"
    if logo_path.is_file():
        html_part = message.get_payload()[-1]
        html_part.add_related(logo_path.read_bytes(), maintype="image", subtype="png",
                              cid="<jf-foundation-logo>", disposition="inline", filename="logo-mark.png")
    _send(message)


def send_donation_receipt(donation) -> None:
    receipt_no = f"JF-{donation.paid_at.year}-{donation.id:06d}"
    donor = escape(donation.donor_name)
    email = escape(donation.donor_email)
    phone = escape(donation.donor_phone or "—")
    address = escape(donation.donor_address or "—")
    cause = escape(donation.cause or "Where most needed")
    paid_at = donation.paid_at.replace(tzinfo=timezone.utc) if donation.paid_at.tzinfo is None else donation.paid_at
    date = paid_at.astimezone(ZoneInfo("Asia/Kolkata")).strftime("%d %b %Y, %I:%M %p IST")
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
