create table public.staff_pending_signup (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
  email text not null,
  id_company uuid not null,
  constraint staff_pending_signup_pkey primary key (id),
  constraint staff_pending_signup_id_company_fkey foreign KEY (id_company) references company (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;