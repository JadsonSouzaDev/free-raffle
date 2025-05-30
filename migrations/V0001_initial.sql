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
  images_urls TEXT[],
  description TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  main_winner_id VARCHAR(14) REFERENCES users(whatsapp),
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
  reference_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);