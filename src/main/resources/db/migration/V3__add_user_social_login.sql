-- =========================================================================
-- V3: Social-login support (Google for now; Facebook/Apple slot in here too).
--
-- google_id is the stable Google "sub" claim; we never trust the email alone
-- because Google can change a user's primary email. avatar_url is cached so
-- the UI does not need a second round-trip to Google's userinfo endpoint.
-- =========================================================================

ALTER TABLE users
    ADD COLUMN google_id   VARCHAR(64),
    ADD COLUMN avatar_url  VARCHAR(500);

-- Lookup path used by the social-login endpoint (find user by Google sub).
CREATE UNIQUE INDEX uk_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
