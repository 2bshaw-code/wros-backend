CREATE SCHEMA IF NOT EXISTS "FOUND_IT";

CREATE TABLE IF NOT EXISTS "FOUND_IT".platforms (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  scrape_method TEXT NOT NULL CHECK (scrape_method IN ('rss', 'html', 'playwright', 'ebay_api')),
  api_key TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "FOUND_IT".merchants (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  contact_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  location TEXT,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (platform, url)
);

CREATE TABLE IF NOT EXISTS "FOUND_IT".listings (
  id BIGSERIAL PRIMARY KEY,
  merchant_id BIGINT NOT NULL REFERENCES "FOUND_IT".merchants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  url TEXT NOT NULL,
  collection_location TEXT,
  posted_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'removed', 'exported')),
  fingerprint TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "FOUND_IT".scrape_runs (
  id BIGSERIAL PRIMARY KEY,
  platform_id BIGINT REFERENCES "FOUND_IT".platforms(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'skipped')),
  listings_seen INTEGER NOT NULL DEFAULT 0,
  listings_saved INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS found_it_listings_scraped_at_idx ON "FOUND_IT".listings(scraped_at DESC);
CREATE INDEX IF NOT EXISTS found_it_listings_status_idx ON "FOUND_IT".listings(status);
CREATE INDEX IF NOT EXISTS found_it_merchants_last_seen_idx ON "FOUND_IT".merchants(last_seen DESC);

INSERT INTO "FOUND_IT".platforms (name, base_url, scrape_method, active, config)
VALUES
  ('Freecycle', 'https://www.freecycle.org', 'rss', TRUE, '{"feedUrls": []}'::jsonb),
  ('eBay', 'https://www.ebay.co.uk', 'ebay_api', FALSE, '{"query": "free collection only"}'::jsonb),
  ('Vinted', 'https://www.vinted.co.uk', 'playwright', FALSE, '{"searchPath": "/catalog?search_text=giveaway"}'::jsonb),
  ('Gumtree Freebies', 'https://www.gumtree.com/for-sale/freebies/uk', 'html', FALSE, '{}'::jsonb)
ON CONFLICT (name) DO NOTHING;