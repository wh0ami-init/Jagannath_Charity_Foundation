# Backend startup and Railway deployment

Startup now loads the seed records in three SELECT queries (previously up to
247 with the current seed list). Unchanged seed photos are compared before
copying, preserving file timestamps and HTTP validators across restarts.
Administrator uploads, edited text, and gallery deletion markers remain intact.
Schema compatibility checks run during application startup, before readiness,
rather than when the application module is imported.

GET `/api/images` and `/api/content` support gzip when the client accepts it.
Compression is limited to these public catalogues: authentication, payment,
submission, and other private responses are excluded. No application response
cache was introduced, so admin changes remain visible on the next request.

## Railway checks before and after deployment

- Use `/api/health` as the deployment healthcheck. The application completes its
  schema checks and seeding before serving it.
- Check whether **Serverless** is enabled in the backend service settings.
  Railway documents that waking a sleeping service delays the first request.
  For consistently responsive first visits, disable Serverless if the additional
  idle compute cost is acceptable. Code optimizations cannot remove host wake-up
  time. See https://docs.railway.com/deployments/serverless.
- Place the API and database in the same region and use Railway private networking
  for the database where supported. Keep database credentials exclusively in
  backend environment variables; never in VITE variables or source control.
- Keep the uploads directory on the configured persistent volume. Seed recovery
  cannot recover a custom upload lost with an ephemeral filesystem.
- Keep the existing single-worker configuration unless rate limiting and other
  process-local state are migrated to shared storage. Increasing workers alone
  can multiply database connections and weaken per-process rate limits.

The backend logs `Startup ready: schema=... seed=... total=...` after successful
initialization, without credentials or donor data. These times measure application
initialization, not Railway provisioning or network connection time. Compare them
across deployments, and measure the first request after inactivity separately from
subsequent requests. Public measurements before these changes were approximately
1.12 s for health and 1.46 s for images from the development machine; these are
single network samples, not a cold-start benchmark or a latency guarantee.

## Local checks

From `backend`, using an environment with `requirements.txt` installed:

```sh
python -m unittest discover -s tests -q
```

The startup regression uses an isolated SQLite database and temporary photo
directories. It checks bounded query counts, unchanged file handling, updated and
missing seed recovery, and preservation of administrator changes and deletions.
Compression checks verify content integrity and exclusion of private endpoints.
