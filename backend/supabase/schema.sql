-- Supabase schema for Futuristia

-- Extension pour générer des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles are managed by Supabase Auth; create a profiles table to store extras
create table if not exists profiles (
  id uuid default gen_random_uuid(),
  phone text unique not null,
  display_name text,
  password text not null,
  balance numeric default 0,
  role text default 'user',
  created_at timestamptz default now(),
  primary key (id)
);

-- Products
create table if not exists products (
  id serial primary key,
  name text not null,
  price integer not null,
  duration text,
  daily_revenue integer,
  total_revenue integer,
  image text,
  created_at timestamptz default now()
);

-- Purchases
create table if not exists purchases (
  id serial primary key,
  user_id uuid references profiles(id) on delete set null,
  product_id integer references products(id) on delete set null,
  price integer not null,
  created_at timestamptz default now()
);

-- Notifications
create table if not exists notifications (
  id serial primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Simple function to attempt purchase atomically
create or replace function attempt_purchase(p_user uuid, p_product_id int)
returns text as $$
declare
  p_price int;
  user_balance numeric;
begin
  select price into p_price from products where id = p_product_id for update;
  select balance into user_balance from profiles where id = p_user for update;

  if user_balance is null then
    return 'no_profile';
  end if;

  if user_balance < p_price then
    return 'insufficient';
  end if;

  update profiles set balance = balance - p_price where id = p_user;
  insert into purchases(user_id, product_id, price) values (p_user, p_product_id, p_price);

  return 'ok';
end;
$$ language plpgsql;
