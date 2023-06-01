CREATE TYPE audit_action_type AS ENUM ('insert', 'delete', 'update');

CREATE TABLE audit (
    id serial primary key,
    table_name text not null,
    record_pks text[],
    timestamp timestamp with time zone not null default current_timestamp,
    action audit_action_type NOT NULL,
    old_data jsonb,
    new_data jsonb,
    query text,
    access_token_codigo uuid
);

CREATE OR REPLACE FUNCTION jsonb_diff_val(val1 JSONB, val2 JSONB)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  v RECORD;
BEGIN
   result = val1;
   FOR v IN SELECT * FROM jsonb_each(val2) LOOP
     IF result @> jsonb_build_object(v.key,v.value)
        THEN result = result - v.key;
     ELSIF result ? v.key THEN CONTINUE;
     ELSE
        result = result || jsonb_build_object(v.key,'null');
     END IF;
   END LOOP;
   RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_table_pks(table_name NAME) RETURNS TEXT[] AS $$
    SELECT array_agg(attname::TEXT) as pks
        FROM pg_index
        JOIN pg_attribute ON attrelid = indrelid AND attnum = ANY(indkey) 
        WHERE indrelid = table_name::regclass AND indisprimary
        GROUP BY indrelid;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_record_pks(table_record jsonb, table_name NAME) RETURNS TEXT[] AS $$
    SELECT array_agg(table_record->pk::TEXT) FROM unnest(get_table_pks(table_name)) AS pk
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION audit_trigger() RETURNS trigger AS $$
declare
   TABLE_NAME TEXT := format('%I', TG_TABLE_NAME);
BEGIN
    if (TG_OP = 'UPDATE') then
        insert into audit (table_name, record_pks, action, old_data, new_data, query) 
            values (TABLE_NAME,get_record_pks(row_to_json(NEW)::jsonb, TABLE_NAME),'update',jsonb_diff_val(row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB),jsonb_diff_val(row_to_json(NEW)::JSONB, row_to_json(OLD)::JSONB),current_query());
        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        insert into audit (table_name, record_pks, action, old_data, query) 
            values (TABLE_NAME,get_record_pks(row_to_json(OLD)::jsonb, TABLE_NAME),'delete',row_to_json(OLD)::JSONB,current_query());
        RETURN OLD;
    elsif (TG_OP = 'INSERT') then
        insert into audit (table_name, record_pks, action, new_data, query) 
            values (TABLE_NAME,get_record_pks(row_to_json(NEW)::jsonb, TABLE_NAME),'insert',row_to_json(NEW)::JSONB,current_query());
        RETURN NEW;
    else
        RAISE WARNING '[AUDIT.IF_MODIFIED_FUNC] - Other action occurred: %, at %',TG_OP,now();
        RETURN NULL;
    end if;
END;
$$
LANGUAGE plpgsql;