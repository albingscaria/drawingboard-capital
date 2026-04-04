create schema if not exists "api";

do $$ begin
  create type "public"."eligibility_enum" as enum ('not_submitted', 'pending_approval', 'approved', 'denied');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type "public"."investor_type_enum" as enum ('institutional', 'intermediary', 'individual');
exception when duplicate_object then null;
end $$;

create table if not exists "public"."companies" (
    "id" uuid not null default gen_random_uuid(),
    "created_by" uuid,
    "company_name" text not null,
    "company_website" text not null,
    "created_at" timestamp with time zone not null default now(),
    "country" text not null,
    "zip_code" text not null
);

alter table "public"."companies" enable row level security;

create table if not exists "public"."fund_managers" (
    "firm_id" integer not null,
    "primary_region_focus" character varying(255),
    "fund_manager" character varying(255),
    "fund_structure" character varying(255),
    "domicile" character varying(255),
    "single_deal_fund" character varying(255),
    "lifespan_extension" character varying(255),
    "solely_financed_by" character varying(255),
    "target_irr_net_min" character varying(255),
    "target_irr_net_max" character varying(255),
    "target_irr_gross_min" character varying(255),
    "co_investment_capital_amount_curr_mn" character varying(255),
    "co_investment_capital_amount_usd_mn" character varying(255),
    "co_investment_capital_amount_eur_mn" character varying(255),
    "region" character varying(255),
    "address" text,
    "city" character varying(255),
    "state" character varying(255),
    "zip_code" character varying(50),
    "country" character varying(255),
    "website" character varying(255),
    "email" character varying(255),
    "tel" character varying(100),
    "fax" character varying(100),
    "secondary_locations" text,
    "subscription_credit_facility" character varying(255),
    "private_wealth" character varying(50),
    "fund_manager_total_aum_curr_mn" character varying(255),
    "fund_manager_total_aum_usd_mn" character varying(255),
    "fund_manager_total_aum_eur_mn" character varying(255),
    "logo" text
);

alter table "public"."fund_managers" enable row level security;

create table if not exists "public"."funds" (
    "fund_id" bigint not null,
    "name" text,
    "firm_id" bigint,
    "details" jsonb
);

alter table "public"."funds" enable row level security;

create table if not exists "public"."profiles" (
    "id" uuid not null,
    "stage" text default 'MVP'::text,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "first_name" text,
    "last_name" text,
    "investor_type" investor_type_enum,
    "phone_number" text,
    "company_id" uuid,
    "eligibility" eligibility_enum not null default 'not_submitted'::eligibility_enum
);

alter table "public"."profiles" enable row level security;

CREATE UNIQUE INDEX IF NOT EXISTS companies_created_by_key ON public.companies USING btree (created_by);
CREATE UNIQUE INDEX IF NOT EXISTS companies_pkey ON public.companies USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS fund_managers_pkey ON public.fund_managers USING btree (firm_id);
CREATE UNIQUE INDEX IF NOT EXISTS funds_pkey ON public.funds USING btree (fund_id);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_pkey ON public.profiles USING btree (id);

do $$ begin
  alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";
exception when others then null;
end $$;

do $$ begin
  alter table "public"."fund_managers" add constraint "fund_managers_pkey" PRIMARY KEY using index "fund_managers_pkey";
exception when others then null;
end $$;

do $$ begin
  alter table "public"."funds" add constraint "funds_pkey" PRIMARY KEY using index "funds_pkey";
exception when others then null;
end $$;

do $$ begin
  alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";
exception when others then null;
end $$;

do $$ begin
  alter table "public"."companies" add constraint "companies_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(id) ON UPDATE CASCADE not valid;
exception when others then null;
end $$;
alter table "public"."companies" validate constraint "companies_created_by_fkey";

do $$ begin
  alter table "public"."companies" add constraint "companies_created_by_key" UNIQUE using index "companies_created_by_key";
exception when others then null;
end $$;

do $$ begin
  alter table "public"."funds" add constraint "funds_firm_id_fkey" FOREIGN KEY (firm_id) REFERENCES fund_managers(firm_id) not valid;
exception when others then null;
end $$;
alter table "public"."funds" validate constraint "funds_firm_id_fkey";

do $$ begin
  alter table "public"."profiles" add constraint "profiles_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;
exception when others then null;
end $$;
alter table "public"."profiles" validate constraint "profiles_company_id_fkey";

do $$ begin
  alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;
exception when others then null;
end $$;
alter table "public"."profiles" validate constraint "profiles_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$function$;

