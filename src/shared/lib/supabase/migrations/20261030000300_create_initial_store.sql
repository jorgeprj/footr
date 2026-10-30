CREATE OR REPLACE FUNCTION public.create_initial_store(
    p_store_name text
)
RETURNS TABLE (
    store_id uuid,
    store_slug text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
    v_store_name text;
    v_base_slug text;
    v_slug text;
    v_store_id uuid;
    v_suffix integer := 1;
BEGIN
    -- Identify the authenticated user.
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Validate store name.
    v_store_name := trim(p_store_name);

    IF v_store_name IS NULL OR v_store_name = '' THEN
        RAISE EXCEPTION 'Store name is required';
    END IF;

    IF char_length(v_store_name) > 100 THEN
        RAISE EXCEPTION 'Store name must have at most 100 characters';
    END IF;

    -- MVP: one initial store per user.
    IF EXISTS (
        SELECT 1
        FROM public.store_members AS sm
        WHERE sm.user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'User already belongs to a store';
    END IF;

    -- Normalize the store name into a URL-friendly slug.
    v_base_slug := lower(v_store_name);

    v_base_slug := translate(
        v_base_slug,
        'áàâãäåéèêëíìîïóòôõöúùûüçñ',
        'aaaaaaeeeeiiiiooooouuuucn'
    );

    v_base_slug := regexp_replace(v_base_slug, '[^a-z0-9]+', '-', 'g');
    v_base_slug := trim(both '-' from v_base_slug);
    v_base_slug := left(v_base_slug, 80);

    IF v_base_slug = '' THEN
        v_base_slug := 'loja';
    END IF;

    -- Insert with a unique slug. Retry with a numeric suffix on conflict.
    LOOP
        IF v_suffix = 1 THEN
            v_slug := v_base_slug;
        ELSE
            v_slug :=
                left(v_base_slug, 80 - length('-' || v_suffix::text))
                || '-'
                || v_suffix::text;
        END IF;

        INSERT INTO public.stores (
            name,
            slug,
            owner_user_id
        )
        VALUES (
            v_store_name,
            v_slug,
            v_user_id
        )
        ON CONFLICT (slug) DO NOTHING
        RETURNING id INTO v_store_id;

        EXIT WHEN v_store_id IS NOT NULL;

        v_suffix := v_suffix + 1;
    END LOOP;

    -- Register the user as the store owner.
    INSERT INTO public.store_members (
        store_id,
        user_id,
        role
    )
    VALUES (
        v_store_id,
        v_user_id,
        'owner'
    );

    store_id := v_store_id;
    store_slug := v_slug;

    RETURN NEXT;
END;
$$;

-- Only authenticated users can execute this operation.
REVOKE ALL ON FUNCTION public.create_initial_store(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_initial_store(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_initial_store(text) TO authenticated;