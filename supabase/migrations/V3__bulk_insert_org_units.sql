CREATE OR REPLACE FUNCTION bulk_insert_org_units(units_to_insert JSONB)
RETURNS JSONB AS $$
DECLARE
    unit_data JSONB;
    parent_id_val UUID;
    created_count INT := 0;
    error_list JSONB[] := ARRAY[]::JSONB[];
    new_units JSONB[] := ARRAY[]::JSONB[];
    existing_names TEXT[];
BEGIN
    -- Get all existing names in one query for efficiency
    SELECT array_agg(name) INTO existing_names FROM public.organizational_units;
    IF existing_names IS NULL THEN
        existing_names := ARRAY[]::TEXT[];
    END IF;

    -- Filter out units that already exist
    FOR unit_data IN SELECT * FROM jsonb_array_elements(units_to_insert)
    LOOP
        IF NOT (unit_data->>'name' = ANY(existing_names)) THEN
            new_units := array_append(new_units, unit_data);
        END IF;
    END LOOP;

    -- First pass: insert new units without a parent_name
    FOR unit_data IN SELECT * FROM unnest(new_units)
    LOOP
        -- Skip if it has a parent_name
        IF unit_data->>'parent_name' IS NOT NULL AND unit_data->>'parent_name' <> '' THEN
            CONTINUE;
        END IF;

        BEGIN
            INSERT INTO public.organizational_units (name, type, parent_id)
            VALUES (unit_data->>'name', unit_data->>'type', NULL);
            created_count := created_count + 1;
        EXCEPTION WHEN OTHERS THEN
            error_list := array_append(error_list, jsonb_build_object('name', unit_data->>'name', 'error', SQLERRM));
        END;
    END LOOP;

    -- Second pass: insert new units with a parent_name
    FOR unit_data IN SELECT * FROM unnest(new_units)
    LOOP
        -- Skip if it doesn't have a parent_name
        IF unit_data->>'parent_name' IS NULL OR unit_data->>'parent_name' = '' THEN
            CONTINUE;
        END IF;
        BEGIN
            -- The parent must now exist in the DB (either from before or from the first pass)
            SELECT id INTO parent_id_val FROM public.organizational_units WHERE name = (unit_data->>'parent_name') LIMIT 1;

            IF parent_id_val IS NULL THEN
                error_list := array_append(error_list, jsonb_build_object('name', unit_data->>'name', 'error', 'Parent unit not found: ' || (unit_data->>'parent_name')));
                CONTINUE;
            END IF;

            INSERT INTO public.organizational_units (name, type, parent_id)
            VALUES (unit_data->>'name', unit_data->>'type', parent_id_val);
            created_count := created_count + 1;

        EXCEPTION WHEN OTHERS THEN
            error_list := array_append(error_list, jsonb_build_object('name', unit_data->>'name', 'error', SQLERRM));
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'created_count', created_count,
        'updated_count', 0, -- We are no longer updating
        'errors', to_jsonb(error_list)
    );
END;
$$ LANGUAGE plpgsql;
