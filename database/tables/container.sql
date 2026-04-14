create table public.container (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  id_company uuid not null,
  counter smallint not null default '0'::smallint,
  constraint container_pkey primary key (id),
  constraint container_id_company_fkey foreign KEY (id_company) references company (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;