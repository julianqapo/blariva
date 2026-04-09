create table public.staff (
  id uuid not null default auth.uid (),
  created_at timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
  email text not null default auth.email (),
  id_company uuid not null,
  name text not null,
  constraint staff_pkey primary key (id),
  constraint staff_id_company_fkey foreign KEY (id_company) references company (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;