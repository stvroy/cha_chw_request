-- Example: Only include schema and basic seed data here
CREATE TABLE IF NOT EXISTS chu (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  county VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS cha (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  chu_id INTEGER REFERENCES chu(id)
);

CREATE TABLE IF NOT EXISTS chw (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  cha_id INTEGER REFERENCES cha(id),
  approved BOOLEAN DEFAULT FALSE NOT NULL,
  rejected BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS commodities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  chw_id INTEGER REFERENCES chw(id),
  commodity_id INTEGER REFERENCES commodities(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity < 100),
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending',
  UNIQUE (chw_id, commodity_id, request_date)
);

-- Seed data
INSERT INTO commodities (name) VALUES
('Malaria Drugs'), ('Family Planning Items'), ('Zinc Tablets') 
ON CONFLICT DO NOTHING;

INSERT INTO chu (id, name, county) VALUES
  (1, 'CHU Nairobi West', 'Nairobi'),
  (2, 'CHU Mombasa Central', 'Mombasa'),
  (3, 'CHU Kisumu East', 'Kisumu'),
  (4, 'CHU Nakuru North', 'Nakuru'),
  (5, 'CHU Eldoret South', 'Uasin Gishu'),
  (6, 'CHU Thika', 'Kiambu'),
  (7, 'CHU Machakos East', 'Machakos'),
  (8, 'CHU Kakamega Central', 'Kakamega'),
  (9, 'CHU Meru North', 'Meru'),
  (10, 'CHU Garissa West', 'Garissa');

ALTER TABLE chw ADD COLUMN chu_id integer REFERENCES chu(id);

INSERT INTO cha (name, email, password_hash, chu_id) VALUES
('Alice Mwangi', 'alice.mwangi@example.com', '$2b$10$M7T.245vEsIRucPhTO75Ju2JVKJ3.pCo7HfSDtG3sjM9fOkOLP/YO', 1),
('Ben Otieno', 'ben.otieno@example.com', '$2b$10$enGjQVGzxSPEDA08wt9I3O9l6gbd3PprxXGhWwo7ohw79LRtAPTvi', 2),
('Clara Njeri', 'clara.njeri@example.com', '$2b$10$vxWXrC6uNCiwl6MwNbeGyeaDacvtd5cZrI7wmY1v2x3fwIE3qHr/S', 3),
('David Kamau', 'david.kamau@example.com', '$2b$10$BzzneqT3Z7GAM2ydtgTtAumFNrD8NmVV7PmGT2Vo/FuSmVGOlcn3a', 4),
('Esther Wambui', 'esther.wambui@example.com', '$2b$10$i4uQkQznT6/U/P0NWMZDReeslu4c26o5l1llZ8jTtfqiWbOP..3Vm', 5),
('Fredrick Njenga', 'fredrick.njenga@example.com', '$2b$10$.zUV6Wjwd/DOEdPmgxENuuc6EDcd430xoxV6vbxCTAoiH0bDjrnpO', 6),
('Grace Achieng', 'grace.achieng@example.com', '$2b$10$9J1zvNlC9kUVZBfiJBhzHujuYEGZNtPpOfCmEZlN67p9InxhEF7sW', 7),
('Henry Kiplagat', 'henry.kiplagat@example.com', '$2b$10$HWRENW4XnrouG6teI56NTO5y6u.05php4PARw2v5VsgAkJVFK8tcG', 8),
('Irene Chebet', 'irene.chebet@example.com', '$2b$10$mOeCi5Av58fwrzNBjiqmY.hk2SMvrOEG0XeSB8z9jaTIat.JIzNNS', 9),
('James Mwita', 'james.mwita@example.com', '$2b$10$6pDeL5SstzprEv.UUVdoXOgX9v8n7A2mSYKw0wIipSlKZvXVHOLKW', 10);