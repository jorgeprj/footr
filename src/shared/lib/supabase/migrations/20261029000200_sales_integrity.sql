
-- Footr MVP 0.1
-- Migration: Sales integrity and atomic checkout

begin;

-- =========================================================
-- 1. COMPOSITE KEYS FOR STORE ISOLATION
-- Ensure sale items cannot reference records from other stores.
-- =========================================================

alter table public.products
    add constraint products_store_id_id_unique
    unique (store_id, id);

alter table public.sales
    add constraint sales_store_id_id_unique
    unique (store_id, id);

alter table public.sale_items
    add constraint sale_items_store_sale_fk
    foreign key (store_id, sale_id)
    references public.sales (store_id, id)
    on delete restrict;

alter table public.sale_items
    add constraint sale_items_store_product_fk
    foreign key (store_id, product_id)
    references public.products (store_id, id)
    on delete restrict;

-- =========================================================
-- 2. REMOVE DIRECT WRITES TO SALES AND SALE ITEMS
-- Checkout will write through the RPC below.
-- =========================================================

drop policy if exists sales_insert_member
    on public.sales;

drop policy if exists sales_update_member
    on public.sales;

drop policy if exists sale_items_insert_member
    on public.sale_items;

revoke insert, update, delete
    on public.sales
    from authenticated;

revoke insert, update, delete
    on public.sale_items
    from authenticated;

-- =========================================================
-- 3. ATOMIC CHECKOUT
-- Locks products to prevent concurrent double sales.
-- One physical shirt per product ID.
-- =========================================================

create or replace function public.complete_sale(
    p_store_id uuid,
    p_product_ids uuid[],
    p_payment_method text,
    p_customer_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_sale_id uuid;
    v_product_count integer;
    v_available_count integer;
    v_subtotal numeric(12, 2);
begin
    -- Authentication
    if (select auth.uid()) is null then
        raise exception 'Authentication required'
            using errcode = '42501';
    end if;

    -- Store membership
    if not public.is_store_member(p_store_id) then
        raise exception 'Store access denied'
            using errcode = '42501';
    end if;

    -- Validate the requested products
    if p_product_ids is null
       or cardinality(p_product_ids) = 0 then
        raise exception 'At least one product is required';
    end if;

    if array_position(p_product_ids, null) is not null then
        raise exception 'Product IDs cannot contain null values';
    end if;

    select count(distinct requested.id)
    into v_product_count
    from unnest(p_product_ids) as requested(id);

    if v_product_count <> cardinality(p_product_ids) then
        raise exception 'Duplicate products are not allowed';
    end if;

    if p_payment_method not in (
        'installment', 'credit', 'debit', 'pix', 'cash'
    ) then
        raise exception 'Invalid payment method';
    end if;

    -- Lock requested products in a stable order.
    -- Concurrent checkouts must wait for these locks.
    perform p.id
    from public.products p
    where p.store_id = p_store_id
      and p.id = any(p_product_ids)
    order by p.id
    for update;

    -- Every requested product must belong to this store
    -- and still be available.
    select count(*)
    into v_available_count
    from public.products p
    where p.store_id = p_store_id
      and p.id = any(p_product_ids)
      and p.status = 'available';

    if v_available_count <> cardinality(p_product_ids) then
        raise exception
            'One or more products are unavailable or do not belong to this store';
    end if;

    select coalesce(sum(p.sale_price), 0)::numeric(12, 2)
    into v_subtotal
    from public.products p
    where p.store_id = p_store_id
      and p.id = any(p_product_ids);

    -- Create the sale.
    insert into public.sales (
        store_id,
        customer_name,
        payment_method,
        status,
        subtotal,
        discount_amount,
        total_amount,
        sold_at,
        created_by
    )
    values (
        p_store_id,
        nullif(trim(p_customer_name), ''),
        p_payment_method,
        'completed',
        v_subtotal,
        0,
        v_subtotal,
        now(),
        (select auth.uid())
    )
    returning id into v_sale_id;

    -- Preserve the product and price information at checkout.
    insert into public.sale_items (
        store_id,
        sale_id,
        product_id,
        product_code_snapshot,
        product_description_snapshot,
        unit_cost_snapshot,
        unit_price,
        discount_amount,
        line_total
    )
    select
        p.store_id,
        v_sale_id,
        p.id,
        p.footr_code,
        concat_ws(
            ' — ',
            p.team_name,
            p.season,
            p.version,
            p.size
        ),
        p.cost_price,
        p.sale_price,
        0,
        p.sale_price
    from public.products p
    where p.store_id = p_store_id
      and p.id = any(p_product_ids);

    -- Mark the physical shirts as sold.
    update public.products
    set status = 'sold',
        updated_at = now()
    where store_id = p_store_id
      and id = any(p_product_ids);

    return v_sale_id;
end;
$$;

-- Only authenticated users can invoke checkout.
revoke all on function public.complete_sale(
    uuid, uuid[], text, text
) from public, anon;

grant execute on function public.complete_sale(
    uuid, uuid[], text, text
) to authenticated;

commit;
