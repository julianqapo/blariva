create table public.document (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
  updated_at timestamp with time zone null,
  id_company uuid null,
  name text not null,
  id_container uuid not null,
  path text not null,
  constraint document_pkey primary key (id),
  constraint document_id_company_fkey foreign KEY (id_company) references company (id) on update CASCADE on delete CASCADE,
  constraint document_id_container_fkey foreign KEY (id_container) references container (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;