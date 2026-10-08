from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: str = ""
    environment: str = "development"

    # Admin session cookie. Blank SameSite = "none" in production (frontend and API on
    # different sites, e.g. vercel.app + railway.app), "lax" otherwise. Use "lax" or
    # "strict" if the frontend and API share a site (e.g. www.example.org + api.example.org).
    cookie_samesite: str = ""
    cookie_secure: bool | None = None  # default: on in production

    # Number of reverse proxies in front of the API (Railway = 1). Blank = 1 in production, 0 otherwise.
    trusted_proxy_count: int | None = None

    # Rate limits
    login_ip_limit: int = 10
    login_user_failure_limit: int = 10
    login_window_seconds: int = 900
    form_ip_limit: int = 10
    form_window_seconds: int = 900

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore", env_ignore_empty=True)

    @field_validator("jwt_secret")
    @classmethod
    def validate_jwt_secret(cls, value: str) -> str:
        if len(value) < 32 or value in {"replace-with-a-long-random-secret-before-running", "dev-secret-change-me"}:
            raise ValueError("JWT_SECRET must be a unique random secret of at least 32 characters")
        return value

    @field_validator("cookie_samesite")
    @classmethod
    def validate_samesite(cls, value: str) -> str:
        value = value.strip().lower()
        if value not in {"", "lax", "strict", "none"}:
            raise ValueError("COOKIE_SAMESITE must be lax, strict, none, or empty")
        return value

    @model_validator(mode="after")
    def validate_production_settings(self):
        if self.environment.lower() == "production":
            if self.database_url.startswith(("sqlite")):
                raise ValueError("Production deployments require a persistent database, not SQLite")
            if not self.cors_origin_list:
                raise ValueError("CORS_ORIGINS must contain the production frontend origin")
        return self

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def cookie_samesite_value(self) -> str:
        return self.cookie_samesite or ("none" if self.is_production else "lax")

    @property
    def cookie_secure_value(self) -> bool:
        if self.cookie_samesite_value == "none":
            return True  # browsers reject SameSite=None cookies that are not Secure
        return self.cookie_secure if self.cookie_secure is not None else self.is_production

    @property
    def trusted_proxies(self) -> int:
        if self.trusted_proxy_count is not None:
            return max(0, self.trusted_proxy_count)
        return 1 if self.is_production else 0


settings = Settings()
