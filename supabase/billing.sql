-- Apply AFTER payments.sql. Additive; does not grant anyone billing access.
begin;
create table if not exists public.billing_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.billing_users enable row level security;
revoke all on public.billing_users from public, anon, authenticated;
grant select on public.billing_users to service_role;
alter table public.payment_orders add column if not exists delivery_status text not null default 'not_started'
  check (delivery_status in ('not_started','in_progress','delivered','revisions_requested','completed'));
alter table public.payment_orders add column if not exists delivery_version integer not null default 0;
alter table public.payment_orders add column if not exists payment_review boolean not null default false;
create table if not exists public.billing_order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.payment_orders(id),
  action text not null,
  actor text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists billing_events_order_date on public.billing_order_events(order_id,created_at desc);
create index if not exists billing_orders_mode_date on public.payment_orders(mode,created_at desc,id desc);
alter table public.billing_order_events enable row level security;
revoke all on public.billing_order_events from public, anon, authenticated;
grant select, insert on public.billing_order_events to service_role;
grant usage, select on sequence public.billing_order_events_id_seq to service_role;

create or replace function public.billing_create_order(
 p_id uuid,p_actor uuid,p_hash text,p_email text,p_title text,p_scope text,p_terms text,
 p_amount bigint,p_currency text,p_mode text,p_expires timestamptz
) returns void language plpgsql security invoker set search_path='' as $$
declare n integer; target public.payment_orders;
begin
 if not exists(select 1 from public.billing_users where user_id=p_actor and active) then raise exception 'Billing access required'; end if;
 if p_expires<=now() then raise exception 'Expiry must be in the future'; end if;
 insert into public.payment_orders(id,access_hash,order_number,customer_email,title,scope,terms,amount_minor,currency,mode,reference,expires_at)
 values(p_id,p_hash,'CC-'||upper(replace(p_id::text,'-','')),p_email,p_title,p_scope,p_terms,p_amount,p_currency,p_mode,'cc-'||p_mode||'-'||p_id::text,p_expires)
 on conflict(id) do nothing;
 get diagnostics n=row_count;
 if n=0 then
  select * into target from public.payment_orders where id=p_id;
  if (target.access_hash,target.customer_email,target.title,target.scope,target.terms,target.amount_minor,target.currency,target.mode,target.expires_at)
   is distinct from (p_hash,p_email,p_title,p_scope,p_terms,p_amount,p_currency,p_mode,p_expires)
  then raise exception 'Order already exists with different details'; end if;
 else
  insert into public.billing_order_events(order_id,action,actor,note) values(p_id,'Order created',p_actor::text,'Agreed scope and payment terms saved');
 end if;
end; $$;

create or replace function public.billing_update_delivery(p_id uuid,p_actor uuid,p_status text,p_version integer,p_note text)
returns void language plpgsql security invoker set search_path='' as $$
declare previous text;
begin
 if not exists(select 1 from public.billing_users where user_id=p_actor and active) then raise exception 'Billing access required'; end if;
 if p_status not in ('not_started','in_progress','delivered','revisions_requested','completed') or length(trim(p_note)) not between 1 and 2000 then raise exception 'Invalid update'; end if;
 select delivery_status into previous from public.payment_orders where id=p_id and delivery_version=p_version for update;
 if not found then raise exception 'Order changed; refresh before editing'; end if;
 update public.payment_orders set delivery_status=p_status,delivery_version=delivery_version+1 where id=p_id;
 insert into public.billing_order_events(order_id,action,actor,note) values(p_id,'Delivery: '||previous||' → '||p_status,p_actor::text,p_note);
end; $$;

create or replace function public.billing_set_review(p_id uuid,p_actor uuid,p_review boolean,p_note text)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from public.billing_users where user_id=p_actor and active) then raise exception 'Billing access required'; end if;
 if p_review is null or length(trim(p_note)) not between 1 and 2000 then raise exception 'A review note is required'; end if;
 update public.payment_orders set payment_review=p_review where id=p_id;
 if not found then raise exception 'Order not found'; end if;
 insert into public.billing_order_events(order_id,action,actor,note) values(p_id,case when p_review then 'Payment review opened' else 'Payment review resolved' end,p_actor::text,p_note);
end; $$;

create or replace function public.billing_record_confirmation() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.status='paid' and old.status is distinct from new.status then
  insert into public.billing_order_events(order_id,action,actor,note) values(new.id,'Payment confirmed','Paystack verification','Reference: '||new.reference);
 end if;
 return new;
end; $$;
drop trigger if exists billing_record_confirmation on public.payment_orders;
create trigger billing_record_confirmation after update on public.payment_orders for each row execute function public.billing_record_confirmation();
revoke all on function public.billing_record_confirmation() from public,anon,authenticated;
revoke all on function public.billing_create_order(uuid,uuid,text,text,text,text,text,bigint,text,text,timestamptz) from public,anon,authenticated;
revoke all on function public.billing_update_delivery(uuid,uuid,text,integer,text) from public,anon,authenticated;
revoke all on function public.billing_set_review(uuid,uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.billing_create_order(uuid,uuid,text,text,text,text,text,bigint,text,text,timestamptz) to service_role;
grant execute on function public.billing_update_delivery(uuid,uuid,text,integer,text) to service_role;
grant execute on function public.billing_set_review(uuid,uuid,boolean,text) to service_role;
commit;
