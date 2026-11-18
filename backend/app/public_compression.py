"""Compress only public catalogue responses; exclude sessions and private data."""
from starlette.middleware.gzip import GZipMiddleware


class PublicCatalogueCompression:
    def __init__(self, app):
        self.app = app
        self.compressed = GZipMiddleware(app, minimum_size=1000, compresslevel=5)

    async def __call__(self, scope, receive, send):
        public_get = (
            scope["type"] == "http"
            and scope.get("method") == "GET"
            and scope.get("path") in {"/api/images", "/api/content"}
        )
        await (self.compressed if public_get else self.app)(scope, receive, send)
