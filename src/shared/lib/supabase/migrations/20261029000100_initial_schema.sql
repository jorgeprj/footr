
-- Footr MVP 0.1
-- Migration: Initial schema
-- Tables: stores, store_members, products, sales, sale_items

begin;

-- =========================================================
-- 1. STORES
-- =========================================================

create table public.stores (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(trim(name)) > 0),
    slug text unique,
    owner_user_id uuid not null references auth.users(id) on delete restrict,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =========================================================
-- 2. STORE MEMBERS
-- =========================================================

create table public.store_members (
    id uuid primary key default gen_random_uuid(),
    store_id uuid not null references public.stores(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null default 'staff'
        check (role in ('owner', 'admin', 'staff')),
    created_at timestamptz not null default now(),

    constraint store_members_store_user_unique
        unique (store_id, user_id)
);

-- =========================================================
-- 3. PRODUCTS
-- One physical shirt per product record.
-- =========================================================

create table public.products (
    id uuid primary key default gen_random_uuid(),
    store_id uuid not null references public.stores(id) on delete restrict,

    footr_code text not null unique,
    team_name text not null check (char_length(trim(team_name)) > 0),
    season text not null,
    text NOT NULL DEFAULT 'Home' check (char_length(trim(type)) > 0),
    version text not null,
    size text not null,

    cost_price numeric(12, 2) not null check (cost_price >= 0),
    sale_price numeric(12, 2) not null check (sale_price >= 0),

    status text not null default 'available'
        check (status in ('available', 'sold', 'archived')),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =========================================================
-- 4. SALES
-- One payment method per sale in MVP 0.1.
-- =========================================================

create table public.sales (
    id uuid primary key default gen_random_uuid(),
    store_id uuid not null references public.stores(id) on delete restrict,

    sale_number bigint generated always as identity unique,
    customer_name text,

    payment_method text not null
        check (
            payment_method in (
                'installment',
                'credit',
                'debit',
                'pix',
                'cash'
            )
        ),

    status text not null default 'completed'
        check (
            status in (
                'pending',
                'completed',
                'cancelled',
                'refunded'
            )
        ),

    subtotal numeric(12, 2) not null default 0
        check (subtotal >= 0),
    discount_amount numeric(12, 2) not null default 0
        check (discount_amount >= 0),
    total_amount numeric(12, 2) not null default 0
        check (total_amount >= 0),

    sold_at timestamptz not null default now(),
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint sales_total_consistency
        check (total_amount = subtotal - discount_amount),

    constraint sales_discount_limit
        check (discount_amount <= subtotal)
);

-- =========================================================
-- 5. SALE ITEMS
-- Snapshot values preserve the sale history.
-- =========================================================

create table public.sale_items (
    id uuid primary key default gen_random_uuid(),
    store_id uuid not null references public.stores(id) on delete restrict,
    sale_id uuid not null references public.sales(id) on delete restrict,
    product_id uuid not null references public.products(id) on delete restrict,

    product_code_snapshot text not null,
    product_description_snapshot text not null,

    unit_cost_snapshot numeric(12, 2) not null
        check (unit_cost_snapshot >= 0),
    unit_price numeric(12, 2) not null
        check (unit_price >= 0),
    discount_amount numeric(12, 2) not null default 0
        check (discount_amount >= 0),
    line_total numeric(12, 2) not null
        check (line_total >= 0),

    created_at timestamptz not null default now(),

    constraint sale_items_discount_limit
        check (discount_amount <= unit_price),

    constraint sale_items_line_total_consistency
        check (line_total = unit_price - discount_amount)
);

-- =========================================================
-- 6. INDEXES
-- =========================================================

create index products_store_status_idx
    on public.products (store_id, status);

create index products_team_season_idx
    on public.products (store_id, team_name, season);

create index sales_store_sold_at_idx
    on public.sales (store_id, sold_at desc);

create index sales_store_status_idx
    on public.sales (store_id, status);

create index sale_items_sale_id_idx
    on public.sale_items (sale_id);

create index sale_items_store_id_idx
    on public.sale_items (store_id);

create index store_members_user_id_idx
    on public.store_members (user_id);

-- =========================================================
-- 7. ACCESS CONTROL HELPERS
-- SECURITY DEFINER avoids recursive RLS checks.
-- =========================================================

create or replace function public.is_store_member(p_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.stores s
        where s.id = p_store_id
          and s.owner_user_id = (select auth.uid())
    )
    or exists (
        select 1
        from public.store_members sm
        where sm.store_id = p_store_id
          and sm.user_id = (select auth.uid())
    );
$$;

create or replace function public.is_store_owner(p_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.stores s
        where s.id = p_store_id
          and s.owner_user_id = (select auth.uid())
    );
$$;

revoke all on function public.is_store_member(uuid) from public;
revoke all on function public.is_store_owner(uuid) from public;

grant execute on function public.is_store_member(uuid) to authenticated;
grant execute on function public.is_store_owner(uuid) to authenticated;

-- =========================================================
-- 8. ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.stores enable row level security;
alter table public.store_members enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

-- STORES

create policy stores_select_member
on public.stores
for select to authenticated
using (public.is_store_member(id));

create policy stores_insert_owner
on public.stores
for insert to authenticated
with check (owner_user_id = (select auth.uid()));

create policy stores_update_owner
on public.stores
for update to authenticated
using (public.is_store_owner(id))
with check (public.is_store_owner(id));

-- STORE MEMBERS

create policy store_members_select_member
on public.store_members
for select to authenticated
using (public.is_store_member(store_id));

create policy store_members_insert_owner
on public.store_members
for insert to authenticated
with check (public.is_store_owner(store_id));

create policy store_members_update_owner
on public.store_members
for update to authenticated
using (public.is_store_owner(store_id))
with check (public.is_store_owner(store_id));

create policy store_members_delete_owner
on public.store_members
for delete to authenticated
using (public.is_store_owner(store_id));

-- PRODUCTS

create policy products_select_member
on public.products
for select to authenticated
using (public.is_store_member(store_id));

create policy products_insert_member
on public.products
for insert to authenticated
with check (public.is_store_member(store_id));

create policy products_update_member
on public.products
for update to authenticated
using (public.is_store_member(store_id))
with check (public.is_store_member(store_id));

-- Intentionally no direct DELETE policy for products.
-- Archive products instead of deleting their history.

-- SALES

create policy sales_select_member
on public.sales
for select to authenticated
using (public.is_store_member(store_id));

create policy sales_insert_member
on public.sales
for insert to authenticated
with check (public.is_store_member(store_id));

create policy sales_update_member
on public.sales
for update to authenticated
using (public.is_store_member(store_id))
with check (public.is_store_member(store_id));

-- Intentionally no direct DELETE policy for sales.

-- SALE ITEMS

create policy sale_items_select_member
on public.sale_items
for select to authenticated
using (public.is_store_member(store_id));

create policy sale_items_insert_member
on public.sale_items
for insert to authenticated
with check (public.is_store_member(store_id));

-- Intentionally no direct UPDATE or DELETE policy for sale items.

commit;
