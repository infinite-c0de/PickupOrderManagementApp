-- Pickup Order App - Phase 1 schema (SQLite).
-- Applied by src/main/database/db.ts when the SQLite backend is wired up.

CREATE TABLE IF NOT EXISTS customers (
  id          TEXT PRIMARY KEY,
  qb_id       TEXT,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  alt_phone   TEXT,
  email       TEXT,
  address1    TEXT NOT NULL,
  address2    TEXT,
  city        TEXT,
  state       TEXT,
  zip         TEXT,
  notes       TEXT,
  last_synced TEXT
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);

CREATE TABLE IF NOT EXISTS pickup_orders (
  id              TEXT PRIMARY KEY,
  customer_id     TEXT,
  customer_name   TEXT NOT NULL,
  phone           TEXT,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  zip             TEXT,
  coats           INTEGER NOT NULL DEFAULT 1,
  pickup_location TEXT,
  instructions    TEXT,
  scheduled_date  TEXT,
  scheduled_time  TEXT,
  driver          TEXT,
  priority        TEXT,
  payment_status  TEXT,
  amount          REAL,
  payment_notes   TEXT,
  internal_notes  TEXT,
  driver_notes    TEXT,
  status          TEXT NOT NULL DEFAULT 'Draft',
  created_by      TEXT,
  created_at      TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers (id)
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON pickup_orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON pickup_orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON pickup_orders (scheduled_date);

CREATE TABLE IF NOT EXISTS sync_runs (
  id        TEXT PRIMARY KEY,
  datetime  TEXT NOT NULL,
  status    TEXT NOT NULL,
  imported  INTEGER NOT NULL DEFAULT 0,
  errors    INTEGER NOT NULL DEFAULT 0,
  notes     TEXT
);
