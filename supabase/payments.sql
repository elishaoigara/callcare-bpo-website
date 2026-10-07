-- Additive payment preparation. Run on a separate TEST project first.
-- Does not alter recruitment tables, users, policies, or applications.
begin;
create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  access_hash text not null unique check (access_hash ~ '^[a-f0-9]{64}$'),
  order_number text not null unique,
  customer_email text not null,
  title text not null check (length(title) between 1 and 160),
  scope text not null check (length(scope) between 1 and 10000),
  terms text not null check (length(terms) between 1 and 10000),
  amount_minor bigint not null check (amount_minor between 100 and 1000000000),
  currency text not null check (currency in ('KES', 'USD')),
  mode text not null check (mode in ('test', 'live')),
  status text not null default 'awaiting_payment' check (status in ('awaiting_payment','paid')),
  reference text not null unique,
  expires_at timestamptz not null,
  checkout_url text,
  initialization_started_at timestamptz,
  terms_accepted_at timestamptz,
  paid_at timestamptz,
  transaction_id text unique,
  created_at timestamptz not null default now(),
  check ((status = 'paid') = (paid_at is not null and transaction_id is not null))
);
alter table public.payment_orders enable row level security;
revoke all on public.payment_orders from public, anon, authenticated;
grant select, insert, update on public.payment_orders to service_role;

-- Keep an immutable snapshot once checkout has started. Price changes need a new order.
create or replace function public.protect_payment_order() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if old.initialization_started_at is not null and
    (new.amount_minor, new.currency, new.mode, new.reference, new.customer_email, new.title, new.scope, new.terms, new.initialization_started_at)
    is distinct from
    (old.amount_minor, old.currency, old.mode, old.reference, old.customer_email, old.title, old.scope, old.terms, old.initialization_started_at)
  then raise exception 'An initialized order cannot be repriced or reset'; end if;
  if old.status = 'paid' and (new.status, new.paid_at, new.transaction_id) is distinct from (old.status, old.paid_at, old.transaction_id)
  then raise exception 'Payment confirmation is immutable'; end if;
  return new;
end; $$;
revoke all on function public.protect_payment_order() from public, anon, authenticated;
drop trigger if exists protect_payment_order on public.payment_orders;
create trigger protect_payment_order before update on public.payment_orders
for each row execute function public.protect_payment_order();

create or replace function public.record_order_payment(
  p_reference text, p_transaction_id text, p_amount bigint, p_currency text, p_mode text, p_paid_at timestamptz
) returns void language plpgsql security invoker set search_path = '' as $$
declare target public.payment_orders;
begin
  select * into target from public.payment_orders where reference = p_reference for update;
  if not found or target.amount_minor <> p_amount or target.currency <> p_currency or target.mode <> p_mode
    or target.initialization_started_at is null or p_paid_at is null or p_transaction_id !~ '^[0-9]+$'
  then raise exception 'Payment does not match the order'; end if;
  if target.status = 'paid' then
    if target.transaction_id <> p_transaction_id then raise exception 'Conflicting payment'; end if;
    return;
  end if;
  update public.payment_orders set status = 'paid', paid_at = p_paid_at, transaction_id = p_transaction_id
  where id = target.id;
end; $$;
revoke all on function public.record_order_payment(text,text,bigint,text,text,timestamptz) from public, anon, authenticated;
grant execute on function public.record_order_payment(text,text,bigint,text,text,timestamptz) to service_role;
commit;
