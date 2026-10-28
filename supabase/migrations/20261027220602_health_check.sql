-- Función mínima para que /api/health compruebe la conexión con la base de datos.
create or replace function public.health_check()
returns integer
language sql
stable
security invoker
set search_path = ''
as $$
  select 1;
$$;

revoke all on function public.health_check() from public;
grant execute on function public.health_check() to anon, authenticated;
