import asyncio
import gzip
import unittest

from app.public_compression import PublicCatalogueCompression


class PublicCompressionTests(unittest.TestCase):
    def test_only_public_gets_are_compressed_and_content_is_preserved(self):
        payload = b'{"value":"' + b"Public catalogue text " * 200 + b'"}'

        async def endpoint(scope, receive, send):
            await send({"type": "http.response.start", "status": 200,
                        "headers": [(b"content-type", b"application/json")]})
            await send({"type": "http.response.body", "body": payload})

        async def request(path, method="GET", accepts=True):
            messages = []
            async def receive():
                return {"type": "http.request", "body": b""}
            async def send(message):
                messages.append(message)
            await PublicCatalogueCompression(endpoint)({
                "type": "http", "method": method, "path": path,
                "headers": [(b"accept-encoding", b"gzip")] if accepts else [],
            }, receive, send)
            return dict(messages[0]["headers"]), messages[1]["body"]

        for path in ["/api/images", "/api/content"]:
            headers, body = asyncio.run(request(path))
            self.assertEqual(headers[b"content-encoding"], b"gzip")
            self.assertEqual(gzip.decompress(body), payload)
            self.assertLess(len(body), len(payload))
        for path, method, accepts in [
            ("/api/auth/me", "GET", True), ("/api/payments/admin/donations", "GET", True),
            ("/api/submissions", "GET", True), ("/api/images", "POST", True),
            ("/api/images", "GET", False),
        ]:
            headers, body = asyncio.run(request(path, method, accepts))
            self.assertNotIn(b"content-encoding", headers)
            self.assertEqual(body, payload)
