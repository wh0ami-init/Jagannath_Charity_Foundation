"""Receipt-only integration: no payments, subscriptions, or database writes."""
from .autopay import AutoPayReceipt, generate_autopay_receipt

__all__ = ['AutoPayReceipt', 'generate_autopay_receipt']
