create table public.company (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
  name text not null default 'Company Name'::text,
  email text not null default auth.email (),
  expiry_date date not null,
  constraint company_pkey primary key (id),
  constraint company_email_key unique (email)
) TABLESPACE pg_default;
