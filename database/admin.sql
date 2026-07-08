insert into storage.buckets (id, name, public)
values ('verificaciones', 'verificaciones', true)
on conflict (id) do nothing;

create policy "Lectura publica de verificaciones"
on storage.objects for select
using (bucket_id = 'verificaciones');

create policy "Subida publica a verificaciones"
on storage.objects for insert
with check (bucket_id = 'verificaciones');