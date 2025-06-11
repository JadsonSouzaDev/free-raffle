CREATE TABLE IF NOT EXISTS users (
  whatsapp VARCHAR(14) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  img_url TEXT,
  roles TEXT [] DEFAULT '{}',
  password TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raffles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  images_urls TEXT [],
  description TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  hidden BOOLEAN DEFAULT false,
  pre_quantity_numbers INTEGER [] DEFAULT ARRAY [25,50,100,200,300,500],
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER DEFAULT 999999,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raffles_flags (
  id UUID PRIMARY KEY REFERENCES raffles(id),
  flag_top_buyers BOOLEAN DEFAULT false,
  flag_top_buyers_week BOOLEAN DEFAULT false,
  flag_top_buyers_day BOOLEAN DEFAULT false,
  flag_lowest_quota BOOLEAN DEFAULT false,
  flag_highest_quota BOOLEAN DEFAULT false,
  flag_progress BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raffles_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID REFERENCES raffles(id),
  price DECIMAL NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS raffles_awarded_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID REFERENCES raffles(id),
  user_id VARCHAR(14) REFERENCES users(whatsapp),
  gift VARCHAR(255) NOT NULL,
  reference_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID REFERENCES raffles(id),
  user_id VARCHAR(14) REFERENCES users(whatsapp),
  quotas_quantity INTEGER NOT NULL,
  status VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  gateway VARCHAR(255) NOT NULL,
  gateway_id VARCHAR(255) NOT NULL,
  gateway_url TEXT,
  gateway_qrcode TEXT,
  gateway_qrcode_base64 TEXT,
  amount DECIMAL NOT NULL,
  status VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID REFERENCES raffles(id),
  order_id UUID REFERENCES orders(id),
  serial_number INTEGER NOT NULL,
  status VARCHAR(255) NOT NULL,
  raffle_awarded_quote_id UUID REFERENCES raffles_awarded_quotes(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE
  raffles
ADD
  COLUMN winner_quota_id UUID REFERENCES quotas(id);