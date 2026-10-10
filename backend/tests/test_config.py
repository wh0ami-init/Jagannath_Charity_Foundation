import unittest

from pydantic import ValidationError

from app.config import Settings


class ProductionSettingsTests(unittest.TestCase):
    def settings(self, **changes):
        values = {
            "database_url": "mysql+mysqlconnector://user:password@localhost:3306/site",
            "jwt_secret": "production-test-secret-at-least-32-characters",
            "environment": "production",
            "cors_origins": "https://example.org",
        }
        values.update(changes)
        return Settings(**values, _env_file=None)

    def test_exact_https_origin_is_accepted(self):
        self.assertEqual(self.settings().cors_origin_list, ["https://example.org"])

    def test_wildcard_http_and_path_origins_are_rejected(self):
        for origin in ["*", "http://example.org", "https://example.org/path", "https://example.org/"]:
            with self.subTest(origin=origin), self.assertRaises(ValidationError):
                self.settings(cors_origins=origin)

    def test_production_requires_persistent_database(self):
        with self.assertRaises(ValidationError):
            self.settings(database_url="sqlite:///./app.db")


if __name__ == "__main__":
    unittest.main()