grant delete on table "public"."companies" to "anon";
grant insert on table "public"."companies" to "anon";
grant references on table "public"."companies" to "anon";
grant select on table "public"."companies" to "anon";
grant trigger on table "public"."companies" to "anon";
grant truncate on table "public"."companies" to "anon";
grant update on table "public"."companies" to "anon";
grant delete on table "public"."companies" to "authenticated";
grant insert on table "public"."companies" to "authenticated";
grant references on table "public"."companies" to "authenticated";
grant select on table "public"."companies" to "authenticated";
grant trigger on table "public"."companies" to "authenticated";
grant truncate on table "public"."companies" to "authenticated";
grant update on table "public"."companies" to "authenticated";
grant delete on table "public"."companies" to "service_role";
grant insert on table "public"."companies" to "service_role";
grant references on table "public"."companies" to "service_role";
grant select on table "public"."companies" to "service_role";
grant trigger on table "public"."companies" to "service_role";
grant truncate on table "public"."companies" to "service_role";
grant update on table "public"."companies" to "service_role";

grant delete on table "public"."fund_managers" to "anon";
grant insert on table "public"."fund_managers" to "anon";
grant references on table "public"."fund_managers" to "anon";
grant select on table "public"."fund_managers" to "anon";
grant trigger on table "public"."fund_managers" to "anon";
grant truncate on table "public"."fund_managers" to "anon";
grant update on table "public"."fund_managers" to "anon";
grant delete on table "public"."fund_managers" to "authenticated";
grant insert on table "public"."fund_managers" to "authenticated";
grant references on table "public"."fund_managers" to "authenticated";
grant select on table "public"."fund_managers" to "authenticated";
grant trigger on table "public"."fund_managers" to "authenticated";
grant truncate on table "public"."fund_managers" to "authenticated";
grant update on table "public"."fund_managers" to "authenticated";
grant delete on table "public"."fund_managers" to "service_role";
grant insert on table "public"."fund_managers" to "service_role";
grant references on table "public"."fund_managers" to "service_role";
grant select on table "public"."fund_managers" to "service_role";
grant trigger on table "public"."fund_managers" to "service_role";
grant truncate on table "public"."fund_managers" to "service_role";
grant update on table "public"."fund_managers" to "service_role";

grant delete on table "public"."funds" to "anon";
grant insert on table "public"."funds" to "anon";
grant references on table "public"."funds" to "anon";
grant select on table "public"."funds" to "anon";
grant trigger on table "public"."funds" to "anon";
grant truncate on table "public"."funds" to "anon";
grant update on table "public"."funds" to "anon";
grant delete on table "public"."funds" to "authenticated";
grant insert on table "public"."funds" to "authenticated";
grant references on table "public"."funds" to "authenticated";
grant select on table "public"."funds" to "authenticated";
grant trigger on table "public"."funds" to "authenticated";
grant truncate on table "public"."funds" to "authenticated";
grant update on table "public"."funds" to "authenticated";
grant delete on table "public"."funds" to "service_role";
grant insert on table "public"."funds" to "service_role";
grant references on table "public"."funds" to "service_role";
grant select on table "public"."funds" to "service_role";
grant trigger on table "public"."funds" to "service_role";
grant truncate on table "public"."funds" to "service_role";
grant update on table "public"."funds" to "service_role";

grant delete on table "public"."profiles" to "anon";
grant insert on table "public"."profiles" to "anon";
grant references on table "public"."profiles" to "anon";
grant select on table "public"."profiles" to "anon";
grant trigger on table "public"."profiles" to "anon";
grant truncate on table "public"."profiles" to "anon";
grant update on table "public"."profiles" to "anon";
grant delete on table "public"."profiles" to "authenticated";
grant insert on table "public"."profiles" to "authenticated";
grant references on table "public"."profiles" to "authenticated";
grant select on table "public"."profiles" to "authenticated";
grant trigger on table "public"."profiles" to "authenticated";
grant truncate on table "public"."profiles" to "authenticated";
grant update on table "public"."profiles" to "authenticated";
grant delete on table "public"."profiles" to "service_role";
grant insert on table "public"."profiles" to "service_role";
grant references on table "public"."profiles" to "service_role";
grant select on table "public"."profiles" to "service_role";
grant trigger on table "public"."profiles" to "service_role";
grant truncate on table "public"."profiles" to "service_role";
grant update on table "public"."profiles" to "service_role";

do $$ begin
  create policy "Enable insert for authenticated users only"
  on "public"."companies" as permissive for insert to authenticated with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Enable users to view their own data only"
  on "public"."companies" as permissive for select to authenticated
  using ((( SELECT auth.uid() AS uid) = created_by));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Enable read access for all users"
  on "public"."fund_managers" as permissive for select to public using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Enable read access for all users"
  on "public"."funds" as permissive for select to public using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can read their own profile"
  on "public"."profiles" as permissive for select to public using ((auth.uid() = id));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their own profile"
  on "public"."profiles" as permissive for update to public using ((auth.uid() = id));
exception when duplicate_object then null;
end $$;
