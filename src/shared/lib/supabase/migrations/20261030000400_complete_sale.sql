create or replace function public.complete_sale(
    p_store_id uuid,
    p_product_ids uuid[],
    p_payment_method text,
    p_customer_name text default null,
    p_discount_type text default 'fixed',
    p_discount_value numeric default 0
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_sale_id uuid;
    v_subtotal numeric(12, 2);
    v_discount_amount numeric(12, 2);
    v_total_amount numeric(12, 2);
    v_product_count integer;
begin
    if auth.uid() is null then
        raise exception 'Usuário não autenticado.';
    end if;

    if not public.is_store_member(p_store_id) then
        raise exception 'Acesso não autorizado a esta loja.';
    end if;

    if p_product_ids is null
        or cardinality(p_product_ids) = 0 then
        raise exception 'Adicione pelo menos um produto à venda.';
    end if;

    if array_position(p_product_ids, null) is not null then
        raise exception 'Lista de produtos inválida.';
    end if;

    if cardinality(p_product_ids) <> (
        select count(distinct product_id)
        from unnest(p_product_ids) as product_id
    ) then
        raise exception 'Não é permitido adicionar o mesmo produto duas vezes.';
    end if;

    if p_payment_method not in (
        'installment',
        'credit',
        'debit',
        'pix',
        'cash'
    ) then
        raise exception 'Forma de pagamento inválida.';
    end if;

    if p_discount_type not in ('fixed', 'percentage') then
        raise exception 'Tipo de desconto inválido.';
    end if;

    if p_discount_value is null or p_discount_value < 0 then
        raise exception 'Valor de desconto inválido.';
    end if;

    if p_discount_type = 'percentage' and p_discount_value > 100 then
        raise exception 'O desconto percentual não pode ultrapassar 100%%.';
    end if;

    -- Bloqueia os produtos e garante que todos pertencem à loja.
    perform id
    from public.products
    where store_id = p_store_id
      and id = any(p_product_ids)
      and status = 'available'
    order by id
    for update;

    select count(*)
    into v_product_count
    from public.products
    where store_id = p_store_id
      and id = any(p_product_ids)
      and status = 'available';

    if v_product_count <> cardinality(p_product_ids) then
        raise exception 'Um ou mais produtos não estão disponíveis.';
    end if;

    select coalesce(sum(sale_price), 0)
    into v_subtotal
    from public.products
    where store_id = p_store_id
      and id = any(p_product_ids);

    if p_discount_type = 'percentage' then
        v_discount_amount := round(
            v_subtotal * (p_discount_value / 100),
            2
        );
    else
        v_discount_amount := least(
            round(p_discount_value, 2),
            v_subtotal
        );
    end if;

    v_total_amount := v_subtotal - v_discount_amount;

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
        v_discount_amount,
        v_total_amount,
        now(),
        auth.uid()
    )
    returning id into v_sale_id;

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
        p_store_id,
        v_sale_id,
        p.id,
        p.footr_code,
        p.team_name || ' — ' || p.season || ' — ' ||
            p.version || ' — ' || p.size,
        p.cost_price,
        p.sale_price,
        0,
        p.sale_price
    from public.products p
    where p.store_id = p_store_id
      and p.id = any(p_product_ids);

    update public.products
    set
        status = 'sold',
        updated_at = now()
    where store_id = p_store_id
      and id = any(p_product_ids);

    return v_sale_id;
end;
$$;
