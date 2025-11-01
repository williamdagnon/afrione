-- Seed data for development

-- Example product rows
insert into products (name, price, duration, daily_revenue, total_revenue, image) values
('APUIC CAPITAL 001', 2000, '60 jours', 300, 18000, 'https://i.postimg.cc/8PGC424C/Whats-App-Image-2025-10-06-12-30-49-52596226.jpg'),
('APUIC CAPITAL 002', 6000, '60 jours', 930, 55800, 'https://i.postimg.cc/8PGC424C/Whats-App-Image-2025-10-06-12-30-49-52596226.jpg'),
('APUIC CAPITAL 003', 15000, '60 jours', 2400, 144000, 'https://i.postimg.cc/8PGC424C/Whats-App-Image-2025-10-06-12-30-49-52596226.jpg');

-- Note: profiles will be created when users sign up with Supabase Auth. You can manually create profiles by inserting rows with the auth user UUID.
